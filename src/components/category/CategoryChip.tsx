import { Chip } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Category } from 'types/Transaction';

export const CategoryChip = ({ category }: { category: Category }) => {
  return (
    <Chip
      size="small"
      label={category.name}
      sx={{
        bgcolor: alpha(category.color, 0.12),
        color: category.color,
        fontWeight: 700,
        fontSize: 10,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        height: 22,
        borderRadius: 12,
        border: 'none',
      }}
    />
  );
};
