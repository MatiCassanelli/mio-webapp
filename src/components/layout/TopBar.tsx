import React from 'react';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface TopBarProps {
  readonly onMenuClick: () => void;
}

export const TopBar = ({ onMenuClick }: TopBarProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        px: { xs: 2, md: 4 },
        py: 2,
        gap: 1,
      }}
    >
      <IconButton
        sx={{ display: { xs: 'flex', md: 'none' }, color: 'text.primary' }}
        onClick={onMenuClick}
        aria-label="Abrir menú"
      >
        <span className="material-symbols-outlined" style={{ fontSize: 24 }}>menu</span>
      </IconButton>

      <Typography
        sx={{
          display: { xs: 'block', md: 'none' },
          fontFamily: '"Manrope", sans-serif',
          fontWeight: 900,
          fontSize: 22,
          color: 'primary.main',
          letterSpacing: '-1px',
          lineHeight: 1,
        }}
      >
        mio
      </Typography>
    </Box>
  );
};

