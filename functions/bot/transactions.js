/**
 * transactions.js
 * Handles reading user data, writing transactions to Firestore,
 * and querying subcategory balances (Option A: targeted query).
 */

import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { toLocaleAmount } from './utils.js';

/**
 * Finds a user by their phone number.
 * Requires the `phoneNumber` field to be set on user documents.
 * @param {string} phoneNumber
 * @returns {Promise<Object|null>}
 */
async function getUserByPhone(phoneNumber) {
  const db = getFirestore();
  const snapshot = await db
    .collection('users')
    .where('phoneNumber', '==', phoneNumber)
    .limit(1)
    .get();

  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
}

/**
 * Fetches all categories, indexed by ID for fast lookup.
 * Categories are global (not per-user).
 * @returns {Promise<Object>} - { [categoryId]: categoryData }
 */
async function getCategoriesMap() {
  const db = getFirestore();
  const snapshot = await db.collection('categories').get();

  const map = {};
  snapshot.docs.forEach((doc) => {
    map[doc.id] = { id: doc.id, ...doc.data() };
  });
  return map;
}

/**
 * Fetches all categories as an array (for passing to the Claude parser as context).
 * @returns {Promise<Array>}
 */
async function getCategoriesList() {
  const db = getFirestore();
  const snapshot = await db.collection('categories').get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

/**
 * Writes a set of parsed transactions to Firestore in a single batch.
 * Builds the full Transaction object matching the webapp structure.
 *
 * @param {string} userId
 * @param {Array} parsedTransactions - [{ amount, income, categoryId, subcategoryId, description }]
 * @param {Object} categoriesMap - Result of getCategoriesMap
 */
async function writeTransactions(userId, parsedTransactions, categoriesMap) {
  const db = getFirestore();
  const batch = db.batch();

  parsedTransactions.forEach((t) => {
    const category = categoriesMap[t.categoryId];
    if (!category) throw new Error(`Category ${t.categoryId} not found`);

    const subcategory = t.subcategoryId
      ? (category.subcategories || []).find((s) => s.id === t.subcategoryId)
      : undefined;

    const transactionCategory = subcategory ? { ...category, subcategory } : category;

    const ref = db.collection('transactions').doc();
    batch.set(ref, {
      userId,
      amount: t.amount,
      income: t.income,
      description: t.description,
      category: transactionCategory,
      date: Timestamp.now(),
      saving: false,
    });
  });

  await batch.commit();
}

/**
 * Returns the current net balance for a specific category/subcategory (Option A).
 * Reads only transactions matching userId + categoryId [+ subcategoryId].
 *
 * @param {string} userId
 * @param {string} categoryId
 * @param {string|null} subcategoryId
 * @returns {Promise<number>}
 */
async function getSubcategoryBalance(userId, categoryId, subcategoryId) {
  const db = getFirestore();

  let query = db
    .collection('transactions')
    .where('userId', '==', userId)
    .where('category.id', '==', categoryId);

  if (subcategoryId) {
    query = query.where('category.subcategory.id', '==', subcategoryId);
  }

  const snapshot = await query.get();
  return snapshot.docs.reduce((acc, doc) => {
    const { amount, income } = doc.data();
    return income ? acc + amount : acc - amount;
  }, 0);
}

/**
 * Builds a formatted balance summary for all unique category/subcategory pairs
 * involved in a set of transactions.
 *
 * @param {string} userId
 * @param {Array} transactions - The parsed transactions that were just written
 * @param {Object} categoriesMap
 * @returns {Promise<string>}
 */
async function buildBalanceSummary(userId, transactions, categoriesMap) {
  // Deduplicate by categoryId + subcategoryId
  const seen = new Set();
  const unique = transactions.filter((t) => {
    const key = `${t.categoryId}__${t.subcategoryId || ''}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const lines = await Promise.all(
    unique.map(async (t) => {
      const category = categoriesMap[t.categoryId];
      const subcategory = t.subcategoryId
        ? (category?.subcategories || []).find((s) => s.id === t.subcategoryId)
        : null;

      const balance = await getSubcategoryBalance(userId, t.categoryId, t.subcategoryId);
      const label = subcategory
        ? `${category.name} ${subcategory.name}`
        : category?.name || t.categoryId;
      const formatted = toLocaleAmount(balance);
      return `  ${label}: ${formatted} ${category?.currencyCode || ''}`;
    }),
  );

  return lines.join('\n');
}

export {
  getUserByPhone,
  getCategoriesMap,
  getCategoriesList,
  writeTransactions,
  getSubcategoryBalance,
  buildBalanceSummary,
};
