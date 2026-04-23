import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import { useState } from 'react';
import { MonthSelector } from 'components/common/MonthSelector';
import { MonthlyTotals } from 'components/dashboard/MonthlyTotals';
import { CategoryTotals } from 'components/dashboard/CategoryTotals';
import { colors } from 'theme';

export const Dashboard = () => {
  const [year, setYear] = useState(0);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1280, mx: 'auto' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: { xs: 'flex-start', sm: 'flex-end' },
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          gap: 2,
          mb: 4,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontFamily: '"Manrope", sans-serif',
              fontWeight: 800,
              letterSpacing: '-0.5px',
            }}
          >
            Acumulado
          </Typography>
          <Typography sx={{ color: 'text.secondary', mt: 0.5, fontSize: 14 }}>
            Total de movimientos anuales (USD)
          </Typography>
        </Box>
        <MonthSelector year={year} setYear={setYear} />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '300px 1fr' },
          gap: 3,
          alignItems: 'start',
        }}
      >
        <Paper
          elevation={0}
          sx={{
            bgcolor: colors.surfaceContainerLowest,
            borderRadius: 3,
            p: { xs: 2, md: 2.5 },
            boxShadow: '0 12px 32px -4px rgba(11,28,48,0.06)',
          }}
        >
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'text.secondary',
              mb: 2,
            }}
          >
            Categorías
          </Typography>
          <CategoryTotals year={year} />
        </Paper>

        <Paper
          elevation={0}
          sx={{
            bgcolor: colors.surfaceContainerLowest,
            borderRadius: 3,
            p: { xs: 2, md: 2.5 },
            boxShadow: '0 12px 32px -4px rgba(11,28,48,0.06)',
            minHeight: 380,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <MonthlyTotals year={year} />
        </Paper>
      </Box>
    </Box>
  );
};
