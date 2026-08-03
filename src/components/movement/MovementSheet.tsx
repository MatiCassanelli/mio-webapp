import { useContext, useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import { FirestoreError, Timestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Sheet } from 'components/common/Sheet';
import { Icon } from 'components/common/Icon';
import { EmptyState } from 'components/common/EmptyState';
import { SectionLabel } from 'components/form/SectionLabel';
import { BigAmountInput, parseAmount } from 'components/form/BigAmountInput';
import { AccountSelect } from 'components/account/AccountSelect';
import { CategoryPill } from 'components/category/CategoryPill';
import { UserContext } from 'context/UserContext';
import { useData } from 'context/DataContext';
import { useAccountTotals } from 'hooks/useAccountTotals';
import { Account, accountRef } from 'types/Account';
import { appliesTo, categoryRef, SubCategory } from 'types/Category';
import { signedAmount, Transaction } from 'types/Transaction';
import {
  createTransaction,
  createTransfer,
  editTransaction,
  editTransfer,
} from 'services/transactions';
import { ROUTES } from 'lib';
import { formatAmount } from 'utils/money';
import { ALL_TIME } from 'utils/period';
import { primaryButtonSx } from 'utils/buttonStyles';
import { colors, tokens } from 'theme';

export interface MovementSheetOptions {
  transaction?: Transaction;
  accountId?: string;
  saving?: boolean;
  kind?: Kind;
}

type Kind = 'expense' | 'income' | 'transfer';

const KIND_LABEL: Record<Kind, string> = {
  expense: 'Egreso',
  income: 'Ingreso',
  transfer: 'Transferencia',
};

const KIND_COLOR: Record<Kind, string> = {
  expense: colors.tertiary,
  income: colors.secondary,
  transfer: colors.primary,
};

interface MovementSheetProps extends MovementSheetOptions {
  open: boolean;
  onClose: () => void;
}

export const MovementSheet = ({
  open,
  onClose,
  transaction,
  accountId,
  saving: savingDefault,
  kind: kindDefault,
}: MovementSheetProps) => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const { accounts, categories, transactions, currenciesByCode } = useData();
  const { byAccount } = useAccountTotals(ALL_TIME);

  const [kind, setKind] = useState<Kind>('expense');
  const [amount, setAmount] = useState('');
  const [account, setAccount] = useState<Account>();
  const [categoryId, setCategoryId] = useState('');
  const [subcategory, setSubcategory] = useState<SubCategory>();
  const [date, setDate] = useState<Dayjs>(dayjs());
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [fromAccount, setFromAccount] = useState<Account>();
  const [toAccount, setToAccount] = useState<Account>();
  const [amountOut, setAmountOut] = useState('');
  const [amountIn, setAmountIn] = useState('');
  /** While untouched, what comes in follows what goes out in the same currency. */
  const [amountInTouched, setAmountInTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const balances = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(byAccount).map(([id, totals]) => [id, totals.balance]),
      ),
    [byAccount],
  );

  /** The other leg, when editing an existing transfer. */
  const linkedTransaction = useMemo(
    () =>
      transaction?.linkedTransactionId
        ? transactions.find((t) => t.id === transaction.linkedTransactionId)
        : undefined,
    [transaction, transactions],
  );

  useEffect(() => {
    if (!open) return;
    setError('');
    setBusy(false);

    if (transaction) {
      const isTransferEdit = transaction.type === 'transfer';
      setKind(isTransferEdit ? 'transfer' : (transaction.type as Kind));
      setDate(dayjs(transaction.date.toDate()));
      setDescription(transaction.description);
      setIsSaving(!!transaction.saving);
      setCategoryId(transaction.category?.id ?? '');
      setSubcategory(transaction.category?.subcategory);

      if (isTransferEdit) {
        const out =
          transaction.transfer?.direction === 'out' ? transaction : linkedTransaction;
        const income =
          transaction.transfer?.direction === 'in' ? transaction : linkedTransaction;
        setFromAccount(accounts.find((a) => a.id === out?.account.id));
        setToAccount(accounts.find((a) => a.id === income?.account.id));
        setAmountOut(String(out?.amount ?? '').replace('.', ','));
        setAmountIn(String(income?.amount ?? '').replace('.', ','));
        setAmountInTouched(out?.amount !== income?.amount);
      } else {
        setAccount(accounts.find((a) => a.id === transaction.account.id));
        setAmount(String(transaction.amount).replace('.', ','));
      }
      return;
    }

    // Create: smart defaults, so you don't type the same thing every time.
    const lastUsed = transactions.find((t) => t.type !== 'transfer')?.account.id;
    const preferred =
      accounts.find((a) => a.id === accountId) ??
      accounts.find((a) => a.id === lastUsed) ??
      accounts.find((a) => !a.archived);

    setKind(kindDefault ?? 'expense');
    setAmount('');
    setAccount(preferred);
    setCategoryId('');
    setSubcategory(undefined);
    setDate(dayjs());
    setDescription('');
    setIsSaving(!!savingDefault);
    setFromAccount(preferred);
    setToAccount(undefined);
    setAmountOut('');
    setAmountIn('');
    setAmountInTouched(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, transaction, linkedTransaction, accountId, savingDefault, kindDefault]);

  const currency = account && currenciesByCode[account.currencyCode];
  const fromCurrency = fromAccount && currenciesByCode[fromAccount.currencyCode];
  const toCurrency = toAccount && currenciesByCode[toAccount.currencyCode];
  const sameCurrency =
    !!fromAccount && !!toAccount && fromAccount.currencyCode === toAccount.currencyCode;

  const category = categories.find((c) => c.id === categoryId);
  const availableCategories = categories.filter(
    (c) => !c.archived && kind !== 'transfer' && appliesTo(c, kind),
  );

  const isValidMovement =
    parseAmount(amount) > 0 && !!account && description.trim().length > 0;

  const isValidTransfer =
    !!fromAccount &&
    !!toAccount &&
    fromAccount.id !== toAccount.id &&
    parseAmount(amountOut) > 0 &&
    parseAmount(amountIn) > 0;

  const isValid = kind === 'transfer' ? isValidTransfer : isValidMovement;

  /**
   * `balances` already includes this transfer if an existing one is being
   * edited: what that leg already contributed has to be backed out before
   * adding the new amount's delta, or the preview gets double-counted.
   */
  const alreadyApplied = (accountId?: string) => {
    if (!accountId || transaction?.type !== 'transfer') return 0;
    if (transaction.account.id === accountId) return signedAmount(transaction);
    if (linkedTransaction?.account.id === accountId) {
      return signedAmount(linkedTransaction);
    }
    return 0;
  };

  const remaining = (target?: Account, delta = 0) => {
    if (!target) return undefined;
    const value = (balances[target.id] ?? 0) - alreadyApplied(target.id) + delta;
    return `queda ${formatAmount(value, currenciesByCode[target.currencyCode])}`;
  };

  /**
   * Between different currencies what matters is the resulting rate; in the
   * same currency, any difference between what goes out and what comes in is
   * a fee, and it needs to be visible.
   */
  const transferReadout = (): { label: string; value: string } | null => {
    const out = parseAmount(amountOut);
    const income = parseAmount(amountIn);
    if (!out || !income) return null;

    if (!sameCurrency) {
      return {
        label: 'Te quedó a',
        value: `1 ${toAccount?.currencyCode} = ${(out / income).toLocaleString(
          'es-ar',
          { minimumFractionDigits: 2, maximumFractionDigits: 4 },
        )} ${fromAccount?.currencyCode}`,
      };
    }

    if (out === income) return null;

    const difference = out - income;
    const percent = Math.abs((difference / out) * 100).toLocaleString('es-ar', {
      maximumFractionDigits: 2,
    });
    return {
      label: difference > 0 ? 'Comisión' : 'Diferencia a favor',
      value: `${formatAmount(difference, fromCurrency)} · ${percent}%`,
    };
  };

  const handleSwap = () => {
    setFromAccount(toAccount);
    setToAccount(fromAccount);
    setAmountOut(amountIn);
    setAmountIn(amountOut);
  };

  const handleSubmit = async () => {
    if (!isValid || !user) return;
    setBusy(true);
    setError('');
    try {
      if (kind === 'transfer') {
        const input = {
          userId: user.uid,
          description:
            description.trim() || `De ${fromAccount!.name} a ${toAccount!.name}`,
          date: Timestamp.fromDate(date.toDate()),
          from: accountRef(fromAccount!),
          to: accountRef(toAccount!),
          amountOut: parseAmount(amountOut),
          amountIn: parseAmount(amountIn),
        };

        if (transaction?.id && linkedTransaction?.id) {
          const outId =
            transaction.transfer?.direction === 'out'
              ? transaction.id
              : linkedTransaction.id;
          const inId =
            transaction.transfer?.direction === 'in'
              ? transaction.id
              : linkedTransaction.id;
          await editTransfer(outId, inId, input);
        } else {
          await createTransfer(input);
        }
      } else {
        const payload: Transaction = {
          userId: user.uid,
          amount: parseAmount(amount),
          description: description.trim(),
          date: Timestamp.fromDate(date.toDate()),
          type: kind,
          saving: isSaving,
          account: accountRef(account!),
          ...(category ? { category: categoryRef(category, subcategory) } : {}),
        };
        if (transaction?.id) {
          await editTransaction({ ...payload, id: transaction.id });
        } else {
          await createTransaction(payload);
        }
      }
      onClose();
    } catch (err) {
      setError((err as FirestoreError).message);
      setBusy(false);
    }
  };

  // With no Accounts there's nowhere to load anything: showing the empty form
  // would be a dead end, so this offers to go create the first one instead.
  if (!accounts.length) {
    return (
      <Sheet open={open} onClose={onClose} title="Nuevo movimiento">
        <EmptyState
          icon="account_balance_wallet"
          title="Todavía no tenés cuentas"
          description="Creá tu primera Cuenta antes de cargar un movimiento: ahí es donde vive la plata."
          actionLabel="Ir a Cuentas"
          onAction={() => {
            onClose();
            navigate(ROUTES.ACCOUNTS);
          }}
        />
      </Sheet>
    );
  }

  const title = transaction
    ? kind === 'transfer'
      ? 'Editar transferencia'
      : 'Editar movimiento'
    : kind === 'transfer'
      ? 'Nueva transferencia'
      : 'Nuevo movimiento';

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={title}
      accent={
        kind === 'expense'
          ? [colors.tertiary, colors.tertiaryContainer]
          : kind === 'income'
            ? [colors.secondary, colors.onSecondaryContainer]
            : [colors.primary, colors.primaryContainer]
      }
      footer={
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
          {error && (
            <Typography sx={{ color: 'error.main', fontSize: 13 }}>
              {error}
            </Typography>
          )}
          <Button
            fullWidth
            variant="contained"
            disabled={!isValid || busy}
            startIcon={<Icon name="save" size={18} />}
            onClick={handleSubmit}
            sx={primaryButtonSx({ py: 1.75, fontSize: 14 })}
          >
            {busy
              ? 'Guardando…'
              : kind === 'transfer'
                ? 'Guardar transferencia'
                : 'Guardar Movimiento'}
          </Button>
          <Button
            onClick={onClose}
            disabled={busy}
            sx={{ color: colors.onSurfaceVariant, fontSize: 13, fontWeight: 600 }}
          >
            Cancelar y volver
          </Button>
        </Box>
      }
    >
      {/* Type selector: the transfer is a third option, not another screen */}
      <Box
        sx={{
          display: 'flex',
          bgcolor: colors.surfaceContainerLow,
          borderRadius: 2.5,
          p: 0.375,
          mb: 2,
        }}
      >
        {(Object.keys(KIND_LABEL) as Kind[]).map((option) => {
          const active = kind === option;
          return (
            <Box
              key={option}
              onClick={() => !transaction && setKind(option)}
              sx={{
                flex: 1,
                textAlign: 'center',
                py: 1.125,
                borderRadius: 2,
                fontWeight: 700,
                fontSize: 13,
                cursor: transaction ? 'default' : 'pointer',
                opacity: transaction && !active ? 0.4 : 1,
                bgcolor: active ? 'background.paper' : 'transparent',
                color: active ? KIND_COLOR[option] : colors.outline,
                boxShadow: active ? '0 1px 4px rgba(11,28,48,0.08)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              {KIND_LABEL[option]}
            </Box>
          );
        })}
      </Box>

      {kind === 'transfer' ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
          <Box>
            <SectionLabel>Sale de</SectionLabel>
            <AccountSelect
              accounts={accounts}
              value={fromAccount}
              onChange={setFromAccount}
              balances={balances}
              disabledIds={toAccount ? [toAccount.id] : []}
              hint={remaining(fromAccount, -parseAmount(amountOut))}
            />
            <Box sx={{ mt: 0.75 }}>
              <BigAmountInput
                value={amountOut}
                onChange={(next) => {
                  setAmountOut(next);
                  // With no fee, what comes in is what goes out: it copies itself
                  // until you edit it, and from then on what you typed takes over.
                  if (sameCurrency && !amountInTouched) setAmountIn(next);
                }}
                prefix={fromCurrency?.symbol ?? '$'}
                color={colors.primary}
                disabled={busy}
                size="md"
              />
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pl: 0.5 }}>
            <Icon name="arrow_downward" size={20} color={colors.primary} />
            <Box sx={{ flex: 1, height: '1px', bgcolor: tokens.rule }} />
            <Box
              onClick={handleSwap}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.625,
                height: 24,
                px: 1.125,
                borderRadius: '7px',
                bgcolor: `${colors.primary}14`,
                color: colors.primary,
                fontFamily: '"Manrope", sans-serif',
                fontWeight: 800,
                fontSize: 10,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              <Icon name="swap_vert" size={13} />
              Invertir
            </Box>
          </Box>

          <Box>
            <SectionLabel>Entra en</SectionLabel>
            <AccountSelect
              accounts={accounts}
              value={toAccount}
              onChange={setToAccount}
              balances={balances}
              disabledIds={fromAccount ? [fromAccount.id] : []}
              hint={remaining(toAccount, parseAmount(amountIn))}
            />
            <Box sx={{ mt: 0.75 }}>
              <BigAmountInput
                value={amountIn}
                onChange={(next) => {
                  setAmountIn(next);
                  setAmountInTouched(true);
                }}
                prefix={toCurrency?.symbol ?? '$'}
                color={colors.primary}
                disabled={busy}
                size="md"
              />
            </Box>
          </Box>

          {(() => {
            const readout = transferReadout();
            if (!readout) return null;
            return (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1,
                  bgcolor: `${colors.primary}0f`,
                  borderRadius: 2.5,
                  px: 1.5,
                  py: 1.25,
                }}
              >
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.75,
                    fontSize: 11,
                    color: colors.primary,
                    fontWeight: 600,
                    flexShrink: 0,
                  }}
                >
                  <Icon name="calculate" size={15} />
                  {readout.label}
                </Box>
                <Typography
                  sx={{
                    fontFamily: '"Manrope", sans-serif',
                    fontWeight: 800,
                    fontSize: 13,
                    color: colors.primary,
                    fontVariantNumeric: 'tabular-nums',
                    textAlign: 'right',
                  }}
                >
                  {readout.value}
                </Typography>
              </Box>
            );
          })()}

          <Box>
            <SectionLabel>Fecha</SectionLabel>
            <DatePicker
              value={date}
              onChange={(value) => value && setDate(value)}
              format="DD/MM/YYYY"
              disabled={busy}
              sx={{ width: '100%' }}
            />
          </Box>

          <Box>
            <SectionLabel>Descripción</SectionLabel>
            <TextField
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              disabled={busy}
              placeholder={
                fromAccount && toAccount
                  ? `De ${fromAccount.name} a ${toAccount.name}`
                  : 'Opcional'
              }
              sx={inputSx}
            />
          </Box>

          <Box
            sx={{
              bgcolor: `${colors.primary}0f`,
              borderRadius: 2.5,
              px: 1.625,
              py: 1.375,
              fontSize: 11,
              color: colors.primary,
              lineHeight: 1.45,
            }}
          >
            Mover plata entre tus cuentas no cambia tu total. No se cuenta como
            ingreso ni como egreso.
          </Box>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
          <Box>
            <SectionLabel>Monto</SectionLabel>
            <BigAmountInput
              value={amount}
              onChange={setAmount}
              prefix={currency?.symbol ?? '$'}
              color={KIND_COLOR[kind]}
              disabled={busy}
            />
          </Box>

          <Box>
            <SectionLabel>Cuenta</SectionLabel>
            <AccountSelect
              accounts={accounts}
              value={account}
              onChange={setAccount}
              balances={balances}
              hint={
                account
                  ? `saldo ${formatAmount(balances[account.id] ?? 0, currency)}`
                  : undefined
              }
            />
          </Box>

          <Box>
            <SectionLabel>Categoría</SectionLabel>
            {availableCategories.length ? (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.875 }}>
                {availableCategories.map((option) => (
                  <CategoryPill
                    key={option.id}
                    category={option}
                    size="md"
                    selected={option.id === categoryId}
                    onClick={() => {
                      setCategoryId(option.id === categoryId ? '' : option.id);
                      setSubcategory(undefined);
                    }}
                  />
                ))}
              </Box>
            ) : (
              <Typography sx={{ fontSize: 12, color: colors.outline }}>
                Todavía no creaste categorías de {KIND_LABEL[kind].toLowerCase()}.
                Podés cargar el movimiento igual y categorizarlo después.
              </Typography>
            )}

            {!!category?.subcategories?.length && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.875, mt: 1 }}>
                {category.subcategories.map((sub) => (
                  <CategoryPill
                    key={sub.id}
                    category={{ name: sub.name, color: category.color }}
                    selected={sub.id === subcategory?.id}
                    onClick={() =>
                      setSubcategory(sub.id === subcategory?.id ? undefined : sub)
                    }
                  />
                ))}
              </Box>
            )}
          </Box>

          <Box>
            <SectionLabel>Fecha</SectionLabel>
            <DatePicker
              value={date}
              onChange={(value) => value && setDate(value)}
              format="DD/MM/YYYY"
              disabled={busy}
              sx={{ width: '100%' }}
            />
          </Box>

          <Box>
            <SectionLabel>Descripción</SectionLabel>
            <TextField
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              disabled={busy}
              placeholder="Ej: supermercado, Netflix…"
              sx={inputSx}
            />
          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              bgcolor: `${colors.secondary}0f`,
              borderRadius: 2.5,
              px: 1.625,
              py: 1.25,
            }}
          >
            <Icon name="savings" size={18} color={colors.secondary} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 600 }}>
                Marcar como ahorro
              </Typography>
              <Typography sx={{ fontSize: 10, color: colors.outline, mt: 0.125 }}>
                Sirve para cualquier cuenta
              </Typography>
            </Box>
            <Switch
              checked={isSaving}
              onChange={(e) => setIsSaving(e.target.checked)}
              color="secondary"
            />
          </Box>
        </Box>
      )}
    </Sheet>
  );
};

const inputSx = {
  '& .MuiOutlinedInput-root': {
    bgcolor: colors.surfaceContainerLow,
    borderRadius: 2,
    fontSize: 14,
    '& fieldset': { border: 'none' },
    '&:focus-within fieldset': { border: `2px solid ${colors.primary}33` },
  },
};
