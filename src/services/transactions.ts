import { orderBy, QueryFieldFilterConstraint } from 'firebase/firestore';
import { getDocuments } from '../firebase/db';
import { Transaction } from '../types/Transaction';

const collectionName = 'transactions';

export const getAllTransactions = async (
  query: QueryFieldFilterConstraint[] = []
) => {
  try {
    const documents = await getDocuments(
      collectionName,
      query,
      orderBy('date', 'desc')
    );
    return documents.docs.map((x) => ({
      ...(x.data() as Transaction),
      id: x.id,
    }));
  } catch (error) {
    throw error;
  }
};
