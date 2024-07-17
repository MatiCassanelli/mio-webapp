import { db } from 'firestore/config';
import { Category } from 'types/Transaction';
import {
  collection as firestoreCollection,
  query as firestoreQuery,
  getDocs,
} from 'firebase/firestore';

const collectionName = 'categories';
const collection = firestoreCollection(db, collectionName);

export const getAllCategories = async () => {
  try {
    const q = firestoreQuery(collection);
    const documents = await getDocs(q);
    return documents.docs.map((x) => ({
      ...(x.data() as Category),
      id: x.id,
    }));
  } catch (error) {
    throw error;
  }
};
