import { getDocuments } from '../firebase/db';
import { Transaction } from '../types/Transaction';

const collectionName = 'transactions';

export const getAllTransactions = async () => {
  try {
    const documents = await getDocuments(collectionName);
    return documents.docs.map((x) => ({
      ...(x.data() as Transaction),
      id: x.id,
    }));
  } catch (error) {
    throw error;
  }
};
