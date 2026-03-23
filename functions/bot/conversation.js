/**
 * conversation.js
 * Manages pending conversation state in Firestore.
 * Each pending conversation is stored in the `pendingTransactions` collection
 * with a TTL to auto-expire unfinished flows.
 */

import { getFirestore, Timestamp } from 'firebase-admin/firestore';

const COLLECTION = 'pendingTransactions';
const TTL_MINUTES = 10;

/**
 * Returns the active pending conversation for a phone number, or null if expired/not found.
 * @param {string} phoneNumber
 * @returns {Promise<Object|null>}
 */
async function getPendingConversation(phoneNumber) {
  const db = getFirestore();
  const snapshot = await db
    .collection(COLLECTION)
    .where('phoneNumber', '==', phoneNumber)
    .where('expiresAt', '>', Timestamp.now())
    .limit(1)
    .get();

  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
}

/**
 * Creates or updates the pending conversation for a phone number.
 * @param {string} phoneNumber
 * @param {string} userId
 * @param {Object} data - { status, transactions, pendingQuestions }
 */
async function savePendingConversation(phoneNumber, userId, data) {
  const db = getFirestore();
  const expiresAt = Timestamp.fromDate(new Date(Date.now() + TTL_MINUTES * 60 * 1000));

  const existing = await getPendingConversation(phoneNumber);

  if (existing) {
    await db.collection(COLLECTION).doc(existing.id).update({ ...data, expiresAt });
  } else {
    await db.collection(COLLECTION).add({
      phoneNumber,
      userId,
      ...data,
      createdAt: Timestamp.now(),
      expiresAt,
    });
  }
}

/**
 * Deletes all pending conversations for a phone number.
 * @param {string} phoneNumber
 */
async function clearPendingConversation(phoneNumber) {
  const db = getFirestore();
  const snapshot = await db.collection(COLLECTION).where('phoneNumber', '==', phoneNumber).get();

  if (snapshot.empty) return;

  const batch = db.batch();
  snapshot.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
}

export { getPendingConversation, savePendingConversation, clearPendingConversation };
