import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Fab from '@mui/material/Fab';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { useData } from 'context/DataContext';
import { useMovementSheet } from 'context/MovementSheetContext';
import { useAccountTotals } from 'hooks/useAccountTotals';
import { AccountPlaque } from 'components/account/AccountPlaque';
import { CategoryPill } from 'components/category/CategoryPill';
import { Icon } from 'components/common/Icon';
import { PeriodSelector } from 'components/common/PeriodSelector';
import { TransactionsByDay } from 'components/transaction/TransactionsByDay';
import { TransactionDetail } from 'components/transaction/TransactionDetail';
import { EmptyState } from 'components/common/EmptyState';
import { Loading } from 'pages/Loading';
import { Transaction } from 'types/Transaction';
import { ROUTES } from 'lib';
import { formatAmount, formatCompact } from 'utils/money';
import { inPeriod, monthPeriod, Period } from 'utils/period';
import { colors, tokens } from 'theme';

const FlowCard = ({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) => (
  <Box
    sx={{
      flex: 1,
      bgcolor: 'background.paper',
      borderRadius: 4,
      px: 1.625,
      py: 1.375,
      boxShadow: tokens.rowShadow,
    }}
  >
    <Typography
      sx={{
        fontSize: 10,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.09em',
        color,
      }}
    >
      {label}
    </Typography>
    <Typography
      sx={{
        fontFamily: '"Manrope", sans-serif',
        fontWeight: 800,
        fontSize: 15,
        color,
        mt: 0.375,
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {value}
    </Typography>
  </Box>
);

/** The full breakdown of how money moved in that specific account. */
export const AccountDetail = () => {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { loading, transactions, accountsById, currenciesByCode, categories } =
    useData();
  const { openMovementSheet } = useMovementSheet();
  const [period, setPeriod] = useState<Period>(() => monthPeriod(dayjs()));
  const [categoryId, setCategoryId] = useState<string>();
  const [selectedId, setSelectedId] = useState<string>();

  const { byAccount } = useAccountTotals(period);
  const account = accountsById[id];
  const totals = byAccount[id];
  const currency = account && currenciesByCode[account.currencyCode];

  const accountTransactions = useMemo(
    () => transactions.filter((t) => t.account?.id === id),
    [transactions, id],
  );

  const visible = useMemo(
    () =>
      accountTransactions.filter(
        (t) =>
          inPeriod(t, period) && (!categoryId || t.category?.id === categoryId),
      ),
    [accountTransactions, period, categoryId],
  );

  /** Only the categories this account actually used in the period: a filter that makes sense. */
  const usedCategories = useMemo(() => {
    const ids = new Set(
      accountTransactions
        .filter((t) => inPeriod(t, period))
        .map((t) => t.category?.id)
        .filter(Boolean),
    );
    return categories.filter((c) => ids.has(c.id));
  }, [accountTransactions, categories, period]);

  const detailFor = (transaction: Transaction) => (
    <TransactionDetail
      transaction={transaction}
      currency={currency}
      onEdit={() => openMovementSheet({ transaction })}
      onDeleted={() => setSelectedId(undefined)}
    />
  );

  if (loading) return <Loading />;

  if (!account) {
    return (
      <Box sx={{ p: 4 }}>
        <EmptyState
          icon="wallet"
          title="No encontramos esa cuenta"
          actionLabel="Volver al Inicio"
          onAction={() => navigate(ROUTES.HOME)}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1180, mx: 'auto', width: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        <IconButton
          onClick={() => navigate(-1)}
          sx={{ color: colors.onSurfaceVariant, ml: -1 }}
        >
          <Icon name="arrow_back" size={22} />
        </IconButton>
        <AccountPlaque account={account} size="lg" />
        <IconButton
          onClick={() => navigate(ROUTES.ACCOUNTS)}
          title="Administrar cuentas"
          sx={{ color: colors.onSurfaceVariant, mr: -1 }}
        >
          <Icon name="more_vert" size={20} />
        </IconButton>
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 2,
          mt: 1.5,
          mb: 2,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: 10,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: colors.outline,
            }}
          >
            Saldo actual
          </Typography>
          <Typography
            sx={{
              fontFamily: '"Manrope", sans-serif',
              fontWeight: 800,
              fontSize: { xs: 26, md: 32 },
              letterSpacing: '-0.7px',
              fontVariantNumeric: 'tabular-nums',
              mt: 0.25,
            }}
          >
            {formatAmount(totals?.balance ?? 0, currency)}
          </Typography>
        </Box>
        <PeriodSelector
          period={period}
          onChange={setPeriod}
          transactionCount={accountTransactions.length}
        />
      </Box>

      <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
        <FlowCard
          label="Entró"
          value={`+${formatCompact(totals?.income ?? 0)}`}
          color={colors.secondary}
        />
        <FlowCard
          label="Salió"
          value={`−${formatCompact(totals?.expense ?? 0)}`}
          color={colors.tertiary}
        />
      </Box>

      {(!!totals?.transferIn || !!totals?.transferOut) && (
        <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
          {!!totals.transferIn && (
            <FlowCard
              label="Entró por transferencia"
              value={formatCompact(totals.transferIn)}
              color={colors.primary}
            />
          )}
          {!!totals.transferOut && (
            <FlowCard
              label="Salió por transferencia"
              value={formatCompact(totals.transferOut)}
              color={colors.primary}
            />
          )}
        </Box>
      )}

      {usedCategories.length > 0 && (
        <Box
          sx={{
            display: 'flex',
            gap: 0.75,
            mb: 1.5,
            px: 0.5,
            overflowX: 'auto',
            pb: 0.5,
          }}
        >
          <CategoryPill
            category={{ name: 'Todas', color: colors.primary }}
            selected={!categoryId}
            onClick={() => setCategoryId(undefined)}
          />
          {usedCategories.map((category) => (
            <CategoryPill
              key={category.id}
              category={category}
              selected={category.id === categoryId}
              onClick={() =>
                setCategoryId(category.id === categoryId ? undefined : category.id)
              }
            />
          ))}
        </Box>
      )}

      {!visible.length ? (
        <EmptyState
          icon="receipt_long"
          title="Sin movimientos en este período"
        />
      ) : (
        <TransactionsByDay
          transactions={visible}
          showAccount={false}
          selectedId={selectedId}
          onSelect={(transaction) =>
            setSelectedId((current) =>
              current === transaction.id ? undefined : transaction.id,
            )
          }
          renderDetail={detailFor}
        />
      )}

      {/* The add button lands directly in this account */}
      <Fab
        color="primary"
        onClick={() => openMovementSheet({ accountId: id })}
        sx={{
          position: 'fixed',
          right: 20,
          bottom: { xs: 78, md: 24 },
          background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryContainer})`,
          boxShadow: `0 6px 20px ${colors.primary}4d`,
        }}
      >
        <Icon name="add" size={24} />
      </Fab>
    </Box>
  );
};
