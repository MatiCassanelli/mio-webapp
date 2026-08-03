import React from 'react';
import Typography from '@mui/material/Typography';
import { colors } from 'theme';

export const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <Typography
    sx={{
      fontSize: 10,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      color: colors.onSurfaceVariant,
      mb: 0.75,
    }}
  >
    {children}
  </Typography>
);
