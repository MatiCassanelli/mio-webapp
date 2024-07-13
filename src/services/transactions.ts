import {
  collection as firestoreCollection,
  query as firestoreQuery,
  QueryFieldFilterConstraint,
  onSnapshot,
  QuerySnapshot,
  orderBy,
  FirestoreError,
  addDoc,
  getDocs,
} from 'firebase/firestore';
import { Transaction } from '../types/Transaction';
import { db } from '../firebase/config';

const collectionName = 'transactions';
const collection = firestoreCollection(db, collectionName);

export const getTransactionsSnapshot = ({
  filters = [],
  onSuccess,
  onError,
}: {
  onSuccess: (querySnapshot: QuerySnapshot) => void;
  onError?: (error: FirestoreError) => void;
  filters?: QueryFieldFilterConstraint[];
}) => {
  const query = firestoreQuery(collection, ...filters, orderBy('date', 'desc'));
  return onSnapshot(query, onSuccess, onError);
};

export const getAllTransactions = async (
  query: QueryFieldFilterConstraint[] = []
) => {
  try {
    const q = firestoreQuery(collection, ...query, orderBy('date', 'desc'));
    const documents = await getDocs(q);
    return documents.docs.map((x) => ({
      ...(x.data() as Transaction),
      id: x.id,
    }));
  } catch (error) {
    throw error;
  }
};

export const createTransaction = async (transaction: Transaction) => {
  try {
    const document = await addDoc(collection, transaction);
    return { ...transaction, id: document.id };
  } catch (error) {
    throw error;
  }
};
