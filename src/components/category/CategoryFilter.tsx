import { useContext, useMemo } from 'react';
import { Transaction } from 'types/Transaction';
import { CategoryContext } from 'context/CategoryContext';
import { CategorySelector } from 'components/form/CategorySelector';
import { Paper } from '@mui/material';
import { colors } from 'theme';

interface CategoryFilterProps {
  transactions: Transaction[];
}

export const CategoryFilter = ({ transactions }: CategoryFilterProps) => {
  const {
    categories,
    selectedCategory,
    selectedSubCategory,
    onCategoryClick,
    onSubCategoryClick,
    setSelectedSubCategory,
  } = useContext(CategoryContext);

  const filteredCategories = useMemo(() => {
    const categoryIds = new Set(transactions.map((t) => t.category.id));
    return (categories ?? []).filter((cat) => categoryIds.has(cat.id));
  }, [categories, transactions]);

  if (!transactions.length) return null;

  return (
    <Paper
      elevation={0}
      sx={{
        bgcolor: colors.surfaceContainerLowest,
        borderRadius: 3,
        p: { xs: 2, md: 2.5 },
        mb: 2,
        boxShadow: '0 12px 32px -4px rgba(11,28,48,0.06)',
      }}
    >
      <CategorySelector
        categories={filteredCategories}
        selectedCategoryId={selectedCategory?.id}
        selectedSubcategoryId={selectedSubCategory?.id}
        onCategorySelect={(cat) => {
          setSelectedSubCategory(undefined);
          onCategoryClick(cat);
        }}
        onSubcategorySelect={(id) => {
          const sub = selectedCategory?.subcategories?.find((s) => s.id === id);
          if (sub) onSubCategoryClick(sub);
        }}
      />
    </Paper>
  );
};
