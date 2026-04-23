import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Transaction } from 'types/Transaction';
import { CategoryChip } from 'components/category/CategoryChip';
import { colors } from 'theme';
import { toLocaleAmount } from 'utils/toLocaleAmount';

interface TransactionItemProps {
  transaction: Transaction;
  onClick?: () => void;
}

export const TransactionItem = ({
  transaction,
  onClick,
}: TransactionItemProps) => {
  const { amount, category, date, description, income } = transaction;

  const typeStyle = income
    ? {
        icon: 'trending_up',
        bgcolor: `${colors.secondary}1a`,
        color: colors.secondary,
      }
    : {
        icon: 'trending_down',
        bgcolor: `${colors.tertiary}1a`,
        color: colors.tertiary,
      };

  const amountColor = income ? colors.secondary : colors.tertiary;
  const sign = income ? '+' : '-';

  const formattedDate = date
    .toDate()
    .toLocaleString('es', { month: 'short', day: '2-digit' });

  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: { xs: 1.5, sm: 2 },
        px: { xs: 2, sm: 3 },
        py: 1.75,
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': { bgcolor: colors.surfaceContainerLow },
        transition: 'background-color 0.15s',
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          bgcolor: typeStyle.bgcolor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: typeStyle.color,
          flexShrink: 0,
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
          {typeStyle.icon}
        </span>
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            fontFamily: '"Manrope", sans-serif',
            fontWeight: 700,
            fontSize: 14,
            color: 'text.primary',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {description}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mt: 0.5,
            flexWrap: 'wrap',
          }}
        >
          <CategoryChip category={category} />
          {category.subcategory && (
            <CategoryChip
              category={{
                ...category,
                name: category.subcategory.name,
                color: category.subcategory.color,
              }}
            />
          )}
          <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
            {formattedDate}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
        <Typography
          sx={{
            fontFamily: '"Manrope", sans-serif',
            fontWeight: 800,
            fontSize: 14,
            color: amountColor,
          }}
        >
          {sign}
          {toLocaleAmount(amount)}
        </Typography>
        <Typography
          sx={{ fontSize: 11, color: 'text.secondary', fontWeight: 600 }}
        >
          {category.currency}
        </Typography>
      </Box>
    </Box>
  );
};
