import React from 'react';
import Typography from '@mui/material/Typography';

export const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <Typography
    sx={{
      fontSize: 11,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.15em',
      color: 'text.secondary',
      mb: 1.25,
    }}
  >
    {children}
  </Typography>
);
