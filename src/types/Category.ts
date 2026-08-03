/**
 * Why the money moved. Has no currency or account of its own:
 * applies the same regardless of which Account was used to pay.
 */
export type CategoryKind = 'income' | 'expense' | 'both';

export interface SubCategory {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  /** Absent on shared base Categories; set to the creator's uid on Categories made through the app. */
  userId?: string;
  name: string;
  color: string;
  kind: CategoryKind;
  archived: boolean;
  order: number;
  subcategories?: SubCategory[];
}

/** Snapshot of the Category stored inside each Transaction. */
export interface CategoryRef {
  id: string;
  name: string;
  color: string;
  subcategory?: SubCategory;
}

export const categoryRef = (
  category: Category,
  subcategory?: SubCategory,
): CategoryRef => ({
  id: category.id,
  name: category.name,
  color: category.color,
  ...(subcategory ? { subcategory } : {}),
});

export const appliesTo = (category: Category, kind: 'income' | 'expense') =>
  category.kind === kind || category.kind === 'both';

/** Suggested palette when creating a Category — any other color can be picked. */
export const CATEGORY_COLORS = [
  '#e67e22',
  '#3498db',
  '#9b59b6',
  '#d4506a',
  '#006c49',
  '#088a61',
  '#e0a800',
  '#16a085',
  '#5d6d9e',
  '#737686',
];
