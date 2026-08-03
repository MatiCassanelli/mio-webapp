import {
  collection as firestoreCollection,
  query as firestoreQuery,
  onSnapshot,
  orderBy,
  doc,
  updateDoc,
  FirestoreError,
} from 'firebase/firestore';
import { Currency } from 'types/Currency';
import { db } from 'firestore/config';

const collectionName = 'currencies';
const collection = firestoreCollection(db, collectionName);

export const getCurrenciesSnapshot = ({
  onSuccess,
  onError,
}: {
  onSuccess: (currencies: Currency[]) => void;
  onError?: (error: FirestoreError) => void;
}) => {
  const q = firestoreQuery(collection, orderBy('order', 'asc'));
  return onSnapshot(
    q,
    (snapshot) =>
      onSuccess(
        snapshot.docs.map((x) => ({ ...(x.data() as Currency), code: x.id })),
      ),
    onError,
  );
};

/** How many units of `code` equal 1 USD. Set by the user by hand. */
export const updateUsdRate = async (code: string, usdRate: number) =>
  updateDoc(doc(db, collectionName, code), { usdRate });
