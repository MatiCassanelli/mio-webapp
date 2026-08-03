import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Currency } from 'types/Currency';
import { AccountTotals } from 'hooks/useAccountTotals';
import { AccountPlaque } from 'components/account/AccountPlaque';
import { Icon } from 'components/common/Icon';
import { formatAmount, formatSigned } from 'utils/money';
import { amountColor, colors, tokens } from 'theme';

interface AccountCardProps {
  totals: AccountTotals;
  currency?: Currency;
  open: boolean;
  onToggle: () => void;
  /** Opens the account detail: its movements, without mixing with the others. */
  onOpenAccount: () => void;
}

const FlowRow = ({
  label,
  value,
  color,
  share,
  currency,
}: {
  label: string;
  value: number;
  color: string;
  share: number;
  currency?: Currency;
}) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    <Typography
      sx={{
        width: 56,
        flexShrink: 0,
        fontSize: 10,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color,
      }}
    >
      {label}
    </Typography>
    <Box
      sx={{
        width: `${Math.round(share * 100)}%`,
        maxWidth: '46%',
        height: 8,
        borderRadius: '3px',
        bgcolor: color,
        flexShrink: 0,
      }}
    />
    <Typography
      sx={{
        flex: 1,
        textAlign: 'right',
        fontFamily: '"Manrope", sans-serif',
        fontWeight: 800,
        fontSize: 12,
        color: value ? color : colors.outlineVariant,
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {value ? formatSigned(value, currency) : '—'}
    </Typography>
  </Box>
);

const TransferRow = ({
  icon,
  label,
  value,
  currency,
}: {
  icon: string;
  label: string;
  value: number;
  currency?: Currency;
}) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 1,
      bgcolor: `${colors.primary}0f`,
      borderRadius: '10px',
      px: 1.375,
      py: 1,
    }}
  >
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        minWidth: 0,
        fontSize: 10,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: colors.primary,
      }}
    >
      <Icon name={icon} size={14} />
      <Box
        component="span"
        sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
      >
        {label}
      </Box>
    </Box>
    <Typography
      sx={{
        fontFamily: '"Manrope", sans-serif',
        fontWeight: 800,
        fontSize: 12,
        color: colors.primary,
        fontVariantNumeric: 'tabular-nums',
        flexShrink: 0,
      }}
    >
      {formatAmount(value, currency)}
    </Typography>
  </Box>
);

const counterpartLabel = (names: string[], prefix: string) => {
  if (names.length === 1) return `${prefix} ${names[0]}`;
  return `${prefix} ${names.length} cuentas`;
};

/**
 * Balance only by default: the everyday reading. Tapping it expands the
 * full period, without changing screens.
 */
export const AccountCard = ({
  totals,
  currency,
  open,
  onToggle,
  onOpenAccount,
}: AccountCardProps) => {
  const { account, balance, income, expense, net, transferIn, transferOut } = totals;
  const scale = income + expense + transferIn + transferOut || 1;

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderRadius: tokens.cardRadius,
        p: open ? 1.75 : '13px 14px',
        boxShadow: open ? tokens.cardShadow : tokens.rowShadow,
        borderLeft: open ? tokens.openMarker : '3px solid transparent',
        transition: 'box-shadow 0.2s',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        <AccountPlaque account={account} onClick={onOpenAccount} />
        <Box
          onClick={onToggle}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            cursor: 'pointer',
            minWidth: 0,
          }}
        >
          <Typography
            sx={{
              fontFamily: '"Manrope", sans-serif',
              fontWeight: 800,
              fontSize: { xs: 20, md: 22 },
              letterSpacing: '-0.4px',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {formatAmount(balance, currency)}
          </Typography>
          <Icon
            name={open ? 'expand_less' : 'expand_more'}
            size={18}
            color={open ? colors.outline : colors.outlineVariant}
          />
        </Box>
      </Box>

      {open && (
        <Box
          sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 0.875 }}
        >
          <FlowRow
            label="Ingresos"
            value={income}
            color={colors.secondary}
            share={income / scale}
            currency={currency}
          />
          <FlowRow
            label="Egresos"
            value={-expense}
            color={colors.tertiary}
            share={expense / scale}
            currency={currency}
          />

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              pt: 0.875,
              borderTop: `1px solid ${tokens.hairline}`,
            }}
          >
            <Typography
              sx={{
                fontSize: 10,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: colors.onSurfaceVariant,
              }}
            >
              Neto real
            </Typography>
            <Typography
              sx={{
                fontFamily: '"Manrope", sans-serif',
                fontWeight: 800,
                fontSize: 14,
                color: amountColor(net, colors.onSurfaceVariant),
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {formatSigned(net, currency)}
            </Typography>
          </Box>

          {transferIn > 0 && (
            <TransferRow
              icon="south_east"
              label={counterpartLabel(totals.transferInFrom, 'Desde')}
              value={transferIn}
              currency={currency}
            />
          )}
          {transferOut > 0 && (
            <TransferRow
              icon="north_east"
              label={counterpartLabel(totals.transferOutTo, 'Hacia')}
              value={transferOut}
              currency={currency}
            />
          )}
        </Box>
      )}
    </Box>
  );
};
