import { useState } from 'react';
import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { Icon } from 'components/common/Icon';
import { CategoryPill } from 'components/category/CategoryPill';
import { useData } from 'context/DataContext';
import { ACCOUNT_TYPE_ICON } from 'types/Account';
import { colors, tokens } from 'theme';

interface TransactionFiltersProps {
  accountId?: string;
  onAccountChange: (accountId?: string) => void;
  categoryId?: string;
  onCategoryChange: (categoryId?: string) => void;
}

/**
 * The two combinable filters, each shaped like its entity: the Account is a
 * rectangular plaque, the Category a pill.
 */
export const TransactionFilters = ({
  accountId,
  onAccountChange,
  categoryId,
  onCategoryChange,
}: TransactionFiltersProps) => {
  const { accounts, categories, accountsById, categoriesById } = useData();
  const [accountAnchor, setAccountAnchor] = useState<HTMLElement | null>(null);
  const [categoryAnchor, setCategoryAnchor] = useState<HTMLElement | null>(null);

  const account = accountId ? accountsById[accountId] : undefined;
  const category = categoryId ? categoriesById[categoryId] : undefined;

  return (
    <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center', flexWrap: 'wrap' }}>
      <Box
        onClick={(e) => setAccountAnchor(e.currentTarget)}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.625,
          height: 27,
          px: 1.25,
          borderRadius: '7px',
          bgcolor: colors.surfaceContainerLow,
          border: `1px solid ${colors.outlineVariant}80`,
          fontFamily: '"Manrope", sans-serif',
          fontWeight: 800,
          fontSize: 10,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          color: colors.onSurfaceVariant,
          cursor: 'pointer',
        }}
      >
        <Icon
          name={account ? ACCOUNT_TYPE_ICON[account.type] : 'account_balance_wallet'}
          size={13}
          color={colors.outline}
        />
        {account?.name ?? 'Todas las cuentas'}
        <Icon name="expand_more" size={13} color={colors.outline} />
      </Box>

      <Box
        onClick={(e) => setCategoryAnchor(e.currentTarget)}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.625,
          height: 25,
          px: 1.25,
          borderRadius: 999,
          bgcolor: category ? `${category.color}1f` : 'background.default',
          border: `1px solid ${category ? category.color : tokens.rule}`,
          color: category ? category.color : colors.onSurfaceVariant,
          fontWeight: 700,
          fontSize: 10,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          cursor: 'pointer',
        }}
      >
        {category?.name ?? 'Categorías'}
        <Icon name="expand_more" size={13} />
      </Box>

      <Menu
        anchorEl={accountAnchor}
        open={!!accountAnchor}
        onClose={() => setAccountAnchor(null)}
        slotProps={{ paper: { sx: { borderRadius: 2.5, minWidth: 220 } } }}
      >
        <MenuItem
          onClick={() => {
            onAccountChange(undefined);
            setAccountAnchor(null);
          }}
          selected={!accountId}
          sx={{ fontSize: 13 }}
        >
          Todas las cuentas
        </MenuItem>
        {accounts
          .filter((a) => !a.archived)
          .map((option) => (
            <MenuItem
              key={option.id}
              selected={option.id === accountId}
              onClick={() => {
                onAccountChange(option.id);
                setAccountAnchor(null);
              }}
              sx={{ gap: 1.25, fontSize: 13 }}
            >
              <Icon
                name={ACCOUNT_TYPE_ICON[option.type]}
                size={16}
                color={colors.outline}
              />
              {option.name}
            </MenuItem>
          ))}
      </Menu>

      <Menu
        anchorEl={categoryAnchor}
        open={!!categoryAnchor}
        onClose={() => setCategoryAnchor(null)}
        slotProps={{ paper: { sx: { borderRadius: 2.5, minWidth: 220 } } }}
      >
        <MenuItem
          onClick={() => {
            onCategoryChange(undefined);
            setCategoryAnchor(null);
          }}
          selected={!categoryId}
          sx={{ fontSize: 13 }}
        >
          Todas las categorías
        </MenuItem>
        {categories.filter((c) => !c.archived).length === 0 && (
          <MenuItem disabled sx={{ fontSize: 12 }}>
            <Typography sx={{ fontSize: 12, color: colors.outline }}>
              Todavía no hay categorías
            </Typography>
          </MenuItem>
        )}
        {categories
          .filter((c) => !c.archived)
          .map((option) => (
            <MenuItem
              key={option.id}
              selected={option.id === categoryId}
              onClick={() => {
                onCategoryChange(option.id);
                setCategoryAnchor(null);
              }}
            >
              <CategoryPill category={option} />
            </MenuItem>
          ))}
      </Menu>
    </Box>
  );
};
