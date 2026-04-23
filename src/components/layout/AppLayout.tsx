import React, { useState } from 'react';
import Box from '@mui/material/Box';
import { SideNav } from './SideNav';
import { TopBar } from './TopBar';

interface AppLayoutProps {
  readonly children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <SideNav mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <Box
        component="main"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          minWidth: 0,
          overflowX: 'hidden',
        }}
      >
        <TopBar onMenuClick={() => setMobileOpen(true)} />
        <Box sx={{ flex: 1, minWidth: 0 }}>{children}</Box>
      </Box>
    </Box>
  );
};

