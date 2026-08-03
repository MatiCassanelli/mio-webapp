import { Currency } from 'types/Currency';

const DEFAULT_DECIMALS = 2;

/** "385.000,00" — no symbol: the currency is already stated by the group or the Account plaque. */
export const formatAmount = (amount: number, currency?: Currency) => {
  const decimals = currency?.decimals ?? DEFAULT_DECIMALS;
  return Math.abs(amount).toLocaleString('es-ar', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/** "+120.000,00" / "-262.400,00" — the sign is part of the reading. */
export const formatSigned = (amount: number, currency?: Currency) => {
  if (amount === 0) return formatAmount(0, currency);
  return `${amount > 0 ? '+' : '-'}${formatAmount(amount, currency)}`;
};

/** No decimals, for the compact "Entró / Salió" cards. */
export const formatCompact = (amount: number) =>
  Math.round(Math.abs(amount)).toLocaleString('es-ar');

/** Converts to USD using the rate the user set. */
export const toUsd = (amount: number, currency?: Currency) => {
  const rate = currency?.usdRate;
  if (!rate) return 0;
  return amount / rate;
};

export const parseRate = (value: string) =>
  parseFloat(value.replace(/\./g, '').replace(',', '.')) || 0;

export const formatRate = (value: number) =>
  value.toLocaleString('es-ar', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 8,
  });
