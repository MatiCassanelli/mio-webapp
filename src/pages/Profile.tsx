import { useContext, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from 'firestore/config';
import { UserContext } from 'context/UserContext';
import { useData } from 'context/DataContext';
import { useAccountTotals } from 'hooks/useAccountTotals';
import { Icon } from 'components/common/Icon';
import { GroupHeader } from 'components/common/GroupHeader';
import { ListCard } from 'components/common/ListCard';
import { ConversionSheet } from 'components/common/ConversionSheet';
import { ROUTES } from 'lib';
import { USD_CODE } from 'types/Currency';
import { formatRate } from 'utils/money';
import { ALL_TIME } from 'utils/period';
import { colors, tokens } from 'theme';

interface RowProps {
  icon: string;
  title: string;
  /** Each row carries its current state as a subtitle: the menu informs without entering. */
  hint?: string;
  color?: string;
  onClick: () => void;
  chevron?: boolean;
}

const Row = ({ icon, title, hint, color, onClick, chevron = true }: RowProps) => (
  <Box
    onClick={onClick}
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1.5,
      py: 1.75,
      cursor: 'pointer',
    }}
  >
    <Icon name={icon} size={20} color={color ?? colors.outline} />
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography sx={{ fontSize: 14, fontWeight: 600, color: color ?? 'inherit' }}>
        {title}
      </Typography>
      {hint && (
        <Typography sx={{ fontSize: 11, color: colors.outline, mt: 0.25 }}>
          {hint}
        </Typography>
      )}
    </Box>
    {chevron && (
      <Icon name="chevron_right" size={18} color={colors.outlineVariant} />
    )}
  </Box>
);

/** The door to everything that's configured once and barely touched again. */
export const Profile = () => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const { accounts, categories, currencies } = useData();
  const { groups, totalUsd } = useAccountTotals(ALL_TIME);
  const [conversionOpen, setConversionOpen] = useState(false);

  const activeAccounts = accounts.filter((a) => !a.archived);
  const activeCategories = categories.filter((c) => !c.archived);

  const currencyCount = new Set(activeAccounts.map((a) => a.currencyCode)).size;
  const expenseCount = activeCategories.filter((c) => c.kind !== 'income').length;
  const incomeCount = activeCategories.filter((c) => c.kind !== 'expense').length;

  const rateHint = useMemo(() => {
    const reference = currencies.find((c) => c.code !== USD_CODE && c.isFiat);
    if (!reference) return 'Sin cotizaciones cargadas';
    return `1 USD = ${formatRate(reference.usdRate)} ${reference.code}`;
  }, [currencies]);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 720, mx: 'auto', width: '100%' }}>
      <Typography
        sx={{
          fontFamily: '"Manrope", sans-serif',
          fontWeight: 800,
          fontSize: { xs: 20, md: 26 },
          letterSpacing: '-0.5px',
          mb: 2,
        }}
      >
        Perfil
      </Typography>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          bgcolor: 'background.paper',
          borderRadius: tokens.cardRadius,
          p: 2,
          boxShadow: tokens.cardShadow,
          mb: 1,
        }}
      >
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            bgcolor: colors.surfaceContainerLow,
            color: colors.primary,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: '"Manrope", sans-serif',
            fontWeight: 800,
            fontSize: 16,
            flexShrink: 0,
          }}
        >
          {user?.email?.[0]?.toUpperCase() ?? 'U'}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontFamily: '"Manrope", sans-serif',
              fontWeight: 800,
              fontSize: 15,
              letterSpacing: '-0.2px',
            }}
          >
            {user?.displayName ?? user?.email?.split('@')[0]}
          </Typography>
          <Typography sx={{ fontSize: 11, color: colors.outline, mt: 0.25 }}>
            {user?.email}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ pt: 1.5, pb: 1 }}>
        <GroupHeader label="Tu esquema" />
      </Box>
      <ListCard>
        <Row
          icon="wallet"
          title="Cuentas"
          hint={`${activeAccounts.length} ${activeAccounts.length === 1 ? 'cuenta' : 'cuentas'} en ${currencyCount} ${currencyCount === 1 ? 'moneda' : 'monedas'}`}
          onClick={() => navigate(ROUTES.ACCOUNTS)}
        />
        <Row
          icon="sell"
          title="Categorías"
          hint={
            activeCategories.length
              ? `${expenseCount} de egreso · ${incomeCount} de ingreso`
              : 'Todavía no creaste ninguna'
          }
          onClick={() => navigate(ROUTES.CATEGORIES)}
        />
        <Row
          icon="currency_exchange"
          title="Cotizaciones"
          hint={rateHint}
          onClick={() => setConversionOpen(true)}
        />
      </ListCard>

      <Box sx={{ pt: 2, pb: 1 }}>
        <GroupHeader label="La app" />
      </Box>
      <ListCard>
        <Row
          icon="logout"
          title="Cerrar sesión"
          color={colors.tertiary}
          chevron={false}
          onClick={() => signOut(auth)}
        />
      </ListCard>

      <Typography
        sx={{ fontSize: 11, color: colors.outline, px: 0.75, pt: 2 }}
      >
        mio · versión 2.0
      </Typography>

      <ConversionSheet
        open={conversionOpen}
        onClose={() => setConversionOpen(false)}
        groups={groups}
        totalUsd={totalUsd}
      />
    </Box>
  );
};
