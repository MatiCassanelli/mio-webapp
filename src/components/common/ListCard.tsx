import React from 'react';
import Box from '@mui/material/Box';
import { tokens } from 'theme';

interface ListCardProps {
  children: React.ReactNode;
}

/** Rounded card with a divider between rows: base for Profile, Accounts, and Categories. */
export const ListCard = ({ children }: ListCardProps) => (
  <Box
    sx={{
      bgcolor: 'background.paper',
      borderRadius: tokens.cardRadius,
      px: 2,
      boxShadow: tokens.rowShadow,
      '& > *:not(:first-of-type)': {
        borderTop: `1px solid ${tokens.hairline}`,
      },
    }}
  >
    {children}
  </Box>
);
