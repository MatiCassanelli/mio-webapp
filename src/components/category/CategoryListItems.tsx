import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { Icon } from 'components/common/Icon';
import { Category, SubCategory } from 'types/Transaction';
import { toLocaleAmount } from 'utils/toLocaleAmount';
import { colors } from 'theme';
import { useMemo } from 'react';

interface CategoryListItemProps {
  category: Category;
  amount: number;
  isSelected: boolean;
  onClick: () => void;
  /** Show +/- sign and color the amount green/red based on sign */
  showSign?: boolean;
}

export const CategoryListItem = ({
  category,
  amount,
  isSelected,
  onClick,
  showSign = false,
}: CategoryListItemProps) => {
  const isPositive = amount >= 0;

  const amountColor = useMemo(() => {
    if (isSelected) return category.color;
    if (!showSign) return 'text.secondary';
    return isPositive ? colors.secondary : colors.tertiary;
  }, [isSelected, showSign, isPositive, category.color]);

  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 1.5,
        py: 1.25,
        borderRadius: 2,
        cursor: 'pointer',
        bgcolor: isSelected ? alpha(category.color, 0.1) : 'transparent',
        border: `1px solid ${isSelected ? category.color : 'transparent'}33`,
        transition: 'all 0.15s',
        '&:hover': { bgcolor: alpha(category.color, 0.07) },
      }}
    >
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          bgcolor: category.color,
          flexShrink: 0,
        }}
      />
      <Typography
        sx={{
          flex: 1,
          fontSize: 13,
          fontWeight: isSelected ? 700 : 500,
          color: isSelected ? 'text.primary' : 'text.secondary',
        }}
      >
        {category.name}
      </Typography>
      <Typography
        sx={{
          fontFamily: '"Manrope", sans-serif',
          fontWeight: 700,
          fontSize: 13,
          color: amountColor,
        }}
      >
        {showSign && (isPositive ? '+' : '-')}
        {category.currency}{' '}
        {toLocaleAmount(showSign ? Math.abs(amount) : amount)}
      </Typography>
      {isSelected && <Icon name="check" size={16} color={category.color} />}
    </Box>
  );
};

interface SubCategoryListItemProps {
  subCategory: SubCategory;
  currency: string;
  amount: number;
  /** Show +/- sign and color the amount green/red based on sign */
  showSign?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
}

export const SubCategoryListItem = ({
  subCategory,
  currency,
  amount,
  showSign = false,
  isSelected = false,
  onClick,
}: SubCategoryListItemProps) => {
  const isPositive = amount >= 0;
  const amountColor = useMemo(() => {
    if (isSelected) return subCategory.color;
    if (!showSign) return 'text.secondary';
    return isPositive ? colors.secondary : colors.tertiary;
  }, [isSelected, showSign, isPositive, subCategory.color]);

  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 1.5,
        py: 0.75,
        ml: 2,
        borderRadius: 2,
        cursor: onClick ? 'pointer' : 'default',
        bgcolor: isSelected ? alpha(subCategory.color, 0.08) : 'transparent',
        transition: 'all 0.15s',
        ...(onClick && {
          '&:hover': { bgcolor: alpha(subCategory.color, 0.06) },
        }),
      }}
    >
      <Box
        sx={{
          width: 2,
          height: 18,
          bgcolor: isSelected ? subCategory.color : `${subCategory.color}66`,
          borderRadius: 1,
          flexShrink: 0,
        }}
      />
      <Typography
        sx={{
          flex: 1,
          fontSize: 12,
          fontWeight: isSelected ? 700 : 400,
          color: isSelected ? 'text.primary' : 'text.secondary',
        }}
      >
        {subCategory.name}
      </Typography>
      <Typography
        sx={{
          fontFamily: '"Manrope", sans-serif',
          fontWeight: isSelected ? 700 : 600,
          fontSize: 12,
          color: amountColor,
        }}
      >
        {showSign && (isPositive ? '+' : '-')}
        {currency} {toLocaleAmount(showSign ? Math.abs(amount) : amount)}
      </Typography>
      {isSelected && <Icon name="check" size={14} color={subCategory.color} />}
    </Box>
  );
};
