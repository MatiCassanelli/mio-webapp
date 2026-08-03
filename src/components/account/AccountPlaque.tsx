import Box from '@mui/material/Box';
import { SxProps } from '@mui/material/styles';
import { AccountRef, ACCOUNT_TYPE_ICON } from 'types/Account';
import { Icon } from 'components/common/Icon';
import { colors } from 'theme';

interface AccountPlaqueProps {
  account: Pick<AccountRef, 'name' | 'type'>;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  /** Chevron on the right, when the plaque opens a selector. */
  expandable?: boolean;
  sx?: SxProps;
}

const SIZES = {
  sm: { height: 22, px: 0.875, font: 10, icon: 12 },
  md: { height: 24, px: 1, font: 10, icon: 13 },
  lg: { height: 26, px: 1.125, font: 11, icon: 14 },
};

/**
 * The Account always looks like this: rectangular plaque, 7px corner, neutral
 * background, and an icon for the account type. Never colored — color belongs to Category.
 */
export const AccountPlaque = ({
  account,
  size = 'md',
  onClick,
  expandable,
  sx,
}: AccountPlaqueProps) => {
  const dims = SIZES[size];

  return (
    <Box
      component="span"
      onClick={onClick}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.625,
        height: dims.height,
        px: dims.px,
        borderRadius: '7px',
        bgcolor: colors.surfaceContainerLow,
        border: `1px solid ${colors.outlineVariant}80`,
        fontFamily: '"Manrope", sans-serif',
        fontWeight: 800,
        fontSize: dims.font,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        color: colors.onSurfaceVariant,
        whiteSpace: 'nowrap',
        flexShrink: 0,
        cursor: onClick ? 'pointer' : 'inherit',
        ...sx,
      }}
    >
      <Icon
        name={ACCOUNT_TYPE_ICON[account.type] ?? 'account_balance_wallet'}
        size={dims.icon}
        color={colors.outline}
      />
      {account.name}
      {expandable && (
        <Icon name="expand_more" size={dims.icon} color={colors.outline} />
      )}
    </Box>
  );
};
