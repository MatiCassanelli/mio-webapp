import {
  collection as firestoreCollection,
  query as firestoreQuery,
  where,
  onSnapshot,
  orderBy,
  FirestoreError,
  addDoc,
  getDoc,
  doc,
  setDoc,
  deleteDoc,
  writeBatch,
  Timestamp,
} from 'firebase/firestore';
import { SCHEMA_VERSION, Transaction } from 'types/Transaction';
import { AccountRef, accountRef } from 'types/Account';
import { db } from 'firestore/config';

const collectionName = 'transactions';
const collection = firestoreCollection(db, collectionName);

/**
 * The user's entire history in a single listener. It's hundreds of documents,
 * not thousands: fetching them all lets the accumulated balance and period
 * totals be a local calculation, with no round-trip on every period change.
 */
export const getUserTransactionsSnapshot = ({
  userId,
  onSuccess,
  onError,
}: {
  userId: string;
  onSuccess: (transactions: Transaction[]) => void;
  onError?: (error: FirestoreError) => void;
}) => {
  const q = firestoreQuery(
    collection,
    where('userId', '==', userId),
    orderBy('date', 'desc'),
  );
  return onSnapshot(
    q,
    (snapshot) =>
      onSuccess(
        snapshot.docs.map((x) => ({ ...(x.data() as Transaction), id: x.id })),
      ),
    onError,
  );
};

export const getTransaction = async (
  id: string,
): Promise<Transaction | null> => {
  const snapshot = await getDoc(doc(db, collectionName, id));
  if (!snapshot.exists()) return null;
  return { ...(snapshot.data() as Transaction), id: snapshot.id };
};

export const createTransaction = async (transaction: Transaction) => {
  const document = await addDoc(collection, {
    ...transaction,
    schemaVersion: SCHEMA_VERSION,
  });
  return { ...transaction, id: document.id };
};

export const editTransaction = async (transaction: Transaction) => {
  const docRef = doc(db, collectionName, transaction.id as string);
  return setDoc(
    docRef,
    { ...transaction, schemaVersion: SCHEMA_VERSION },
    { merge: true },
  );
};

/** Deletes the movement and, if it's a transfer, its other leg too. */
export const deleteTransaction = async (transaction: Transaction) => {
  if (!transaction.linkedTransactionId) {
    return deleteDoc(doc(db, collectionName, transaction.id as string));
  }
  const batch = writeBatch(db);
  batch.delete(doc(db, collectionName, transaction.id as string));
  batch.delete(doc(db, collectionName, transaction.linkedTransactionId));
  return batch.commit();
};

export interface TransferInput {
  userId: string;
  description: string;
  date: Timestamp;
  from: AccountRef;
  to: AccountRef;
  /** In `from`'s currency. */
  amountOut: number;
  /** In `to`'s currency. Equal to `amountOut` if they share a currency. */
  amountIn: number;
}

/**
 * Writes both legs of a transfer in a single batch, cross-linking them via
 * `linkedTransactionId`. Moving money between your own accounts is neither
 * income nor expense.
 */
export const createTransfer = async (input: TransferInput) => {
  const batch = writeBatch(db);
  const outRef = doc(collection);
  const inRef = doc(collection);

  const base = {
    userId: input.userId,
    description: input.description,
    date: input.date,
    type: 'transfer' as const,
    saving: false,
    schemaVersion: SCHEMA_VERSION,
  };

  batch.set(outRef, {
    ...base,
    amount: input.amountOut,
    account: accountRef(input.from),
    transfer: { direction: 'out', counterpartAccount: accountRef(input.to) },
    linkedTransactionId: inRef.id,
  });
  batch.set(inRef, {
    ...base,
    amount: input.amountIn,
    account: accountRef(input.to),
    transfer: { direction: 'in', counterpartAccount: accountRef(input.from) },
    linkedTransactionId: outRef.id,
  });

  await batch.commit();
  return { outId: outRef.id, inId: inRef.id };
};

/** Rewrites both legs of an existing transfer. */
export const editTransfer = async (
  outId: string,
  inId: string,
  input: TransferInput,
) => {
  const batch = writeBatch(db);
  const base = {
    userId: input.userId,
    description: input.description,
    date: input.date,
    type: 'transfer' as const,
    saving: false,
    schemaVersion: SCHEMA_VERSION,
  };

  batch.set(
    doc(db, collectionName, outId),
    {
      ...base,
      amount: input.amountOut,
      account: accountRef(input.from),
      transfer: { direction: 'out', counterpartAccount: accountRef(input.to) },
      linkedTransactionId: inId,
    },
    { merge: true },
  );
  batch.set(
    doc(db, collectionName, inId),
    {
      ...base,
      amount: input.amountIn,
      account: accountRef(input.to),
      transfer: { direction: 'in', counterpartAccount: accountRef(input.from) },
      linkedTransactionId: outId,
    },
    { merge: true },
  );

  await batch.commit();
};
