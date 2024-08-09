import { httpsCallable } from 'firebase/functions';
import { functions } from 'firestore/config';
import { Category, SubCategory } from 'types/Transaction';

interface calculateYearlyTotalsResponse {
  data: {
    categoryTotals: {
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
    monthlyTotals: {
      month: string;
      incomingTotal: number;
      outgoingTotal: number;
    }[];
  };
}

const calculateYearlyTotals = httpsCallable(functions, 'calculateYearlyTotals');

export const getYearlyTotals = async (userId: string) => {
  try {
    const result = (await calculateYearlyTotals({
      userId,
    })) as calculateYearlyTotalsResponse;
    const { monthlyTotals, categoryTotals } = result.data;
    const parsedMonthlyTotals = monthlyTotals.map((x) => x);
    const parsedCategoryTotals = Object.values(categoryTotals).map((x) => ({
      ...x,
      subcategories: Object.values(x.subcategories),
    }));
    return {
      monthlyTotals: parsedMonthlyTotals,
      categoryTotals: parsedCategoryTotals,
    };
  } catch (error) {
    throw error;
  }
};
