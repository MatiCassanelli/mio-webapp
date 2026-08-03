import {
  collection as firestoreCollection,
  query as firestoreQuery,
  onSnapshot,
  orderBy,
  doc,
  addDoc,
  updateDoc,
  FirestoreError,
} from 'firebase/firestore';
import { Category } from 'types/Category';
import { db } from 'firestore/config';

const collectionName = 'categories';
const collection = firestoreCollection(db, collectionName);

/**
 * Every Category, shared base ones and every user's own. Visibility (shared +
 * mine, hiding everyone else's) is a client-side filter in `DataContext`, not
 * a query — Firestore can't express "no `userId`, or `userId` == mine" in one
 * query without a second listener.
 */
export const getCategoriesSnapshot = ({
  onSuccess,
  onError,
}: {
  onSuccess: (categories: Category[]) => void;
  onError?: (error: FirestoreError) => void;
}) => {
  const q = firestoreQuery(collection, orderBy('order', 'asc'));
  return onSnapshot(
    q,
    (snapshot) =>
      onSuccess(
        snapshot.docs.map((x) => ({ ...(x.data() as Category), id: x.id })),
      ),
    onError,
  );
};

export const createCategory = async (category: Omit<Category, 'id'>) => {
  const document = await addDoc(collection, category);
  return { ...category, id: document.id };
};

export const updateCategory = async (
  id: string,
  changes: Partial<Omit<Category, 'id'>>,
) => updateDoc(doc(db, collectionName, id), changes);

export const archiveCategory = async (id: string, archived = true) =>
  updateDoc(doc(db, collectionName, id), { archived });
