import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { colors, tokens } from 'theme';

interface GroupHeaderProps {
  label: string;
  /** Figure on the right: currency total, or the day's net. */
  value?: React.ReactNode;
  valueColor?: string;
  onClick?: () => void;
}

/** Group header: label, a rule filling the width, and a figure on the right. */
export const GroupHeader = ({
  label,
  value,
  valueColor = colors.onSurfaceVariant,
  onClick,
}: GroupHeaderProps) => (
  <Box
    onClick={onClick}
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      px: 0.5,
      cursor: onClick ? 'pointer' : 'inherit',
    }}
  >
    <Typography
      sx={{
        fontFamily: '"Manrope", sans-serif',
        fontWeight: 800,
        fontSize: 10,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        color: colors.outline,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </Typography>
    <Box sx={{ flex: 1, height: '1px', bgcolor: tokens.rule }} />
    {value != null && (
      <Typography
        sx={{
          fontFamily: '"Manrope", sans-serif',
          fontWeight: 800,
          fontSize: 11,
          color: valueColor,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </Typography>
    )}
  </Box>
);
