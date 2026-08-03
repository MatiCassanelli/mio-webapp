import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useData } from 'context/DataContext';
import { useAccountTotals } from 'hooks/useAccountTotals';
import { AccountCard } from 'components/account/AccountCard';
import { GroupHeader } from 'components/common/GroupHeader';
import { PageHeader, TotalHeadline } from 'components/common/PageHeader';
import { PeriodSelector } from 'components/common/PeriodSelector';
import { ConversionSheet } from 'components/common/ConversionSheet';
import { Loading } from 'pages/Loading';
import { EmptyState } from 'components/common/EmptyState';
import { accountDetailRoute, ROUTES } from 'lib';
import { formatAmount, formatRate } from 'utils/money';
import { monthPeriod, Period } from 'utils/period';
import { USD_CODE } from 'types/Currency';
import { colors } from 'theme';

const STORAGE_KEY = 'mio.openAccounts';

const readOpenAccounts = (): Record<string, boolean> => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
  } catch {
    return {};
  }
};

/**
 * Home: balance per Account grouped by currency, with the period picker
 * inside each card. Answers "how much do I have and how did it move"
 * without clicking through.
 */
export const Home = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const { loading, error, accounts, currencies, transactions } = useData();
  const [period, setPeriod] = useState<Period>(() => monthPeriod(dayjs()));
  const [overrides, setOverrides] = useState<Record<string, boolean>>(
    readOpenAccounts,
  );
  const [conversionOpen, setConversionOpen] = useState(false);

  const { groups, totalUsd, trend } = useAccountTotals(period);

  const firstDate = useMemo(() => {
    const last = transactions[transactions.length - 1];
    return last?.date.toDate();
  }, [transactions]);

  const usdRateNote = useMemo(() => {
    const reference = currencies.find((c) => c.code !== USD_CODE && c.isFiat);
    if (!reference) return null;
    return `${formatRate(reference.usdRate)} ${reference.code} por dólar`;
  }, [currencies]);

  const toggle = (accountId: string, currentlyOpen: boolean) => {
    const next = { ...overrides, [accountId]: !currentlyOpen };
    setOverrides(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  if (loading) return <Loading />;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1180, mx: 'auto', width: '100%' }}>
      <PageHeader
        title="Inicio"
        headline={
          <TotalHeadline
            amount={formatAmount(totalUsd)}
            code={USD_CODE}
            trend={period.isAll ? null : trend}
            onClick={() => setConversionOpen(true)}
          />
        }
        subtitle={
          <Typography
            onClick={() => setConversionOpen(true)}
            sx={{
              fontSize: 12,
              color: colors.outline,
              mt: 0.5,
              cursor: 'pointer',
              display: { xs: 'none', md: 'block' },
            }}
          >
            {`Tus ${accounts.filter((a) => !a.archived).length} cuentas`}
            {usdRateNote ? ` a ${usdRateNote}` : ''} ·{' '}
            <Box component="span" sx={{ color: colors.primary, fontWeight: 600 }}>
              cómo se calcula
            </Box>
          </Typography>
        }
        action={
          <PeriodSelector
            period={period}
            onChange={setPeriod}
            transactionCount={transactions.length}
            firstDate={firstDate}
          />
        }
      />

      {error && (
        <Typography sx={{ color: 'error.main', fontSize: 13, mb: 2 }}>
          {error}
        </Typography>
      )}

      {!groups.length ? (
        <EmptyState
          icon="account_balance_wallet"
          title="Todavía no hay cuentas"
          description="Creá tu primera Cuenta para empezar a ver dónde vive la plata."
          actionLabel="Ir a Cuentas"
          onAction={() => navigate(ROUTES.ACCOUNTS)}
        />
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {groups.map((group) => (
            <Box key={group.currency.code}>
              <Box sx={{ pt: 1, pb: 1 }}>
                <GroupHeader
                  label={`${group.currency.name} · ${group.currency.code}`}
                  value={formatAmount(group.total, group.currency)}
                />
              </Box>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                  gap: { xs: 1, md: 2 },
                  alignItems: 'start',
                }}
              >
                {group.accounts.map((totals) => {
                  const open =
                    overrides[totals.account.id] ??
                    (isDesktop && totals.movements > 0);
                  return (
                    <AccountCard
                      key={totals.account.id}
                      totals={totals}
                      currency={group.currency}
                      open={open}
                      onToggle={() => toggle(totals.account.id, open)}
                      onOpenAccount={() =>
                        navigate(accountDetailRoute(totals.account.id))
                      }
                    />
                  );
                })}
              </Box>
            </Box>
          ))}
        </Box>
      )}

      <ConversionSheet
        open={conversionOpen}
        onClose={() => setConversionOpen(false)}
        groups={groups}
        totalUsd={totalUsd}
      />
    </Box>
  );
};
