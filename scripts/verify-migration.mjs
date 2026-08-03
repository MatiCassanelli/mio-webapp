import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (!process.env.FIRESTORE_EMULATOR_HOST) {
  console.error('Corrélo contra el emulador, no contra producción.');
  process.exit(1);
}

initializeApp({ credential: applicationDefault(), projectId: 'mio-app-dev' });
const db = getFirestore();

const snap = await db.collection('transactions').get();
const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
const byId = Object.fromEntries(docs.map((d) => [d.id, d]));

const counts = {};
docs.forEach((d) => (counts[d.type] = (counts[d.type] ?? 0) + 1));

console.log('total documentos:', docs.length);
console.log('por type:', counts);
console.log('marcados saving:', docs.filter((d) => d.saving).length);
console.log('');
console.log('sin schemaVersion :', docs.filter((d) => !d.schemaVersion).length);
console.log('con `income` viejo:', docs.filter((d) => 'income' in d).length);
console.log('con `category`    :', docs.filter((d) => 'category' in d).length);
console.log('sin account.id    :', docs.filter((d) => !d.account?.id).length);
console.log('account sin type  :', docs.filter((d) => !d.account?.type).length);

const transfers = docs.filter((d) => d.type === 'transfer');
const broken = transfers.filter((d) => {
  const other = byId[d.linkedTransactionId];
  return (
    !other ||
    other.linkedTransactionId !== d.id ||
    other.type !== 'transfer' ||
    !d.transfer?.direction ||
    other.transfer?.direction === d.transfer?.direction ||
    other.transfer?.counterpartAccount?.id !== d.account?.id
  );
});
const out = transfers.filter((d) => d.transfer?.direction === 'out').length;
console.log('');
console.log(`transferencias: ${transfers.length} patas = ${out} pares`);
console.log('con link roto :', broken.length);
broken.slice(0, 5).forEach((d) => console.log('   ', d.id, d.description));

// Per-account counts against table 4.2 of the migration plan.
const EXPECTED = {
  'ars-efectivo': 48,
  'ars-transferencia': 183,
  'usd-efectivo': 188,
  'usd-wise': 176,
  'eur-efectivo': 14,
  'eur-tarjeta': 56,
  'btc-wallet': 3,
  'eth-wallet': 1,
  'usdt-wallet': 156,
};

// The balance starts at each account's opening balance, same as in the app.
const accountDocs = await db.collection('accounts').get();
const perAccount = Object.fromEntries(
  accountDocs.docs.map((d) => [d.id, { n: 0, balance: d.data().openingBalance ?? 0 }]),
);

docs.forEach((d) => {
  const id = d.account.id;
  const signed =
    d.type === 'income'
      ? d.amount
      : d.type === 'expense'
        ? -d.amount
        : d.transfer?.direction === 'in'
          ? d.amount
          : -d.amount;
  const entry = (perAccount[id] ??= { n: 0, balance: 0 });
  entry.n += 1;
  entry.balance += signed;
});

console.log('\ncuenta                movs  (plan)   saldo');
Object.keys(EXPECTED).forEach((id) => {
  const { n = 0, balance = 0 } = perAccount[id] ?? {};
  const ok = n === EXPECTED[id] ? ' ' : '✗';
  const amount = balance.toLocaleString('es-ar', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  console.log(
    `${ok} ${id.padEnd(20)} ${String(n).padStart(4)}  ${String(EXPECTED[id]).padStart(5)}  ${amount.padStart(16)}`,
  );
});

const unexpected = Object.keys(perAccount).filter((id) => !(id in EXPECTED));
if (unexpected.length) console.log('cuentas inesperadas:', unexpected);

console.log('\nejemplos de transferencia:');
transfers
  .filter((d) => d.transfer?.direction === 'out')
  .slice(0, 3)
  .forEach((d) => {
    const pair = byId[d.linkedTransactionId];
    console.log(
      `  ${d.account.name} ${d.amount} → ${pair.account.name} ${pair.amount}  |  ${d.description.slice(0, 60)}`,
    );
  });
