/**
 * Rewrites every `transactions` document from the old category/subcategory shape
 * to the new Account shape (migration-refactor-plan.md §5).
 *
 *   node scripts/migrate-transactions.mjs            # dry run: counts only
 *   node scripts/migrate-transactions.mjs --commit   # write
 *
 * Idempotent: documents that already carry `schemaVersion` are skipped, so an
 * interrupted run can simply be repeated.
 *
 * Run `node scripts/seed.mjs --commit` first, and take a backup before committing:
 *   gcloud firestore export gs://<bucket>/backups/pre-accounts-migration-$(date +%F)
 */

import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { ACCOUNT_MAP, ACCOUNTS_BY_ID, accountRef } from './seed-data.mjs';

const commit = process.argv.includes('--commit');
const projectId = process.env.FIREBASE_PROJECT || 'mio-app-dev';

initializeApp({ credential: applicationDefault(), projectId });
const db = getFirestore();

/** Two legs of the same historical Buy/Sell: same instant, same text, opposite sign. */
const pairKey = (t) => `${t.date.toMillis()}|${t.description}`;

const migrate = async () => {
  const snapshot = await db.collection('transactions').get();
  const pending = snapshot.docs.filter((doc) => !doc.data().schemaVersion);

  const unmapped = [];
  const resolved = pending.map((doc) => {
    const data = doc.data();
    const key = `${data.category?.id}|${data.category?.subcategory?.id ?? ''}`;
    const accountId = ACCOUNT_MAP[key];
    if (!accountId) unmapped.push(`${doc.id}: ${key}`);
    return { id: doc.id, ref: doc.ref, data, accountId, income: !!data.income };
  });

  if (unmapped.length) {
    throw new Error(`Sin mapeo de cuenta para ${unmapped.length} documentos:\n  ${unmapped.join('\n  ')}`);
  }

  const groups = new Map();
  resolved.forEach((t) => {
    const key = pairKey(t.data);
    groups.set(key, [...(groups.get(key) ?? []), t]);
  });

  /** docId → the other leg */
  const linked = new Map();
  groups.forEach((group) => {
    if (group.length === 2 && group[0].income !== group[1].income) {
      linked.set(group[0].id, group[1]);
      linked.set(group[1].id, group[0]);
    }
  });

  console.log(`Proyecto: ${projectId}`);
  console.log(`Documentos totales: ${snapshot.size}`);
  console.log(`A migrar: ${resolved.length} (${snapshot.size - resolved.length} ya migrados)`);
  console.log(`Pares de transferencia detectados: ${linked.size / 2}`);
  console.log(`Marcados como ahorro: ${resolved.filter((t) => t.data.saving).length}`);

  if (!commit) {
    console.log('\nDry run. Volvé a correr con --commit para escribir.');
    return;
  }

  // 825 documents exceed the 500-operation batch limit: BulkWriter splits it automatically.
  const writer = db.bulkWriter();

  resolved.forEach((t) => {
    const counterpart = linked.get(t.id);
    const account = accountRef(ACCOUNTS_BY_ID[t.accountId]);

    writer.update(t.ref, {
      account,
      type: counterpart ? 'transfer' : t.income ? 'income' : 'expense',
      saving: !!t.data.saving,
      schemaVersion: 2,
      income: FieldValue.delete(),
      // The old `category` was actually the Account: it gets deleted instead of carried over.
      // There are no real categories to retroactively assign, so it's left absent.
      category: FieldValue.delete(),
      ...(counterpart
        ? {
            linkedTransactionId: counterpart.id,
            transfer: {
              direction: t.income ? 'in' : 'out',
              counterpartAccount: accountRef(ACCOUNTS_BY_ID[counterpart.accountId]),
            },
          }
        : {}),
      // `category` stays as-is: there are no real categories to retroactively assign.
    });
  });

  await writer.close();
  console.log('\nListo.');
};

migrate().catch((error) => {
  console.error(error.message ?? error);
  process.exit(1);
});
