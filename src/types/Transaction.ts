import { Timestamp } from 'firebase/firestore';

export interface Category {
  name: string;
  color: string;
  currency: string;
  id: string;
  isUSDValue: boolean;
}

export interface Transaction {
  income: boolean;
  category: Category;
  amount: number;
  date: Timestamp;
  description: string;
  id?: string;
  userId?: string;
}
