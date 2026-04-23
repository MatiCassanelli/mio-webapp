import { Category } from 'types/Transaction';

export const groupCategoriesByCurrency = (
  categories: Category[],
): { byCurrency: Record<string, Category[]>; currencies: string[] } => {
  const byCurrency = categories.reduce<Record<string, Category[]>>((acc, cat) => {
    const key = cat.currency ?? 'Otras';
    (acc[key] = acc[key] ?? []).push(cat);
    return acc;
  }, {});
  return { byCurrency, currencies: Object.keys(byCurrency) };
};
