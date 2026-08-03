import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import dayjs from 'dayjs';
import { useData } from 'context/DataContext';
import { useMovementSheet } from 'context/MovementSheetContext';
import { useAccountTotals } from 'hooks/useAccountTotals';
import { PageHeader, TotalHeadline } from 'components/common/PageHeader';
import { PeriodSelector } from 'components/common/PeriodSelector';
import { TransactionFilters } from 'components/transaction/TransactionFilters';
import { TransactionsByDay } from 'components/transaction/TransactionsByDay';
import { TransactionDetail } from 'components/transaction/TransactionDetail';
import { EmptyState } from 'components/common/EmptyState';
import { Loading } from 'pages/Loading';
import { Transaction } from 'types/Transaction';
import { USD_CODE } from 'types/Currency';
import { formatAmount } from 'utils/money';
import { ALL_TIME, inPeriod, monthPeriod, Period } from 'utils/period';
import { colors, tokens } from 'theme';

/**
 * All accounts, by day. On mobile the row expands; on desktop it gets
 * selected and the detail lives in the right-hand panel, without moving
 * the list.
 */
export const Transactions = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const { loading, transactions, currenciesByCode } = useData();
  const { openMovementSheet } = useMovementSheet();
  const { totalUsd, trend, byAccount } = useAccountTotals(ALL_TIME);

  const [period, setPeriod] = useState<Period>(() => monthPeriod(dayjs()));
  const [accountId, setAccountId] = useState<string>();
  const [categoryId, setCategoryId] = useState<string>();
  const [selectedId, setSelectedId] = useState<string>();

  const visible = useMemo(
    () =>
      transactions.filter(
        (transaction) =>
          !transaction.saving &&
          inPeriod(transaction, period) &&
          (!accountId || transaction.account?.id === accountId) &&
          (!categoryId || transaction.category?.id === categoryId),
      ),
    [transactions, period, accountId, categoryId],
  );

  const selected = visible.find((t) => t.id === selectedId);
  // A transfer is two documents but a single event: it's counted by the leg
  // going out, and doesn't factor into the transaction count.
  const movementCount = visible.filter((t) => t.type !== 'transfer').length;
  const transferCount = visible.filter(
    (t) => t.type === 'transfer' && t.transfer?.direction === 'out',
  ).length;

  const detailFor = (transaction: Transaction) => (
    <TransactionDetail
      transaction={transaction}
      currency={currenciesByCode[transaction.account?.currencyCode]}
      accountBalance={byAccount[transaction.account?.id]?.balance}
      onEdit={() => openMovementSheet({ transaction })}
      onDeleted={() => setSelectedId(undefined)}
    />
  );

  if (loading) return <Loading />;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1180, mx: 'auto', width: '100%' }}>
      <PageHeader
        title="Movimientos"
        headline={
          <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            <TotalHeadline
              amount={formatAmount(totalUsd)}
              code={USD_CODE}
              trend={period.isAll ? null : trend}
            />
          </Box>
        }
        subtitle={
          <Typography
            sx={{
              fontSize: 12,
              color: colors.outline,
              mt: 0.5,
              display: { xs: 'none', md: 'block' },
            }}
          >
            {movementCount} movimientos en {period.label.toLowerCase()}
            {transferCount > 0 &&
              ` · ${transferCount} ${transferCount === 1 ? 'transferencia' : 'transferencias'}`}
          </Typography>
        }
        action={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
              <TransactionFilters
                accountId={accountId}
                onAccountChange={setAccountId}
                categoryId={categoryId}
                onCategoryChange={setCategoryId}
              />
            </Box>
            <PeriodSelector
              period={period}
              onChange={setPeriod}
              transactionCount={transactions.length}
            />
          </Box>
        }
      />

      <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 1.5 }}>
        <TransactionFilters
          accountId={accountId}
          onAccountChange={setAccountId}
          categoryId={categoryId}
          onCategoryChange={setCategoryId}
        />
      </Box>

      {!visible.length ? (
        <EmptyState
          icon="receipt_long"
          title="No hay movimientos en este período"
          description="Probá con otro período o sacá los filtros."
        />
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: selected ? '1fr 300px' : '1fr',
            },
            gap: 2.5,
            alignItems: 'start',
          }}
        >
          <TransactionsByDay
            transactions={visible}
            showAccount={!accountId}
            selectedId={selectedId}
            onSelect={(transaction) =>
              setSelectedId((current) =>
                current === transaction.id ? undefined : transaction.id,
              )
            }
            renderDetail={isDesktop ? undefined : detailFor}
          />

          {isDesktop && selected && (
            <Box
              sx={{
                bgcolor: 'background.paper',
                borderRadius: tokens.cardRadius,
                p: 2.5,
                boxShadow: tokens.cardShadow,
                position: 'sticky',
                top: 24,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 1.75,
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
                  Movimiento seleccionado
                </Typography>
              </Box>
              <Typography sx={{ fontSize: 17, fontWeight: 600 }}>
                {selected.description}
              </Typography>
              <Typography
                sx={{
                  fontFamily: '"Manrope", sans-serif',
                  fontWeight: 800,
                  fontSize: 30,
                  letterSpacing: '-0.8px',
                  mt: 0.375,
                  mb: 1.75,
                  fontVariantNumeric: 'tabular-nums',
                  color:
                    selected.type === 'transfer'
                      ? colors.primary
                      : selected.type === 'income'
                        ? colors.secondary
                        : colors.tertiary,
                }}
              >
                {selected.type === 'expense' ? '-' : selected.type === 'income' ? '+' : ''}
                {formatAmount(
                  selected.amount,
                  currenciesByCode[selected.account?.currencyCode],
                )}
              </Typography>
              <Box sx={{ pt: 1.75, borderTop: `1px solid ${tokens.hairline}` }}>
                {detailFor(selected)}
              </Box>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};
