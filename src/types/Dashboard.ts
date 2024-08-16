import { Category, SubCategory } from './Transaction';

export interface MonthlyTotal {
  monthYear: string;
  incomingTotal: number;
  outgoingTotal: number;
}

export interface SubCategoryTotal {
  total: number;
  subcategory: SubCategory;
}

export interface CategoryTotal {
  total: number;
  category: Category;
  subcategories: SubCategoryTotal[];
}
