import { Box, CircularProgress } from '@mui/material';

export const Loading = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        height: '100vh',
        justifyContent: 'center',
      }}
    >
      <CircularProgress />
    </Box>
  );
};
