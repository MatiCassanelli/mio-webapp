import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { Transaction } from 'types/Transaction';
import { TransactionItem } from 'components/transaction/TransactionItem';
import { useNavigate } from 'react-router-dom';
import { transactionEditRoute, savingEditRoute } from 'lib';
import { colors } from 'theme';

const EMPTY_STATE = (
  <Box sx={{ py: 6, textAlign: 'center' }}>
    <span
      className="material-symbols-outlined"
      style={{ fontSize: 40, color: colors.outlineVariant, display: 'block', marginBottom: 8 }}
    >
      receipt_long
    </span>
    <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>
      No se encontraron movimientos
    </Typography>
  </Box>
);

interface TransactionListProps {
  transactions: Transaction[] | undefined;
  saving?: boolean;
}

export const TransactionList = ({ transactions, saving }: TransactionListProps) => {
  const navigate = useNavigate();

  if (!transactions?.length) {
    return EMPTY_STATE;
  }

  const handleClick = (transaction: Transaction) => {
    navigate(
      saving
        ? savingEditRoute(transaction.id!)
        : transactionEditRoute(transaction.id!),
    );
  };

  return (
    <Paper
      elevation={0}
      sx={{
        bgcolor: colors.surfaceContainerLowest,
        borderRadius: 3,
        overflow: 'hidden',
        boxShadow: '0 12px 32px -4px rgba(11,28,48,0.06)',
      }}
    >
      {transactions.map((transaction, i) => (
        <Box key={transaction.id}>
          <TransactionItem
            transaction={transaction}
            onClick={() => handleClick(transaction)}
          />
          {i < transactions.length - 1 && (
            <Divider sx={{ mx: { xs: 2, sm: 3 } }} />
          )}
        </Box>
      ))}
    </Paper>
  );
};
