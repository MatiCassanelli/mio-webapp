import {
  ListItem,
  ListItemAvatar,
  Avatar,
  Box,
  Typography,
} from '@mui/material';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { Transaction } from '../types/Transaction';
import { CategoryChip } from './CategoryChip';
import { Amount } from './Amount';

export const TransactionItem = ({
  transaction,
}: {
  transaction: Transaction;
}) => {
  const { amount, category, date, description, income } = transaction;
  return (
    <ListItem sx={{ paddingX: 0, gap: 1 }}>
      <ListItemAvatar>
        <Avatar sx={{ background: 'rgba(0,0,0,0.07)', width: 48, height: 48 }}>
          {income ? (
            <ArrowDownwardIcon color="success" />
          ) : (
            <ArrowUpwardIcon color="error" />
          )}
        </Avatar>
      </ListItemAvatar>
      <Box sx={{ width: '100%' }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography>{description}</Typography>
            <CategoryChip variant="outlined" size="small" category={category} />
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Amount
              amount={amount}
              income={income}
              currency={category.currency}
            />
            <Typography
              variant="caption"
              sx={{ fontWeight: 600, display: 'block', textAlign: 'right' }}
            >
              {date.toDate().toLocaleString('es', {
                month: 'long',
                day: '2-digit',
              })}
            </Typography>
          </Box>
        </Box>
      </Box>
    </ListItem>
  );
};
