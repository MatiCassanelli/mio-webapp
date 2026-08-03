import {
  collection as firestoreCollection,
  query as firestoreQuery,
  onSnapshot,
  orderBy,
  doc,
  addDoc,
  updateDoc,
  writeBatch,
  FirestoreError,
} from 'firebase/firestore';
import { Account } from 'types/Account';
import { db } from 'firestore/config';

const collectionName = 'accounts';
const collection = firestoreCollection(db, collectionName);

/**
 * Every Account, shared base ones and every user's own. Visibility (shared +
 * mine, hiding everyone else's) is a client-side filter in `DataContext`, not
 * a query — Firestore can't express "no `userId`, or `userId` == mine" in one
 * query without a second listener.
 */
export const getAccountsSnapshot = ({
  onSuccess,
  onError,
}: {
  onSuccess: (accounts: Account[]) => void;
  onError?: (error: FirestoreError) => void;
}) => {
  const q = firestoreQuery(collection, orderBy('order', 'asc'));
  return onSnapshot(
    q,
    (snapshot) =>
      onSuccess(
        snapshot.docs.map((x) => ({ ...(x.data() as Account), id: x.id })),
      ),
    onError,
  );
};

export const createAccount = async (account: Omit<Account, 'id'>) => {
  const document = await addDoc(collection, account);
  return { ...account, id: document.id };
};

export const updateAccount = async (
  id: string,
  changes: Partial<Omit<Account, 'id'>>,
) => updateDoc(doc(db, collectionName, id), changes);

/** Soft delete: never a hard delete, so history never breaks. */
export const archiveAccount = async (id: string, archived = true) =>
  updateDoc(doc(db, collectionName, id), { archived });

export const reorderAccounts = async (accounts: Account[]) => {
  const batch = writeBatch(db);
  accounts.forEach((account, order) => {
    batch.set(doc(db, collectionName, account.id), { order }, { merge: true });
  });
  await batch.commit();
};

