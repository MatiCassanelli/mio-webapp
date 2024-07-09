export interface Category {
  name: string;
  color: string;
  currency: string;
}

export interface Transaction {
  income: boolean;
  category: Category;
  amount: number;
  date: Date;
  description: string;
  id: string;
}
