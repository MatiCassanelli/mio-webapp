import { httpsCallable } from 'firebase/functions';
import { functions } from 'firestore/config';
import { Category, SubCategory } from 'types/Transaction';
interface GetAllTotalsFunctionResponse {
  data: {
    [key: string]: {
      category: Category;
      total: number;
      subcategories: {
        [subKey: string]: {
          total: number;
          subcategory: SubCategory;
        };
      };
    };
  };
}

interface TotalByMonthAndYear {
  monthYear: string;
  incomingTotal: number;
  outgoingTotal: number;
}
interface GetMonthlyTotalsByCategoryFunctionResponse {
  data: TotalByMonthAndYear[];
}

const getAllTotalsFunction = httpsCallable(functions, 'getAllTotals');
const getMonthlyTotalsByCategoryFunction = httpsCallable(
  functions,
  'getMonthlyTotalsByCategory'
);

export const getAllTotals = async ({
  userId,
  year,
}: {
  userId: string;
  year: number;
}) => {
  try {
    const result = (await getAllTotalsFunction({
      userId,
      year,
    })) as GetAllTotalsFunctionResponse;
    const categoryTotals = result.data;
    const parsedCategoryTotals = Object.values(categoryTotals).map((x) => ({
      ...x,
      subcategories: Object.values(x.subcategories),
    }));
    return parsedCategoryTotals;
  } catch (error) {
    throw error;
  }
};
export const getMonthlyTotalsByCategory = async ({
  userId,
  year,
  category,
}: {
  userId: string;
  year: number;
  category: string;
}) => {
  try {
    const result = (await getMonthlyTotalsByCategoryFunction({
      userId,
      year,
      category,
    })) as GetMonthlyTotalsByCategoryFunctionResponse;
    return result.data;
  } catch (error) {
    throw error;
  }
};
