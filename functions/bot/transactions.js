/**
 * transactions.js
 * Handles reading user data, writing transactions to Firestore,
 * and querying account balances (Option A: targeted query).
 */

import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { toLocaleAmount } from './utils.js';

const SCHEMA_VERSION = 2;

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
 * Finds a user by their Telegram chat ID.
 * @param {string} chatId
 * @returns {Promise<Object|null>}
 */
async function getUserByTelegramId(chatId) {
  const db = getFirestore();
  const snapshot = await db
    .collection('users')
    .where('telegramChatId', '==', chatId)
    .limit(1)
    .get();

  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
}

/**
 * Links a Telegram chat ID to a user account by email.
 * Looks up the user in Firebase Auth, then saves telegramChatId to their Firestore document.
 * @param {string} email
 * @param {string} chatId
 * @returns {Promise<boolean>} - false if email not found
 */
async function linkTelegramUser(email, chatId) {
  let authUser;
  try {
    authUser = await getAuth().getUserByEmail(email.trim().toLowerCase());
  } catch {
    return false;
  }

  await getFirestore().collection('users').doc(authUser.uid).set({ telegramChatId: chatId }, { merge: true });
  return true;
}

/**
 * Fetches all non-archived accounts visible to `userId` — shared base accounts
 * (no `userId` field) plus this user's own — indexed by ID for fast lookup.
 * @param {string} userId
 * @returns {Promise<Object>} - { [accountId]: accountData }
 */
async function getAccountsMap(userId) {
  const db = getFirestore();
  const snapshot = await db.collection('accounts').get();

  const map = {};
  snapshot.docs.forEach((doc) => {
    const data = doc.data();
    if (data.archived) return;
    if (data.userId && data.userId !== userId) return;
    map[doc.id] = { id: doc.id, ...data };
  });
  return map;
}

/**
 * Fetches all accounts as an array (for passing to the Claude parser as context).
 * @param {string} userId
 * @returns {Promise<Array>}
 */
async function getAccountsList(userId) {
  return Object.values(await getAccountsMap(userId));
}

/** The snapshot embedded into every transaction. Mirrors `accountRef` in the webapp. */
function accountRef(account) {
  return {
    id: account.id,
    name: account.name,
    currencyCode: account.currencyCode,
    color: account.color,
    type: account.type,
  };
}

/**
 * Writes a set of parsed transactions to Firestore in a single batch.
 *
 * Exchanges arrive as two legs sharing a `transferGroup`: they become a single
 * transfer with both legs cross-linked, so moving money between the user's own
 * accounts never inflates income or expense.
 *
 * @param {string} userId
 * @param {Array} parsedTransactions - [{ amount, type, accountId, description, transferGroup? }]
 * @param {Object} accountsMap - Result of getAccountsMap
 */
async function writeTransactions(userId, parsedTransactions, accountsMap) {
  const db = getFirestore();
  const batch = db.batch();
  const date = Timestamp.now();

  const prepared = parsedTransactions.map((t) => {
    const account = accountsMap[t.accountId];
    if (!account) throw new Error(`Account ${t.accountId} not found`);
    return { ...t, account, ref: db.collection('transactions').doc() };
  });

  // Pair up the legs of each exchange by their transferGroup.
  const groups = {};
  prepared.forEach((t) => {
    if (!t.transferGroup) return;
    (groups[t.transferGroup] = groups[t.transferGroup] || []).push(t);
  });

  const counterparts = new Map();
  Object.values(groups).forEach((group) => {
    if (group.length !== 2) return;
    counterparts.set(group[0], group[1]);
    counterparts.set(group[1], group[0]);
  });

  prepared.forEach((t) => {
    const counterpart = counterparts.get(t);
    batch.set(t.ref, {
      userId,
      amount: t.amount,
      description: t.description,
      date,
      saving: false,
      account: accountRef(t.account),
      schemaVersion: SCHEMA_VERSION,
      ...(counterpart
        ? {
            type: 'transfer',
            transfer: {
              direction: t.type === 'transfer_in' ? 'in' : 'out',
              counterpartAccount: accountRef(counterpart.account),
            },
            linkedTransactionId: counterpart.ref.id,
          }
        : { type: t.type === 'income' ? 'income' : 'expense' }),
    });
  });

  await batch.commit();
}

/** How much a transaction adds to or subtracts from its account's balance. */
function signedAmount(data) {
  // `income` only survives on documents the migration has not reached yet.
  const type = data.type || (data.income ? 'income' : 'expense');
  if (type === 'income') return data.amount;
  if (type === 'expense') return -data.amount;
  return data.transfer?.direction === 'in' ? data.amount : -data.amount;
}

/**
 * Returns the current balance for a specific account (Option A).
 * Reads only transactions matching userId + accountId.
 *
 * `openingBalance` is the money that was already in the account before mio
 * started tracking it. The webapp counts it the same way — leaving it out here
 * would make the bot report a different number than the screen.
 *
 * @param {string} userId
 * @param {string} accountId
 * @param {number} openingBalance
 * @returns {Promise<number>}
 */
async function getAccountBalance(userId, accountId, openingBalance = 0) {
  const db = getFirestore();

  const snapshot = await db
    .collection('transactions')
    .where('userId', '==', userId)
    .where('account.id', '==', accountId)
    .get();

  return snapshot.docs.reduce(
    (acc, doc) => acc + signedAmount(doc.data()),
    openingBalance,
  );
}

/**
 * Builds a formatted balance summary for every account involved in a set of
 * transactions.
 *
 * @param {string} userId
 * @param {Array} transactions - The parsed transactions that were just written
 * @param {Object} accountsMap
 * @returns {Promise<string>}
 */
async function buildBalanceSummary(userId, transactions, accountsMap) {
  const uniqueIds = [...new Set(transactions.map((t) => t.accountId))];

  const lines = await Promise.all(
    uniqueIds.map(async (accountId) => {
      const account = accountsMap[accountId];
      const balance = await getAccountBalance(
        userId,
        accountId,
        account?.openingBalance ?? 0,
      );
      const label = account?.name || accountId;
      return `  ${label}: ${toLocaleAmount(balance)} ${account?.currencyCode || ''}`;
    }),
  );

  return lines.join('\n');
}

export {
  getUserByPhone,
  getUserByTelegramId,
  linkTelegramUser,
  getAccountsMap,
  getAccountsList,
  writeTransactions,
  getAccountBalance,
  buildBalanceSummary,
};
