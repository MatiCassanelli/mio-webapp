import { useState } from 'react';
import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import ListSubheader from '@mui/material/ListSubheader';
import { Account, ACCOUNT_TYPE_ICON } from 'types/Account';
import { Icon } from 'components/common/Icon';
import { useData } from 'context/DataContext';
import { formatAmount } from 'utils/money';
import { colors } from 'theme';

interface AccountSelectProps {
  accounts: Account[];
  value?: Account;
  onChange: (account: Account) => void;
  /** "saldo 385.000,00" or "queda 1.442.500,00" to the right of the field. */
  hint?: string;
  balances?: Record<string, number>;
  disabledIds?: string[];
  placeholder?: string;
}

/** Account field: the same plaque as the rest of the app, inside an input. */
export const AccountSelect = ({
  accounts,
  value,
  onChange,
  hint,
  balances,
  disabledIds = [],
  placeholder = 'Elegí una cuenta',
}: AccountSelectProps) => {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const { currencies, currenciesByCode } = useData();

  const visible = accounts.filter((a) => !a.archived || a.id === value?.id);

  return (
    <>
      <Box
        onClick={(e) => setAnchor(e.currentTarget)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          bgcolor: colors.surfaceContainerLow,
          border: `1px solid ${colors.outlineVariant}80`,
          borderRadius: 2,
          px: 1.5,
          py: 1.25,
          cursor: 'pointer',
        }}
      >
        {value ? (
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.875,
              fontFamily: '"Manrope", sans-serif',
              fontWeight: 800,
              fontSize: 12,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              minWidth: 0,
            }}
          >
            <Icon
              name={ACCOUNT_TYPE_ICON[value.type]}
              size={15}
              color={colors.outline}
            />
            <Box
              component="span"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {value.name}
            </Box>
          </Box>
        ) : (
          <Typography sx={{ fontSize: 13, color: colors.outline }}>
            {placeholder}
          </Typography>
        )}

        <Box
          sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, flexShrink: 0 }}
        >
          {hint && (
            <Typography
              sx={{ fontSize: 10, color: colors.outline, fontWeight: 600 }}
            >
              {hint}
            </Typography>
          )}
          <Icon name="expand_more" size={16} color={colors.outline} />
        </Box>
      </Box>

      <Menu
        anchorEl={anchor}
        open={!!anchor}
        onClose={() => setAnchor(null)}
        slotProps={{ paper: { sx: { borderRadius: 2.5, minWidth: 260 } } }}
      >
        {currencies.flatMap((currency) => {
          const group = visible.filter((a) => a.currencyCode === currency.code);
          if (!group.length) return [];
          return [
            <ListSubheader
              key={currency.code}
              sx={{
                fontFamily: '"Manrope", sans-serif',
                fontWeight: 800,
                fontSize: 10,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: colors.outline,
                lineHeight: '28px',
                bgcolor: 'transparent',
              }}
            >
              {currency.name} · {currency.code}
            </ListSubheader>,
            ...group.map((account) => (
              <MenuItem
                key={account.id}
                disabled={disabledIds.includes(account.id)}
                selected={account.id === value?.id}
                onClick={() => {
                  onChange(account);
                  setAnchor(null);
                }}
                sx={{ gap: 1.25, py: 1 }}
              >
                <Icon
                  name={ACCOUNT_TYPE_ICON[account.type]}
                  size={16}
                  color={colors.outline}
                />
                <Typography sx={{ fontSize: 13, flex: 1 }}>
                  {account.name}
                </Typography>
                {balances && (
                  <Typography
                    sx={{
                      fontFamily: '"Manrope", sans-serif',
                      fontWeight: 800,
                      fontSize: 11,
                      color: colors.outline,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {formatAmount(
                      balances[account.id] ?? 0,
                      currenciesByCode[account.currencyCode],
                    )}
                  </Typography>
                )}
              </MenuItem>
            )),
          ];
        })}
      </Menu>
    </>
  );
};
