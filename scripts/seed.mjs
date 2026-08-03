/**
 * Seeds `currencies` and `accounts`, and moves the legacy `categories` documents
 * out of the way so the collection name can be reused by real Categories.
 *
 *   node scripts/seed.mjs              # dry run
 *   node scripts/seed.mjs --commit     # write
 *
 * The legacy documents are copied verbatim into `legacyCategories` before being
 * removed from `categories`, so a rollback only needs to copy them back.
 */

import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { CURRENCIES, ACCOUNTS } from './seed-data.mjs';

const commit = process.argv.includes('--commit');
const projectId = process.env.FIREBASE_PROJECT || 'mio-app-dev';

initializeApp({ credential: applicationDefault(), projectId });
const db = getFirestore();

const seed = async () => {
  const legacy = await db.collection('categories').get();
  const alreadyBackedUp = (await db.collection('legacyCategories').limit(1).get()).size > 0;

  console.log(`Proyecto: ${projectId}`);
  console.log(`Monedas a escribir: ${CURRENCIES.length}`);
  console.log(`Cuentas a escribir: ${ACCOUNTS.length}`);
  console.log(
    `Categorías legacy: ${legacy.size}` +
      (alreadyBackedUp ? ' (legacyCategories ya tiene documentos, no se sobreescribe)' : ''),
  );

  if (!commit) {
    console.log('\nDry run. Volvé a correr con --commit para escribir.');
    return;
  }

  const batch = db.batch();

  CURRENCIES.forEach((currency) => {
    batch.set(db.collection('currencies').doc(currency.code), currency);
  });

  ACCOUNTS.forEach((account) => {
    const { id, ...data } = account;
    batch.set(db.collection('accounts').doc(id), { ...data, archived: false });
  });

  if (!alreadyBackedUp) {
    legacy.docs.forEach((doc) => {
      batch.set(db.collection('legacyCategories').doc(doc.id), doc.data());
    });
  }
  legacy.docs.forEach((doc) => batch.delete(doc.ref));

  await batch.commit();
  console.log('\nListo. `categories` quedó vacía para las Categorías reales.');
};

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
