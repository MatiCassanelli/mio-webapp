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
    totalsByMonthAndYear: {
      monthYear: string;
      incomingTotal: number;
      outgoingTotal: number;
    }[];
  };
}

const getTotals = httpsCallable(functions, 'getTotals');

export const getYearlyTotals = async (userId: string, year: number) => {
  try {
    const result = (await getTotals({
      userId,
      year,
    })) as calculateYearlyTotalsResponse;
    const { totalsByMonthAndYear, categoryTotals } = result.data;
    console.log(totalsByMonthAndYear, categoryTotals)
    // const { totalsByMonthAndYear, categoryTotals } = mockData;
    const parsedCategoryTotals = Object.values(categoryTotals).map((x) => ({
      ...x,
      subcategories: Object.values(x.subcategories),
    }));
    return {
      totalsByMonthAndYear,
      categoryTotals: parsedCategoryTotals,
    };
  } catch (error) {
    throw error;
  }
};
