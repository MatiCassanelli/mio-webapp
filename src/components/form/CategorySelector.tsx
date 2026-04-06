import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import { Category, SubCategory } from 'types/Transaction';
import { CategoryPill } from './CategoryPill';
import { groupCategoriesByCurrency } from 'utils/groupCategoriesByCurrency';

interface CategorySelectorProps {
  categories: Category[];
  selectedCategoryId?: string;
  selectedSubcategoryId?: string;
  onCategorySelect: (cat: Category) => void;
  onSubcategorySelect: (subcategoryId: string) => void;
  disabled?: boolean;
  getCategoryDisabled?: (cat: Category) => boolean;
  getSubcategoryDisabled?: (sub: SubCategory) => boolean;
}

export const CategorySelector = ({
  categories,
  selectedCategoryId,
  selectedSubcategoryId,
  onCategorySelect,
  onSubcategorySelect,
  disabled,
  getCategoryDisabled,
  getSubcategoryDisabled,
}: CategorySelectorProps) => {
  const { byCurrency, currencies } = groupCategoriesByCurrency(categories);
  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

  return (
    <Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {currencies.map((currency) => (
          <Box
            sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}
            key={currency}
          >
            {byCurrency[currency].map((cat) => (
              <CategoryPill
                key={cat.id}
                label={cat.name}
                color={cat.color}
                selected={selectedCategoryId === cat.id}
                disabled={disabled || getCategoryDisabled?.(cat)}
                onClick={() => onCategorySelect(cat)}
              />
            ))}
          </Box>
        ))}
      </Box>

      {selectedCategory?.subcategories &&
        selectedCategory.subcategories.length > 0 && (
          <Box
            sx={{
              mt: 1,
              p: 1.5,
              borderRadius: 2,
              border: `1px solid ${alpha(selectedCategory.color, 0.2)}`,
              bgcolor: alpha(selectedCategory.color, 0.04),
            }}
          >
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              {selectedCategory.subcategories.map((sub) => (
                <CategoryPill
                  key={sub.id}
                  label={sub.name}
                  color={sub.color}
                  selected={selectedSubcategoryId === sub.id}
                  small
                  disabled={disabled || getSubcategoryDisabled?.(sub)}
                  onClick={() => onSubcategorySelect(sub.id)}
                />
              ))}
            </Box>
          </Box>
        )}
    </Box>
  );
};
