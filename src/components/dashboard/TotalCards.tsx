import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { colors } from 'theme';
import { toLocaleAmount } from 'utils/toLocaleAmount';

interface TotalCardProps {
  title: string;
  income: boolean;
  amount: number;
}
const TotalCard = ({ title, income, amount }: TotalCardProps) => (
  <Paper
    elevation={0}
    sx={{
      flex: 1,
      p: 2.5,
      borderRadius: 3,
      background: income
        ? `linear-gradient(135deg, ${colors.secondary}, ${colors.onSecondaryContainer})`
        : colors.tertiaryFixed,
      color: income ? 'white' : 'text.primary',
      boxShadow: income
        ? `0 4px 14px ${colors.primary}33`
        : '0 4px 12px rgba(11,28,48,0.04)',
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
      <Box
        sx={{
          p: 0.75,
          bgcolor: income ? 'rgba(255,255,255,0.2)' : `${colors.tertiary}1a`,
          borderRadius: 1.5,
        }}
      >
        <span
          className="material-symbols-outlined"
          style={{
            fontSize: 18,
            color: income ? 'white' : colors.tertiary,
            display: 'block',
          }}
        >
          {income ? 'trending_up' : 'trending_down'}
        </span>
      </Box>
      <Typography
        sx={{
          fontSize: 12,
          fontWeight: 600,
          opacity: income ? 0.9 : undefined,
          color: income ? 'inherit' : 'text.secondary',
        }}
      >
        {title}
      </Typography>
    </Box>
    <Typography
      sx={{
        fontFamily: '"Manrope", sans-serif',
        fontWeight: 800,
        fontSize: 22,
        color: income ? 'inherit' : colors.tertiary,
      }}
    >
      {toLocaleAmount(amount)}
    </Typography>
  </Paper>
);

interface BalanceCardProps {
  balance: number;
}
const BalanceCard = ({ balance }: BalanceCardProps) => {
  const isPositive = balance >= 0;
  return (
    <Paper
      elevation={0}
      sx={{
        flex: 1,
        p: 2.5,
        borderRadius: 3,
        bgcolor: isPositive ? `${colors.secondary}0d` : `${colors.tertiary}0d`,
        border: `1px solid ${isPositive ? colors.secondary : colors.tertiary}22`,
        boxShadow: '0 4px 12px rgba(11,28,48,0.04)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Box
          sx={{
            p: 0.75,
            bgcolor: isPositive
              ? `${colors.secondary}1a`
              : `${colors.tertiary}1a`,
            borderRadius: 1.5,
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{
              fontSize: 18,
              color: isPositive ? colors.secondary : colors.tertiary,
              display: 'block',
            }}
          >
            {isPositive ? 'account_balance_wallet' : 'trending_down'}
          </span>
        </Box>
        <Typography
          sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary' }}
        >
          Saldo
        </Typography>
      </Box>
      <Typography
        sx={{
          fontFamily: '"Manrope", sans-serif',
          fontWeight: 800,
          fontSize: 22,
          color: isPositive ? colors.secondary : colors.tertiary,
        }}
      >
        {isPositive ? '+' : ''}
        {toLocaleAmount(balance)}
      </Typography>
    </Paper>
  );
};

interface TotalCardsProps {
  incomingTotal: number;
  outgoingTotal: number;
  balance: number;
}
export const TotalCards = ({
  incomingTotal,
  outgoingTotal,
  balance,
}: TotalCardsProps) => (
  <Box sx={{ display: 'flex', gap: 2, p: 0.5, flexDirection: 'column' }}>
    <TotalCard amount={incomingTotal} income={true} title="Total ingresos" />
    <TotalCard amount={outgoingTotal} income={false} title="Total egresos" />
    <BalanceCard balance={balance} />
  </Box>
);
