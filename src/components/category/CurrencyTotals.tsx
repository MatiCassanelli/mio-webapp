import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { Transaction } from 'types/Transaction';
import { toLocaleAmount } from 'utils/toLocaleAmount';
import { colors } from 'theme';

interface CurrencyGroup {
  currency: string;
  income: number;
  expense: number;
}

interface CurrencyTotalsProps {
  transactions: Transaction[];
  showCurrencyName?: boolean;
}

export const CurrencyTotals = ({
  transactions,
  showCurrencyName = true,
}: CurrencyTotalsProps) => {
  const byCurrency: Record<string, CurrencyGroup> = {};

  transactions.forEach((t) => {
    const key = t.category.currency;
    if (!byCurrency[key])
      byCurrency[key] = { currency: key, income: 0, expense: 0 };
    if (t.income) byCurrency[key].income += t.amount;
    else byCurrency[key].expense += t.amount;
  });

  const groups = Object.values(byCurrency);
  if (!groups.length) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        flexWrap: { xs: 'nowrap', sm: 'wrap' },
        overflowX: 'auto',
        pb: { xs: 0.5, sm: 0 },
        px: { xs: 0.5, sm: 0 },
        mx: { xs: -0.5, sm: 0 },
        mb: 2,
      }}
    >
      {groups.map(({ currency, income, expense }) => {
        const balance = income - expense;
        return (
          <Paper
            key={currency}
            elevation={0}
            sx={{
              flex: '1 1 180px',
              minWidth: { xs: 200, sm: 'unset' },
              p: 2.5,
              borderRadius: 3,
              bgcolor: colors.surfaceContainerLowest,
              boxShadow: '0 4px 12px rgba(11,28,48,0.04)',
              border: `1px solid ${colors.outlineVariant}33`,
            }}
          >
            {showCurrencyName && (
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: 'text.secondary',
                  mb: 1.5,
                }}
              >
                {currency}
              </Typography>
            )}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                  Ingresos
                </Typography>
                <Typography
                  sx={{
                    fontFamily: '"Manrope", sans-serif',
                    fontWeight: 700,
                    fontSize: 13,
                    color: colors.secondary,
                  }}
                >
                  +{toLocaleAmount(income)}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                  Egresos
                </Typography>
                <Typography
                  sx={{
                    fontFamily: '"Manrope", sans-serif',
                    fontWeight: 700,
                    fontSize: 13,
                    color: colors.tertiary,
                  }}
                >
                  -{toLocaleAmount(expense)}
                </Typography>
              </Box>
              <Divider sx={{ my: 0.5 }} />
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                  Saldo
                </Typography>
                <Typography
                  sx={{
                    fontFamily: '"Manrope", sans-serif',
                    fontWeight: 800,
                    fontSize: 15,
                    color: balance >= 0 ? colors.secondary : colors.tertiary,
                  }}
                >
                  {balance >= 0 ? '+' : ''}
                  {toLocaleAmount(balance)}
                </Typography>
              </Box>
            </Box>
          </Paper>
        );
      })}
    </Box>
  );
};
