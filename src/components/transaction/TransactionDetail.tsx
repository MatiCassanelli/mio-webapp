import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import dayjs from 'dayjs';
import { Transaction } from 'types/Transaction';
import { Currency } from 'types/Currency';
import { AccountPlaque } from 'components/account/AccountPlaque';
import { CategoryPill } from 'components/category/CategoryPill';
import { Icon } from 'components/common/Icon';
import { useData } from 'context/DataContext';
import { deleteTransaction } from 'services/transactions';
import { formatAmount } from 'utils/money';
import { colors, tokens } from 'theme';

interface TransactionDetailProps {
  transaction: Transaction;
  currency?: Currency;
  /** Current balance of the transaction's account, when there's room to show it. */
  accountBalance?: number;
  onEdit: () => void;
  onDeleted?: () => void;
}

const Line = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 1.5,
    }}
  >
    <Typography sx={{ fontSize: 12, color: colors.onSurfaceVariant }}>
      {label}
    </Typography>
    {children}
  </Box>
);

const value = (text: string) => (
  <Typography sx={{ fontSize: 12, fontWeight: 600 }}>{text}</Typography>
);

export const TransactionDetail = ({
  transaction,
  currency,
  accountBalance,
  onEdit,
  onDeleted,
}: TransactionDetailProps) => {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const { transactions, currenciesByCode } = useData();
  const isTransfer = transaction.type === 'transfer';

  const counterpart = transaction.linkedTransactionId
    ? transactions.find((t) => t.id === transaction.linkedTransactionId)
    : undefined;
  const counterpartCurrency =
    counterpart && currenciesByCode[counterpart.account?.currencyCode];

  /**
   * In the same currency, what goes out minus what comes in is the fee the
   * transfer ate. It's derived from the two amounts instead of stored, so it
   * can never drift out of sync with them.
   */
  const fee = (() => {
    if (!counterpart) return null;
    const out = transaction.transfer?.direction === 'out' ? transaction : counterpart;
    const incoming = transaction.transfer?.direction === 'out' ? counterpart : transaction;
    if (out.account?.currencyCode !== incoming.account?.currencyCode) return null;
    const difference = out.amount - incoming.amount;
    if (!difference) return null;
    const percent = Math.abs((difference / out.amount) * 100).toLocaleString(
      'es-ar',
      { maximumFractionDigits: 2 },
    );
    return {
      label: difference > 0 ? 'Comisión' : 'Diferencia a favor',
      value: `${formatAmount(difference, currency)} · ${percent}%`,
    };
  })();

  const handleDelete = async () => {
    setBusy(true);
    try {
      await deleteTransaction(transaction);
      onDeleted?.();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
      {isTransfer ? (
        <>
          <Line label={transaction.transfer?.direction === 'in' ? 'Vino de' : 'Fue a'}>
            {transaction.transfer && (
              <AccountPlaque
                account={transaction.transfer.counterpartAccount}
                size="sm"
              />
            )}
          </Line>
          {counterpart && (
            <Line
              label={
                transaction.transfer?.direction === 'out' ? 'Se recibió' : 'Se envió'
              }
            >
              <Typography
                sx={{
                  fontFamily: '"Manrope", sans-serif',
                  fontWeight: 800,
                  fontSize: 13,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {formatAmount(counterpart.amount, counterpartCurrency)}
              </Typography>
            </Line>
          )}
          {fee && (
            <Line label={fee.label}>
              <Typography
                sx={{
                  fontFamily: '"Manrope", sans-serif',
                  fontWeight: 800,
                  fontSize: 13,
                  color: colors.primary,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {fee.value}
              </Typography>
            </Line>
          )}
        </>
      ) : (
        <Line label="Categoría">
          {transaction.category ? (
            <CategoryPill
              category={
                transaction.category.subcategory
                  ? {
                      name: transaction.category.subcategory.name,
                      color: transaction.category.color,
                    }
                  : transaction.category
              }
            />
          ) : (
            <Typography sx={{ fontSize: 11, color: colors.outlineVariant }}>
              Sin categoría
            </Typography>
          )}
        </Line>
      )}

      <Line label={transaction.type === 'income' ? 'Entró en' : 'Salió de'}>
        <AccountPlaque account={transaction.account} size="sm" />
      </Line>

      <Line label="Fecha">
        {value(dayjs(transaction.date.toDate()).format('DD/MM/YYYY'))}
      </Line>

      {accountBalance != null && (
        <Line label="Saldo de la cuenta">
          <Typography
            sx={{
              fontFamily: '"Manrope", sans-serif',
              fontWeight: 800,
              fontSize: 13,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {formatAmount(accountBalance, currency)}
          </Typography>
        </Line>
      )}

      {transaction.saving && (
        <Line label="Ahorro">
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              fontSize: 11,
              fontWeight: 600,
              color: colors.secondary,
            }}
          >
            <Icon name="savings" size={16} />
            Marcado como ahorro
          </Box>
        </Line>
      )}

      {isTransfer && (
        <Typography
          sx={{ fontSize: 10, color: colors.outline, lineHeight: 1.4 }}
        >
          Está en el saldo, pero no cuenta como ingreso ni como egreso. Borrarla
          elimina las dos patas.
        </Typography>
      )}

      <Box
        sx={{
          display: 'flex',
          gap: 1,
          pt: 1.5,
          borderTop: `1px solid ${tokens.hairline}`,
        }}
      >
        <Box
          onClick={onEdit}
          sx={{
            flex: 1,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.75,
            height: 36,
            borderRadius: 3,
            bgcolor: colors.surfaceContainerLow,
            color: colors.primary,
            fontWeight: 700,
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          <Icon name="edit" size={16} />
          Editar
        </Box>
        <Box
          onClick={() => (confirming ? handleDelete() : setConfirming(true))}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.75,
            px: confirming ? 2 : 0,
            width: confirming ? 'auto' : 46,
            height: 36,
            borderRadius: 3,
            bgcolor: `${colors.tertiary}0f`,
            color: colors.tertiary,
            fontWeight: 700,
            fontSize: 12,
            cursor: 'pointer',
            opacity: busy ? 0.5 : 1,
          }}
        >
          <Icon name="delete" size={17} />
          {confirming && 'Confirmar'}
        </Box>
      </Box>
    </Box>
  );
};
