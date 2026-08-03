/**
 * Copies real data into the emulator, so screens can be inspected with the
 * actual 825 transactions without touching production.
 *
 *   node scripts/snapshot.mjs dump    # production → scripts/.snapshot.json (read-only)
 *   npm run snapshot:load             # scripts/.snapshot.json → emulator
 *
 * This is two steps instead of one so the process reading production never
 * has the emulator configured, and vice versa: there's no way to write to
 * the wrong place because of a misconfigured environment variable.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

const COLLECTIONS = ['transactions', 'categories', 'accounts', 'currencies', 'users'];
const FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), '.snapshot.json');

const mode = process.argv[2];
const projectId = process.env.FIREBASE_PROJECT || 'mio-app-dev';
const emulator = process.env.FIRESTORE_EMULATOR_HOST;

/** Timestamps don't survive JSON.stringify: they're tagged so they can be reconstructed. */
const encode = (value) => {
  if (value instanceof Timestamp) {
    return { __timestamp__: { seconds: value.seconds, nanoseconds: value.nanoseconds } };
  }
  if (Array.isArray(value)) return value.map(encode);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, encode(v)]));
  }
  return value;
};

const decode = (value) => {
  if (value?.__timestamp__) {
    const { seconds, nanoseconds } = value.__timestamp__;
    return new Timestamp(seconds, nanoseconds);
  }
  if (Array.isArray(value)) return value.map(decode);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, decode(v)]));
  }
  return value;
};

const dump = async (db) => {
  if (emulator) {
    throw new Error('FIRESTORE_EMULATOR_HOST está seteado: `dump` lee de producción, corrélo sin esa variable.');
  }
  const data = {};
  for (const name of COLLECTIONS) {
    const snapshot = await db.collection(name).get();
    data[name] = snapshot.docs.map((doc) => ({ id: doc.id, data: encode(doc.data()) }));
    console.log(`${name}: ${snapshot.size}`);
  }
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
  console.log(`\nGuardado en ${FILE}`);
};

const load = async (db) => {
  if (!emulator) {
    throw new Error('`load` escribe: corrélo con FIRESTORE_EMULATOR_HOST apuntando al emulador (npm run snapshot:load).');
  }
  const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  const writer = db.bulkWriter();
  for (const [name, documents] of Object.entries(data)) {
    documents.forEach((document) => {
      writer.set(db.collection(name).doc(document.id), decode(document.data));
    });
    console.log(`${name}: ${documents.length}`);
  }
  await writer.close();
  console.log(`\nCargado en el emulador (${emulator}).`);
};

if (mode !== 'dump' && mode !== 'load') {
  console.error('Uso: node scripts/snapshot.mjs dump | load');
  process.exit(1);
}

initializeApp({ credential: applicationDefault(), projectId });

(mode === 'dump' ? dump : load)(getFirestore()).catch((error) => {
  console.error(error.message ?? error);
  process.exit(1);
});
