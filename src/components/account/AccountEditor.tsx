import { useContext, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Account, ACCOUNT_TYPE_ICON, ACCOUNT_TYPE_LABEL, ACCOUNT_TYPES, AccountType } from 'types/Account';
import { Icon } from 'components/common/Icon';
import { SectionLabel } from 'components/form/SectionLabel';
import { UserContext } from 'context/UserContext';
import { useData } from 'context/DataContext';
import { archiveAccount, createAccount, updateAccount } from 'services/accounts';
import { primaryButtonSx } from 'utils/buttonStyles';
import { colors, tokens } from 'theme';

interface AccountEditorProps {
  /** `null` = create. */
  account: Account | null;
  movementCount: number;
  onClose: () => void;
}

/** The Account carries name, type, and currency — never categories. */
export const AccountEditor = ({
  account,
  movementCount,
  onClose,
}: AccountEditorProps) => {
  const { user } = useContext(UserContext);
  const { currencies, accounts } = useData();
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('cash');
  const [currencyCode, setCurrencyCode] = useState('');
  const [openingBalance, setOpeningBalance] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setName(account?.name ?? '');
    setType(account?.type ?? 'cash');
    setCurrencyCode(account?.currencyCode ?? currencies[0]?.code ?? '');
    setOpeningBalance(
      account?.openingBalance ? String(account.openingBalance).replace('.', ',') : '',
    );
    setError('');
  }, [account, currencies]);

  const lockedCurrency = !!account && movementCount > 0;
  const isValid = name.trim().length > 0 && !!currencyCode;
  const parsedOpeningBalance = parseFloat(openingBalance.replace(',', '.')) || 0;

  /** Shared base Accounts (no `userId`) are everyone's: nobody gets to edit or archive them. */
  const isOwner = !account || account.userId === user?.uid;
  const readOnly = !isOwner;

  const handleSave = async () => {
    if (!isValid || !user || readOnly) return;
    setBusy(true);
    setError('');
    try {
      if (account) {
        await updateAccount(account.id, {
          name: name.trim(),
          type,
          openingBalance: parsedOpeningBalance,
          ...(lockedCurrency ? {} : { currencyCode }),
        });
      } else {
        await createAccount({
          userId: user.uid,
          name: name.trim(),
          type,
          currencyCode,
          openingBalance: parsedOpeningBalance,
          color: colors.primary,
          archived: false,
          order: accounts.length,
        });
      }
      onClose();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  };

  const handleArchive = async () => {
    if (readOnly || !account) return;
    setBusy(true);
    try {
      await archiveAccount(account.id, !account.archived);
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
      {readOnly && (
        <Box
          sx={{
            bgcolor: `${colors.primary}0f`,
            borderRadius: 2.5,
            px: 1.625,
            py: 1.25,
            fontSize: 12,
            color: colors.primary,
            fontWeight: 600,
            lineHeight: 1.45,
          }}
        >
          Cuenta base, compartida por todos los usuarios: no se puede editar ni
          archivar.
        </Box>
      )}

      <Box>
        <SectionLabel>Nombre</SectionLabel>
        <TextField
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          disabled={busy || readOnly}
          placeholder="Efectivo USD"
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: colors.surfaceContainerLow,
              borderRadius: 2,
              fontSize: 14,
              '& fieldset': { border: `2px solid ${colors.primary}33` },
            },
          }}
        />
      </Box>

      <Box>
        <SectionLabel>Tipo</SectionLabel>
        <Box sx={{ display: 'flex', gap: 0.875, flexWrap: 'wrap' }}>
          {ACCOUNT_TYPES.map((option) => {
            const active = option === type;
            return (
              <Box
                key={option}
                onClick={readOnly ? undefined : () => setType(option)}
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.75,
                  height: 32,
                  px: 1.375,
                  borderRadius: '7px',
                  bgcolor: active
                    ? colors.surfaceContainerLow
                    : 'background.default',
                  border: active
                    ? `1.5px solid ${colors.primary}`
                    : `1px solid ${tokens.rule}`,
                  fontFamily: '"Manrope", sans-serif',
                  fontWeight: 800,
                  fontSize: 10,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  color: active ? 'text.primary' : colors.onSurfaceVariant,
                  cursor: readOnly ? 'default' : 'pointer',
                  opacity: readOnly ? 0.5 : 1,
                }}
              >
                <Icon
                  name={ACCOUNT_TYPE_ICON[option]}
                  size={14}
                  color={colors.outline}
                />
                {ACCOUNT_TYPE_LABEL[option]}
              </Box>
            );
          })}
        </Box>
      </Box>

      <Box>
        <SectionLabel>Moneda</SectionLabel>
        <Select
          value={currencyCode}
          onChange={(e) => setCurrencyCode(e.target.value)}
          disabled={lockedCurrency || busy || readOnly}
          fullWidth
          size="small"
          sx={{
            bgcolor: colors.surfaceContainerLow,
            borderRadius: 2,
            fontSize: 14,
            '& fieldset': { border: 'none' },
          }}
        >
          {currencies.map((currency) => (
            <MenuItem key={currency.code} value={currency.code}>
              {currency.name} · {currency.code}
            </MenuItem>
          ))}
        </Select>
        {lockedCurrency && (
          <Typography
            sx={{ fontSize: 11, color: colors.outline, mt: 0.75, lineHeight: 1.4 }}
          >
            La moneda no se puede cambiar si la cuenta ya tiene movimientos.
          </Typography>
        )}
      </Box>

      <Box>
        <SectionLabel>Saldo inicial</SectionLabel>
        <TextField
          value={openingBalance}
          onChange={(e) => {
            const next = e.target.value.replace('.', ',');
            if (/^-?\d*(,\d{0,8})?$/.test(next)) setOpeningBalance(next);
          }}
          fullWidth
          disabled={busy || readOnly}
          placeholder="0,00"
          slotProps={{ htmlInput: { inputMode: 'decimal' } }}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: colors.surfaceContainerLow,
              borderRadius: 2,
              fontSize: 14,
              fontFamily: '"Manrope", sans-serif',
              fontWeight: 800,
              '& fieldset': { border: 'none' },
              '&:focus-within fieldset': { border: `2px solid ${colors.primary}33` },
            },
          }}
        />
        <Typography
          sx={{ fontSize: 11, color: colors.outline, mt: 0.75, lineHeight: 1.4 }}
        >
          La plata que ya había en esta cuenta antes de empezar a cargar
          movimientos en mio. Suma al saldo pero no cuenta como ingreso del
          período — por eso va acá y no como un movimiento.
        </Typography>
      </Box>

      {error && (
        <Typography sx={{ color: 'error.main', fontSize: 13 }}>{error}</Typography>
      )}

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          pt: 1.75,
          borderTop: `1px solid ${tokens.hairline}`,
        }}
      >
        {account && isOwner ? (
          <Button
            onClick={handleArchive}
            disabled={busy}
            startIcon={
              <Icon name={account.archived ? 'unarchive' : 'archive'} size={16} />
            }
            sx={{
              color: account.archived ? colors.secondary : colors.tertiary,
              fontWeight: 700,
              fontSize: 12,
            }}
          >
            {account.archived ? 'Desarchivar' : 'Archivar'}
          </Button>
        ) : (
          <Box />
        )}
        <Button
          variant="contained"
          disabled={!isValid || busy || readOnly}
          onClick={handleSave}
          startIcon={<Icon name="save" size={16} />}
          sx={primaryButtonSx({ py: 1.25, px: 2.25, fontSize: 12 })}
        >
          {busy ? 'Guardando…' : 'Guardar'}
        </Button>
      </Box>

      {account && isOwner && (
        <Typography sx={{ fontSize: 11, color: colors.outline, lineHeight: 1.4 }}>
          Archivar la saca de los selectores sin romper el histórico: sus{' '}
          {movementCount} movimientos siguen donde están.
        </Typography>
      )}
    </Box>
  );
};
