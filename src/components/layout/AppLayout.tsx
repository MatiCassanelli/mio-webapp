import React from 'react';
import Box from '@mui/material/Box';
import { SideNav } from './SideNav';
import { BottomNav, BOTTOM_NAV_HEIGHT } from './BottomNav';

interface AppLayoutProps {
  readonly children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => (
  <Box
    sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}
  >
    <SideNav />
    <Box
      component="main"
      sx={{
        flex: 1,
        minWidth: 0,
        // Safety net: no row should overflow, but if one does, it shouldn't
        // drag the whole page into horizontal scroll on mobile.
        overflowX: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        pb: { xs: `${BOTTOM_NAV_HEIGHT + 16}px`, md: 0 },
      }}
    >
      {children}
    </Box>
    <BottomNav />
  </Box>
);
