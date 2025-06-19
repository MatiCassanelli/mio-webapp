import {
  ListItem,
  ListItemAvatar,
  Avatar,
  Box,
  Typography,
} from '@mui/material';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import { Transaction } from 'types/Transaction';
import { CategoryChip } from 'components/category/CategoryChip';
import { Amount } from 'components/common/Amount';

export const TransactionItem = ({
  transaction,
}: {
  transaction: Transaction;
}) => {
  const { amount, category, date, description, income, isInternal } = transaction;

  const getTransactionIcon = () => {
    if (isInternal) {
      return <SyncAltIcon color="info" />;
    }
    if (income) {
      return <ArrowDownwardIcon color="success" />;
    }
    return <ArrowUpwardIcon color="error" />;
  };

  return (
    <ListItem sx={{ paddingX: 0, gap: 1 }}>
      <ListItemAvatar>
        <Avatar sx={{ background: 'rgba(0,0,0,0.07)', width: 48, height: 48 }}>
          {getTransactionIcon()}
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
            <Typography sx={{ lineHeight: 1.25 }}>
              {description}
              {isInternal && (
                <Typography
                  component="span"
                  variant="caption"
                  sx={{ ml: 1, color: 'info.main' }}
                >
                  (Interno)
                </Typography>
              )}
            </Typography>
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
