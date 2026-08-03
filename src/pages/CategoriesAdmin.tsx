import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import dayjs from 'dayjs';
import { useData } from 'context/DataContext';
import { CategoryPill } from 'components/category/CategoryPill';
import { CategoryEditor } from 'components/category/CategoryEditor';
import { GroupHeader } from 'components/common/GroupHeader';
import { Icon } from 'components/common/Icon';
import { ListCard } from 'components/common/ListCard';
import { Sheet } from 'components/common/Sheet';
import { EmptyState } from 'components/common/EmptyState';
import { Loading } from 'pages/Loading';
import { Category } from 'types/Category';
import { signedAmount } from 'types/Transaction';
import { formatSigned } from 'utils/money';
import { inPeriod, monthPeriod } from 'utils/period';
import { primaryButtonSx } from 'utils/buttonStyles';
import { colors, tokens } from 'theme';

type Editing = Category | 'new' | null;

/**
 * Same template as Accounts, different visual vocabulary: here color leads
 * and there are no icons. A Category never belongs to any Account.
 */
export const CategoriesAdmin = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const { loading, categories, transactions, currenciesByCode } = useData();
  const [editing, setEditing] = useState<Editing>(null);

  const period = useMemo(() => monthPeriod(dayjs()), []);

  /**
   * How much each category moved in the month. If it mixes currencies, no
   * figure is shown: adding them up would mean inventing a number.
   */
  const monthTotals = useMemo(() => {
    const totals: Record<string, { total: number; codes: Set<string> }> = {};
    transactions.forEach((transaction) => {
      const id = transaction.category?.id;
      if (!id || !inPeriod(transaction, period)) return;
      const entry = (totals[id] ??= { total: 0, codes: new Set() });
      entry.total += signedAmount(transaction);
      entry.codes.add(transaction.account?.currencyCode);
    });
    return totals;
  }, [transactions, period]);

  const totalLabel = (categoryId: string) => {
    const entry = monthTotals[categoryId];
    if (!entry) return `sin movimientos en ${period.label.split(' ')[0]}`;
    if (entry.codes.size > 1) return 'varias monedas';
    const code = [...entry.codes][0];
    return `${formatSigned(entry.total, currenciesByCode[code])} en ${period.label.split(' ')[0]}`;
  };

  const section = (label: string, items: Category[]) => (
    <Box>
      <Box sx={{ pt: 1, pb: 1 }}>
        <GroupHeader label={label} value={items.length} />
      </Box>
      {items.length ? (
        <ListCard>
          {items.map((category) => (
            <Box
              key={category.id}
              onClick={() => setEditing(category)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
                py: 1.5,
                cursor: 'pointer',
                opacity: category.archived ? 0.5 : 1,
                bgcolor:
                  editing !== 'new' && editing?.id === category.id
                    ? `${colors.primary}08`
                    : 'transparent',
              }}
            >
              <CategoryPill category={category} />
              <Typography
                sx={{
                  flex: 1,
                  fontSize: 11,
                  color: colors.outline,
                  textAlign: 'right',
                }}
              >
                {totalLabel(category.id)}
              </Typography>
              <Icon name="chevron_right" size={18} color={colors.outline} />
            </Box>
          ))}
        </ListCard>
      ) : (
        <Typography sx={{ fontSize: 12, color: colors.outline, px: 0.75 }}>
          Todavía no hay categorías en este grupo.
        </Typography>
      )}
    </Box>
  );

  const editor = (
    <CategoryEditor
      category={editing === 'new' || editing === null ? null : editing}
      onClose={() => setEditing(null)}
    />
  );

  if (loading) return <Loading />;

  const list = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {section(
        'De egreso',
        categories.filter((c) => c.kind !== 'income'),
      )}
      {section(
        'De ingreso',
        categories.filter((c) => c.kind !== 'expense'),
      )}

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
        Nueva categoría
      </Box>

      <Typography
        sx={{ fontSize: 11, color: colors.outline, px: 0.75, pt: 0.5, lineHeight: 1.45 }}
      >
        La Categoría dice en qué gastás; la Cuenta, de dónde salió. Las
        transferencias no aparecen acá porque no llevan Categoría.
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
            Categorías
          </Typography>
          <Typography sx={{ fontSize: 12, color: colors.outline, mt: 0.5 }}>
            Por qué se movió la plata — sin moneda ni cuenta propia
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
          Nueva categoría
        </Button>
      </Box>

      {!categories.length && !editing ? (
        <EmptyState
          icon="sell"
          title="Todavía no hay categorías"
          description="Creá la primera para empezar a contestar en qué se va la plata. Los movimientos se pueden cargar sin categoría y clasificar después."
          actionLabel="Nueva categoría"
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
                  {editing === 'new' ? 'Nueva categoría' : 'Editar categoría'}
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
            title={editing === 'new' ? 'Nueva categoría' : 'Editar categoría'}
          >
            {editor}
          </Sheet>
        </>
      )}
    </Box>
  );
};
