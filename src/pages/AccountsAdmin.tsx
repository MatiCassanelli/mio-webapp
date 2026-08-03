import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { useData } from 'context/DataContext';
import { useAccountTotals } from 'hooks/useAccountTotals';
import { AccountPlaque } from 'components/account/AccountPlaque';
import { AccountEditor } from 'components/account/AccountEditor';
import { EmptyState } from 'components/common/EmptyState';
import { GroupHeader } from 'components/common/GroupHeader';
import { Icon } from 'components/common/Icon';
import { ListCard } from 'components/common/ListCard';
import { Sheet } from 'components/common/Sheet';
import { Loading } from 'pages/Loading';
import { Account, ACCOUNT_TYPE_LABEL } from 'types/Account';
import { reorderAccounts } from 'services/accounts';
import { formatAmount } from 'utils/money';
import { ALL_TIME } from 'utils/period';
import { primaryButtonSx } from 'utils/buttonStyles';
import { colors, tokens } from 'theme';

type Editing = Account | 'new' | null;

/**
 * Create, reorder, and archive Accounts. Reached from Profile (or the nav on
 * desktop): it doesn't compete with everyday use. The order of this list is
 * the order on Home.
 */
export const AccountsAdmin = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const { loading, accounts, currencies, transactions } = useData();
  const { byAccount } = useAccountTotals(ALL_TIME);
  const [editing, setEditing] = useState<Editing>(null);
  const [reordering, setReordering] = useState(false);

  const movementCount = useMemo(() => {
    const counts: Record<string, number> = {};
    transactions.forEach((t) => {
      if (!t.account?.id) return;
      counts[t.account.id] = (counts[t.account.id] ?? 0) + 1;
    });
    return counts;
  }, [transactions]);

  const currencyCount = new Set(
    accounts.filter((a) => !a.archived).map((a) => a.currencyCode),
  ).size;

  const move = async (account: Account, delta: number) => {
    const ordered = [...accounts];
    const index = ordered.findIndex((a) => a.id === account.id);
    const target = index + delta;
    if (target < 0 || target >= ordered.length) return;
    [ordered[index], ordered[target]] = [ordered[target], ordered[index]];
    setReordering(true);
    try {
      await reorderAccounts(ordered);
    } finally {
      setReordering(false);
    }
  };

  const editor = (
    <AccountEditor
      account={editing === 'new' || editing === null ? null : editing}
      movementCount={
        editing && editing !== 'new' ? (movementCount[editing.id] ?? 0) : 0
      }
      onClose={() => setEditing(null)}
    />
  );

  if (loading) return <Loading />;

  const list = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {currencies.map((currency) => {
        const group = accounts.filter((a) => a.currencyCode === currency.code);
        if (!group.length) return null;
        return (
          <Box key={currency.code}>
            <Box sx={{ pt: 1, pb: 1 }}>
              <GroupHeader label={`${currency.name} · ${currency.code}`} />
            </Box>
            <ListCard>
              {group.map((account) => {
                const selected =
                  editing !== 'new' && editing?.id === account.id;
                return (
                  <Box
                    key={account.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.25,
                      py: 1.625,
                      opacity: account.archived ? 0.5 : 1,
                      bgcolor: selected ? `${colors.primary}08` : 'transparent',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        flexShrink: 0,
                        mr: -0.5,
                      }}
                    >
                      <IconButton
                        size="small"
                        disabled={reordering}
                        onClick={() => move(account, -1)}
                        sx={{ p: 0.125, color: colors.outlineVariant }}
                        title="Subir"
                      >
                        <Icon name="keyboard_arrow_up" size={16} />
                      </IconButton>
                      <IconButton
                        size="small"
                        disabled={reordering}
                        onClick={() => move(account, 1)}
                        sx={{ p: 0.125, color: colors.outlineVariant }}
                        title="Bajar"
                      >
                        <Icon name="keyboard_arrow_down" size={16} />
                      </IconButton>
                    </Box>

                    <Box
                      onClick={() => setEditing(account)}
                      sx={{
                        flex: 1,
                        minWidth: 0,
                        display: 'flex',
                        alignItems: { xs: 'flex-start', md: 'center' },
                        flexDirection: { xs: 'column', md: 'row' },
                        gap: { xs: 0.5, md: 1.25 },
                        cursor: 'pointer',
                      }}
                    >
                      <AccountPlaque account={account} />
                      <Typography
                        sx={{ flex: 1, fontSize: 11, color: colors.outline }}
                      >
                        {ACCOUNT_TYPE_LABEL[account.type]} ·{' '}
                        {movementCount[account.id] ?? 0} movimientos
                        {account.archived && ' · archivada'}
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: '"Manrope", sans-serif',
                          fontWeight: 800,
                          fontSize: 14,
                          fontVariantNumeric: 'tabular-nums',
                          display: { xs: 'none', md: 'block' },
                        }}
                      >
                        {formatAmount(
                          byAccount[account.id]?.balance ?? 0,
                          currency,
                        )}
                      </Typography>
                    </Box>

                    <Icon
                      name="chevron_right"
                      size={18}
                      color={colors.outline}
                    />
                  </Box>
                );
              })}
            </ListCard>
          </Box>
        );
      })}

      <Box
        onClick={() => setEditing('new')}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0.875,
          bgcolor: 'background.paper',
          border: `1px dashed ${colors.outlineVariant}`,
          borderRadius: tokens.cardRadius,
          py: 1.75,
          mt: 0.5,
          color: colors.primary,
          fontWeight: 700,
          fontSize: 13,
          cursor: 'pointer',
        }}
      >
        <Icon name="add" size={18} />
        Nueva cuenta
      </Box>

      <Typography
        sx={{ fontSize: 11, color: colors.outline, px: 0.75, pt: 0.5, lineHeight: 1.45 }}
      >
        El orden de esta lista es el orden del Inicio. Usá las flechas para
        cambiarlo.
      </Typography>
    </Box>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1180, mx: 'auto', width: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          mb: 1,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontFamily: '"Manrope", sans-serif',
              fontWeight: 800,
              fontSize: { xs: 20, md: 26 },
              letterSpacing: '-0.6px',
            }}
          >
            Cuentas
          </Typography>
          <Typography sx={{ fontSize: 12, color: colors.outline, mt: 0.5 }}>
            {accounts.filter((a) => !a.archived).length} cuentas en{' '}
            {currencyCount} monedas · el orden de la lista es el del Inicio
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={() => setEditing('new')}
          startIcon={<Icon name="add" size={17} />}
          sx={{
            ...primaryButtonSx({ py: 1.375, px: 2.25, fontSize: 13 }),
            display: { xs: 'none', md: 'inline-flex' },
          }}
        >
          Nueva cuenta
        </Button>
      </Box>

      {!accounts.length && !editing ? (
        <EmptyState
          icon="account_balance_wallet"
          title="Todavía no hay cuentas"
          description="Creá la primera para empezar a ver dónde vive la plata. Es el primer paso antes de cargar movimientos."
          actionLabel="Nueva cuenta"
          onAction={() => setEditing('new')}
        />
      ) : isDesktop ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: editing ? '1fr 372px' : '1fr',
            gap: 2.5,
            alignItems: 'start',
          }}
        >
          {list}
          {editing && (
            <Box
              sx={{
                bgcolor: 'background.paper',
                borderRadius: tokens.cardRadius,
                p: 2.75,
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
                  {editing === 'new' ? 'Nueva cuenta' : 'Editar cuenta'}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => setEditing(null)}
                  sx={{ color: colors.outline }}
                >
                  <Icon name="close" size={18} />
                </IconButton>
              </Box>
              {editor}
            </Box>
          )}
        </Box>
      ) : (
        <>
          {list}
          <Sheet
            open={!!editing}
            onClose={() => setEditing(null)}
            title={editing === 'new' ? 'Nueva cuenta' : 'Editar cuenta'}
          >
            {editor}
          </Sheet>
        </>
      )}
    </Box>
  );
};
