import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import dayjs from 'dayjs';
import { useData } from 'context/DataContext';
import { useMovementSheet } from 'context/MovementSheetContext';
import { PageHeader } from 'components/common/PageHeader';
import { PeriodSelector } from 'components/common/PeriodSelector';
import { AccountPlaque } from 'components/account/AccountPlaque';
import { TransactionFilters } from 'components/transaction/TransactionFilters';
import { TransactionsByDay } from 'components/transaction/TransactionsByDay';
import { TransactionDetail } from 'components/transaction/TransactionDetail';
import { EmptyState } from 'components/common/EmptyState';
import { Loading } from 'pages/Loading';
import { AccountType } from 'types/Account';
import { signedAmount, Transaction } from 'types/Transaction';
import { formatAmount } from 'utils/money';
import { inPeriod, monthPeriod, Period } from 'utils/period';
import { colors, tokens } from 'theme';

interface SavedByAccount {
  name: string;
  type: AccountType;
  code: string;
  total: number;
}

/**
 * Savings is the same Transactions list with `saving: true`, crossing all
 * Accounts: what's saved is the transaction, not the account. No account is
 * "for savings" — the same ones also carry regular transactions.
 */
export const Savings = () => {
  const { loading, transactions, currencies, currenciesByCode } = useData();
  const { openMovementSheet } = useMovementSheet();
  const [period, setPeriod] = useState<Period>(() => monthPeriod(dayjs()));
  const [accountId, setAccountId] = useState<string>();
  const [categoryId, setCategoryId] = useState<string>();
  const [selectedId, setSelectedId] = useState<string>();

  const savings = useMemo(
    () => transactions.filter((t) => t.saving),
    [transactions],
  );

  const inRange = useMemo(
    () => savings.filter((t) => inPeriod(t, period)),
    [savings, period],
  );

  const visible = useMemo(
    () =>
      inRange.filter(
        (t) =>
          (!accountId || t.account?.id === accountId) &&
          (!categoryId || t.category?.id === categoryId),
      ),
    [inRange, accountId, categoryId],
  );

  /** One figure per currency: no mixing apples and oranges. */
  const byCurrency = useMemo(() => {
    const totals: Record<string, number> = {};
    inRange.forEach((t) => {
      const code = t.account?.currencyCode;
      if (!code) return;
      totals[code] = (totals[code] ?? 0) + signedAmount(t);
    });
    return currencies
      .filter((currency) => totals[currency.code])
      .map((currency) => ({ currency, total: totals[currency.code] }));
  }, [inRange, currencies]);

  /** How much of the period's savings lives in each Account. */
  const byAccount = useMemo(() => {
    const totals = new Map<string, SavedByAccount>();
    inRange.forEach((t) => {
      if (!t.account) return;
      const current = totals.get(t.account.id);
      totals.set(t.account.id, {
        name: t.account.name,
        type: t.account.type,
        code: t.account.currencyCode,
        total: (current?.total ?? 0) + signedAmount(t),
      });
    });
    const rows = [...totals.values()].filter((row) => row.total !== 0);
    const max = Math.max(...rows.map((row) => Math.abs(row.total)), 1);
    return rows.map((row) => ({ ...row, share: Math.abs(row.total) / max }));
  }, [inRange]);

  const detailFor = (transaction: Transaction) => (
    <TransactionDetail
      transaction={transaction}
      currency={currenciesByCode[transaction.account?.currencyCode]}
      onEdit={() => openMovementSheet({ transaction })}
      onDeleted={() => setSelectedId(undefined)}
    />
  );

  if (loading) return <Loading />;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1180, mx: 'auto', width: '100%' }}>
      <PageHeader
        title="Ahorros"
        headline={
          <Box
            sx={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 1.5,
              mt: 0.375,
              flexWrap: 'wrap',
            }}
          >
            {byCurrency.length ? (
              byCurrency.map(({ currency, total }) => (
                <Box
                  key={currency.code}
                  sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}
                >
                  <Typography
                    sx={{
                      fontFamily: '"Manrope", sans-serif',
                      fontWeight: 800,
                      fontSize: 11,
                      color: colors.outline,
                    }}
                  >
                    {currency.symbol}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: '"Manrope", sans-serif',
                      fontWeight: 800,
                      fontSize: { xs: 21, md: 28 },
                      letterSpacing: '-0.5px',
                      color: colors.secondary,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {formatAmount(total, currency)}
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography
                sx={{
                  fontFamily: '"Manrope", sans-serif',
                  fontWeight: 800,
                  fontSize: 21,
                  color: colors.outlineVariant,
                }}
              >
                —
              </Typography>
            )}
          </Box>
        }
        subtitle={
          <Typography
            sx={{ fontSize: 11, color: colors.outline, fontWeight: 600, mt: 0.25 }}
          >
            ahorrado en {period.label.toLowerCase()}
          </Typography>
        }
        action={
          <PeriodSelector
            period={period}
            onChange={setPeriod}
            transactionCount={savings.length}
          />
        }
      />

      <Box sx={{ mb: 1.5 }}>
        <TransactionFilters
          accountId={accountId}
          onAccountChange={setAccountId}
          categoryId={categoryId}
          onCategoryChange={setCategoryId}
        />
      </Box>

      {byAccount.length > 0 && (
        <Box
          sx={{
            bgcolor: 'background.paper',
            borderRadius: tokens.cardRadius,
            p: 2,
            mb: 1.5,
            boxShadow: tokens.cardShadow,
          }}
        >
          <Typography
            sx={{
              fontSize: 10,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: colors.onSurfaceVariant,
            }}
          >
            Ahorrado por cuenta
          </Typography>
          <Box
            sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1.25 }}
          >
            {byAccount.map((row) => (
              <Box
                key={`${row.name}-${row.code}`}
                sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}
              >
                <AccountPlaque
                  account={{ name: row.name, type: row.type }}
                  size="sm"
                />
                <Box
                  sx={{
                    flex: 1,
                    height: 7,
                    borderRadius: '3px',
                    bgcolor: colors.surfaceContainerLow,
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      width: `${Math.round(row.share * 100)}%`,
                      height: '100%',
                      bgcolor: colors.secondary,
                    }}
                  />
                </Box>
                <Typography
                  sx={{
                    fontFamily: '"Manrope", sans-serif',
                    fontWeight: 800,
                    fontSize: 12,
                    color: colors.secondary,
                    fontVariantNumeric: 'tabular-nums',
                    flexShrink: 0,
                  }}
                >
                  {currenciesByCode[row.code]?.symbol}{' '}
                  {formatAmount(row.total, currenciesByCode[row.code])}
                </Typography>
              </Box>
            ))}
          </Box>
          <Typography
            sx={{ fontSize: 10, color: colors.outline, mt: 1.25, lineHeight: 1.4 }}
          >
            Las mismas cuentas llevan también movimientos comunes. Ninguna es «de
            ahorro».
          </Typography>
        </Box>
      )}

      {!visible.length ? (
        <EmptyState
          icon="savings"
          title="Sin ahorros en este período"
          description="Marcá un movimiento como ahorro al cargarlo: sirve para cualquier cuenta."
        />
      ) : (
        <TransactionsByDay
          transactions={visible}
          selectedId={selectedId}
          onSelect={(transaction) =>
            setSelectedId((current) =>
              current === transaction.id ? undefined : transaction.id,
            )
          }
          renderDetail={detailFor}
        />
      )}
    </Box>
  );
};
