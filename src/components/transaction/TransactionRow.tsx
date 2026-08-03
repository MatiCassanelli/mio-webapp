import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { signedAmount, Transaction } from 'types/Transaction';
import { Currency } from 'types/Currency';
import { AccountPlaque } from 'components/account/AccountPlaque';
import { CategoryPill } from 'components/category/CategoryPill';
import { Icon } from 'components/common/Icon';
import { formatAmount, formatSigned } from 'utils/money';
import { amountColor, colors } from 'theme';

interface TransactionRowProps {
  transaction: Transaction;
  currency?: Currency;
  /** Inside an Account the plaque drops from the rows: it's already known which one it is. */
  showAccount?: boolean;
  /**
   * The incoming leg, when the row represents the full transfer. Looking
   * across all accounts, a transfer is a single fact, not two.
   */
  counterpart?: Transaction;
  counterpartCurrency?: Currency;
  selected?: boolean;
  onClick?: () => void;
}

export const TransactionRow = ({
  transaction,
  currency,
  showAccount = true,
  counterpart,
  counterpartCurrency,
  selected,
  onClick,
}: TransactionRowProps) => {
  const { description, category, type, transfer } = transaction;
  const isTransferRow = type === 'transfer';
  const signed = signedAmount(transaction);
  const color = isTransferRow ? colors.primary : amountColor(signed);
  /**
   * When what comes in isn't what went out, both numbers need to show: it's
   * either a currency exchange, or a fee was taken along the way. Showing
   * just one hides money that never arrived.
   */
  const showsBothAmounts =
    !!counterpart &&
    (counterpart.account?.currencyCode !== transaction.account?.currencyCode ||
      counterpart.amount !== transaction.amount);

  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: { xs: 'flex-start', md: 'center' },
        gap: 1.25,
        py: 1.625,
        cursor: onClick ? 'pointer' : 'inherit',
        bgcolor: selected ? `${colors.primary}08` : 'transparent',
        transition: 'background-color 0.15s',
      }}
    >
      {isTransferRow && (
        <Icon name="swap_horiz" size={18} color={colors.primary} style={{ marginTop: 2 }} />
      )}
      {!isTransferRow && !showAccount && (
        <Box
          sx={{
            width: 7,
            height: 7,
            mt: 0.875,
            borderRadius: '50%',
            flexShrink: 0,
            bgcolor: category?.color ?? colors.outlineVariant,
          }}
        />
      )}

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box
          sx={{
            display: 'flex',
            // Baseline, not center: with a two-line description the amount stays
            // aligned with the first line, as if it were a single line.
            alignItems: 'baseline',
            justifyContent: 'space-between',
            gap: 1.25,
          }}
        >
          {/*
            Wraps instead of truncating: the description is the only thing that
            says what the movement was, and the expanded detail doesn't repeat
            it either. Truncating would hide it forever. `minWidth: 0` is what
            lets the text shrink instead of pushing the amount off screen.
          */}
          <Typography
            sx={{
              flex: 1,
              minWidth: 0,
              fontSize: { xs: 13, md: 14 },
              fontWeight: 600,
              overflowWrap: 'anywhere',
            }}
          >
            {description}
          </Typography>
          <Typography
            sx={{
              fontFamily: '"Manrope", sans-serif',
              fontWeight: 800,
              fontSize: 15,
              color,
              fontVariantNumeric: 'tabular-nums',
              flexShrink: 0,
            }}
          >
            {isTransferRow
              ? formatAmount(transaction.amount, currency)
              : formatSigned(signed, currency)}
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            mt: 0.875,
            flexWrap: 'wrap',
            minWidth: 0,
          }}
        >
          {counterpart ? (
            <>
              <AccountPlaque account={transaction.account} size="sm" />
              <Icon name="arrow_forward" size={15} color={colors.primary} />
              <AccountPlaque account={counterpart.account} size="sm" />
              {showsBothAmounts && (
                <Typography
                  sx={{
                    fontFamily: '"Manrope", sans-serif',
                    fontWeight: 800,
                    fontSize: 11,
                    color: colors.primary,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {formatAmount(counterpart.amount, counterpartCurrency)}
                </Typography>
              )}
            </>
          ) : isTransferRow ? (
            <Typography
              sx={{ fontSize: 10, color: colors.primary, minWidth: 0 }}
            >
              {transfer?.direction === 'in' ? 'Desde ' : 'Hacia '}
              {transfer?.counterpartAccount.name}
            </Typography>
          ) : category ? (
            <CategoryPill
              category={
                category.subcategory
                  ? { name: category.subcategory.name, color: category.color }
                  : category
              }
            />
          ) : (
            <Typography sx={{ fontSize: 10, color: colors.outlineVariant }}>
              Sin categoría
            </Typography>
          )}

          {transaction.saving && (
            <Icon name="savings" size={14} color={colors.secondary} />
          )}

          {showAccount && !counterpart && (
            <AccountPlaque account={transaction.account} size="sm" />
          )}
        </Box>
      </Box>
    </Box>
  );
};
