import { Chip, ChipProps } from '@mui/material';
import { Category } from '../types/Transaction';

export const CategoryChip = ({
  category,
}: ChipProps & { category: Category }) => {
  return (
    <Chip
      variant="outlined"
      size="small"
      label={category.name}
      sx={{ color: category.color, borderColor: category.color }}
    />
  );
};
