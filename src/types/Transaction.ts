import { Timestamp } from 'firebase/firestore';

export interface SubCategory {
  name: string;
  color: string;
  id: string;
}
export interface Category {
  name: string;
  color: string;
  currency: string;
  currencyCode: string;
  id: string;
  isUsdValue: boolean;
  subcategory?: SubCategory;
  subcategories?: SubCategory[];
}

export const emptyCategory: Category = {
  name: '',
  color: '',
  currency: '$',
  currencyCode: '',
  id: '',
  isUsdValue: false,
};

export interface Transaction {
  income: boolean;
  category: Category;
  amount: number;
  date: Timestamp;
  description: string;
  id?: string;
  userId?: string;
  saving?: boolean;
}
