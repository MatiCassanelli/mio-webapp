import { Box, Grid, Typography } from '@mui/material';
import { useState } from 'react';
import { MonthSelector } from 'components/common/MonthSelector';
import { MonthlyTotals } from 'components/dashboard/MonthlyTotals';
import { CategoryTotals } from 'components/dashboard/CategoryTotals';

export const Dashboard = () => {
  const [year, setYear] = useState(0);

  return (
    <Box sx={{ height: '100%', paddingTop: '16px' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          marginBotto: '8px',
          justifyContent: 'space-between',
        }}
      >
        <Typography sx={{ fontWeight: 600 }}>
          Total de movimientos anuales (USD)
        </Typography>
        <MonthSelector year={year} setYear={setYear} />
      </Box>
      <Grid container columns={3} columnSpacing={2} sx={{ paddingY: 2 }}>
        <CategoryTotals year={year} />
        <MonthlyTotals year={year} />
      </Grid>
    </Box>
  );
};
