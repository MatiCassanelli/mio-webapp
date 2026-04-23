import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { colors } from 'theme';

export interface CategoryPillProps {
  label: string;
  color: string;
  selected: boolean;
  small?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export const CategoryPill = ({
  label,
  color,
  selected,
  small,
  disabled,
  onClick,
}: CategoryPillProps) => (
  <Box
    onClick={disabled ? undefined : onClick}
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 0.75,
      px: small ? 1.25 : 1.5,
      py: small ? 0.5 : 0.75,
      borderRadius: 3,
      cursor: disabled ? 'not-allowed' : 'pointer',
      border: `1.5px solid ${selected ? color : disabled ? `${colors.outlineVariant}66` : colors.outlineVariant}`,
      bgcolor: selected
        ? alpha(color, 0.12)
        : disabled
          ? `${colors.surfaceContainerLow}88`
          : colors.surfaceContainerLow,
      opacity: disabled ? 0.45 : 1,
      transition: 'all 0.15s',
      userSelect: 'none',
      '&:hover': disabled ? {} : { bgcolor: alpha(color, 0.09), borderColor: color },
    }}
  >
    <Box
      sx={{
        width: small ? 6 : 8,
        height: small ? 6 : 8,
        borderRadius: '50%',
        bgcolor: disabled ? colors.outline : color,
        flexShrink: 0,
      }}
    />
    <Typography
      sx={{
        fontSize: small ? 12 : 13,
        fontWeight: selected ? 700 : 500,
        color: selected ? 'text.primary' : 'text.secondary',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </Typography>
  </Box>
);
