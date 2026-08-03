/** Where money lives. Never carries categories. */
export type AccountType = 'cash' | 'bank' | 'card' | 'wallet' | 'crypto';

export interface Account {
  id: string;
  /** Absent on shared base Accounts; set to the creator's uid on Accounts made through the app. */
  userId?: string;
  name: string;
  /** FK to Currency.code */
  currencyCode: string;
  color: string;
  type: AccountType;
  archived: boolean;
  /** The order of the Accounts list is the order on Home. */
  order: number;
  openingBalance?: number;
}

/** Snapshot of the Account stored inside each Transaction. */
export interface AccountRef {
  id: string;
  name: string;
  currencyCode: string;
  color: string;
  type: AccountType;
}

export const accountRef = (account: Account | AccountRef): AccountRef => ({
  id: account.id,
  name: account.name,
  currencyCode: account.currencyCode,
  color: account.color,
  type: account.type,
});

/** Material Symbols icon per account type — the plaque is never colored. */
export const ACCOUNT_TYPE_ICON: Record<AccountType, string> = {
  cash: 'payments',
  bank: 'account_balance',
  card: 'credit_card',
  wallet: 'account_balance_wallet',
  crypto: 'currency_bitcoin',
};

export const ACCOUNT_TYPE_LABEL: Record<AccountType, string> = {
  cash: 'Efectivo',
  bank: 'Cuenta bancaria',
  card: 'Tarjeta',
  wallet: 'Billetera',
  crypto: 'Billetera cripto',
};

export const ACCOUNT_TYPES = Object.keys(ACCOUNT_TYPE_ICON) as AccountType[];
