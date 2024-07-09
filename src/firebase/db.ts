import {
  collection as firestoreCollection,
  doc,
  getDoc,
  getDocs,
  query as firestoreQuery,
  QueryFieldFilterConstraint,
  setDoc,
  WithFieldValue,
  DocumentData,
  addDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from './config';

export const getDocuments = async (
  collectionName: string,
  query: QueryFieldFilterConstraint[] = []
) => {
  const collection = firestoreCollection(db, collectionName);
  const q = firestoreQuery(collection, ...query);
  const querySnapshot = await getDocs(q);
  return querySnapshot;
};

export const getDocumentById = async (collectionName: string, id: string) => {
  const docRef = doc(db, collectionName, id);
  const docSnap = await getDoc(docRef);
  return docSnap;
};

export const createDocument = async (
  collectionName: string,
  newData: WithFieldValue<DocumentData>
) => {
  const docRef = firestoreCollection(db, collectionName);
  return await addDoc(docRef, newData);
};

export const editDocument = async (
  collectionName: string,
  id: string,
  data: WithFieldValue<DocumentData>
) => {
  const docRef = doc(db, collectionName, id);
  return await setDoc(docRef, data, { merge: true });
};

export const deleteDocument = async (collectionName: string, id: string) => {
  const docRef = doc(db, collectionName, id);
  return await deleteDoc(docRef);
};
