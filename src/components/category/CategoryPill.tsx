import Box from '@mui/material/Box';
import { SxProps } from '@mui/material/styles';
import { CategoryRef } from 'types/Category';
import { colors } from 'theme';

interface CategoryPillProps {
  category: Pick<CategoryRef, 'name' | 'color'>;
  size?: 'sm' | 'md';
  selected?: boolean;
  onClick?: () => void;
  sx?: SxProps;
}

const SIZES = {
  sm: { height: 22, px: 1.125, font: 10, dot: 5 },
  md: { height: 28, px: 1.375, font: 10, dot: 6 },
};

/**
 * The Category always looks like this: full pill, color at 12% opacity, and a
 * color dot. Never with an icon — that shape belongs to the Account.
 */
export const CategoryPill = ({
  category,
  size = 'sm',
  selected,
  onClick,
  sx,
}: CategoryPillProps) => {
  const dims = SIZES[size];
  const color = category.color || colors.outline;

  return (
    <Box
      component="span"
      onClick={onClick}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.625,
        height: dims.height,
        px: dims.px,
        borderRadius: 999,
        bgcolor: `${color}${selected ? '1f' : '14'}`,
        border: selected ? `1.5px solid ${color}` : '1.5px solid transparent',
        color,
        fontWeight: 700,
        fontSize: dims.font,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        whiteSpace: 'nowrap',
        flexShrink: 0,
        cursor: onClick ? 'pointer' : 'inherit',
        ...sx,
      }}
    >
      <Box
        component="span"
        sx={{
          width: dims.dot,
          height: dims.dot,
          borderRadius: '50%',
          bgcolor: color,
          flexShrink: 0,
        }}
      />
      {category.name}
    </Box>
  );
};
