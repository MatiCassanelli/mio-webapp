import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { Category, SubCategory } from 'types/Transaction';
import { CategoryPill } from './CategoryPill';
import { groupCategoriesByCurrency } from 'utils/groupCategoriesByCurrency';
import { toLocaleAmount } from 'utils/toLocaleAmount';
import { colors } from 'theme';

export interface SubCategoryTotals {
  income: number;
  expense: number;
  currency: string;
}

interface CategorySelectorProps {
  categories: Category[];
  selectedCategoryId?: string;
  selectedSubcategoryId?: string;
  onCategorySelect: (cat: Category) => void;
  onSubcategorySelect: (subcategoryId: string) => void;
  disabled?: boolean;
  getCategoryDisabled?: (cat: Category) => boolean;
  getSubcategoryDisabled?: (sub: SubCategory) => boolean;
  subCategoryTotals?: Record<string, SubCategoryTotals>;
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
  subCategoryTotals,
}: CategorySelectorProps) => {
  const { byCurrency, currencies } = groupCategoriesByCurrency(categories);
  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
  const selectedSubTotals = selectedSubcategoryId
    ? subCategoryTotals?.[selectedSubcategoryId]
    : undefined;

  return (
    <Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {currencies.map((currency) => (
          <Box
            sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}
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

            {selectedSubTotals && (
              <>
                <Divider
                  sx={{
                    mt: 1.5,
                    mb: 1,
                    borderColor: alpha(selectedCategory.color, 0.15),
                  }}
                />
                <Box sx={{ display: 'flex', gap: 2.5 }}>
                  <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                    Ingresos
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: '"Manrope", sans-serif',
                      fontWeight: 700,
                      fontSize: 12,
                      color: colors.secondary,
                    }}
                  >
                    {toLocaleAmount(selectedSubTotals.income)}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                    Egresos
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: '"Manrope", sans-serif',
                      fontWeight: 700,
                      fontSize: 12,
                      color: colors.tertiary,
                    }}
                  >
                    {toLocaleAmount(selectedSubTotals.expense)}
                  </Typography>
                </Box>
              </>
            )}
          </Box>
        )}
    </Box>
  );
};
