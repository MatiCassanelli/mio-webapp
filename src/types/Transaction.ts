import { Timestamp } from "firebase/firestore";

export interface Category {
  name: string;
  color: string;
  currency: string;
}

export interface Transaction {
  income: boolean;
  category: Category;
  amount: number;
  date: Timestamp;
  description: string;
  id: string;
}
