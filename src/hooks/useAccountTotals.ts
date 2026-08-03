import { useMemo } from 'react';
import { Account } from 'types/Account';
import { Currency } from 'types/Currency';
import { signedAmount, Transaction } from 'types/Transaction';
import { useData } from 'context/DataContext';
import { inPeriod, Period, previousPeriod } from 'utils/period';
import { toUsd } from 'utils/money';

export interface AccountTotals {
  account: Account;
  /** Accumulated across all history: doesn't depend on the period. */
  balance: number;
  /** For the chosen period. Transfers are kept separate on purpose. */
  income: number;
  expense: number;
  net: number;
  transferIn: number;
  transferOut: number;
  /** Names of the accounts on the other side of the period's transfers. */
  transferInFrom: string[];
  transferOutTo: string[];
  movements: number;
}

export interface CurrencyGroup {
  currency: Currency;
  accounts: AccountTotals[];
  total: number;
  totalUsd: number;
}

export interface AccountTotalsResult {
  byAccount: Record<string, AccountTotals>;
  groups: CurrencyGroup[];
  totalUsd: number;
  /** Change vs. the previous period. `null` for "all history". */
  trend: number | null;
}

const emptyTotals = (account: Account): AccountTotals => ({
  account,
  // The balance starts at whatever was already there before mio existed.
  // Without this, a cash account that already held money stays negative forever.
  balance: account.openingBalance ?? 0,
  income: 0,
  expense: 0,
  net: 0,
  transferIn: 0,
  transferOut: 0,
  transferInFrom: [],
  transferOutTo: [],
  movements: 0,
});

/** Balance per account counting only up to `end` (or everything, if there's no `end`). */
const balancesUpTo = (
  transactions: Transaction[],
  accountsById: Record<string, Account>,
  end?: number,
) => {
  const balances: Record<string, number> = Object.fromEntries(
    Object.values(accountsById).map((a) => [a.id, a.openingBalance ?? 0]),
  );
  transactions.forEach((transaction) => {
    if (end != null && transaction.date.toMillis() > end) return;
    const id = transaction.account?.id;
    if (!id) return;
    balances[id] = (balances[id] ?? 0) + signedAmount(transaction);
  });
  return balances;
};

const sumUsd = (
  balances: Record<string, number>,
  accountsById: Record<string, Account>,
  currenciesByCode: Record<string, Currency>,
) =>
  Object.entries(balances).reduce((total, [accountId, balance]) => {
    const account = accountsById[accountId];
    if (!account) return total;
    return total + toUsd(balance, currenciesByCode[account.currencyCode]);
  }, 0);

export const useAccountTotals = (period: Period): AccountTotalsResult => {
  const { accounts, currencies, transactions, accountsById, currenciesByCode } =
    useData();

  return useMemo(() => {
    const byAccount: Record<string, AccountTotals> = Object.fromEntries(
      accounts.map((account) => [account.id, emptyTotals(account)]),
    );

    const inFrom: Record<string, Set<string>> = {};
    const outTo: Record<string, Set<string>> = {};

    transactions.forEach((transaction) => {
      const totals = byAccount[transaction.account?.id];
      if (!totals) return;

      totals.balance += signedAmount(transaction);
      if (!inPeriod(transaction, period)) return;

      totals.movements += 1;
      if (transaction.type === 'income') {
        totals.income += transaction.amount;
      } else if (transaction.type === 'expense') {
        totals.expense += transaction.amount;
      } else if (transaction.transfer?.direction === 'in') {
        totals.transferIn += transaction.amount;
        (inFrom[totals.account.id] ??= new Set()).add(
          transaction.transfer.counterpartAccount.name,
        );
      } else {
        totals.transferOut += transaction.amount;
        (outTo[totals.account.id] ??= new Set()).add(
          transaction.transfer?.counterpartAccount.name ?? '',
        );
      }
    });

    Object.values(byAccount).forEach((totals) => {
      totals.net = totals.income - totals.expense;
      totals.transferInFrom = [...(inFrom[totals.account.id] ?? [])];
      totals.transferOutTo = [...(outTo[totals.account.id] ?? [])];
    });

    const groups: CurrencyGroup[] = currencies
      .map((currency) => {
        const groupAccounts = accounts
          .filter(
            (account) =>
              account.currencyCode === currency.code && !account.archived,
          )
          .map((account) => byAccount[account.id]);
        const total = groupAccounts.reduce((sum, a) => sum + a.balance, 0);
        return {
          currency,
          accounts: groupAccounts,
          total,
          totalUsd: toUsd(total, currency),
        };
      })
      .filter((group) => group.accounts.length > 0);

    const totalUsd = groups.reduce((sum, group) => sum + group.totalUsd, 0);

    // Same criterion as `groups`: an archived account shouldn't move the
    // trend, whether entering or leaving the compared period.
    const activeAccountsById = Object.fromEntries(
      Object.entries(accountsById).filter(([, account]) => !account.archived),
    );

    const previous = previousPeriod(period);
    let trend: number | null = null;
    if (previous?.end) {
      const before = sumUsd(
        balancesUpTo(transactions, activeAccountsById, previous.end.valueOf()),
        activeAccountsById,
        currenciesByCode,
      );
      if (before !== 0) trend = (totalUsd - before) / Math.abs(before);
    }

    return { byAccount, groups, totalUsd, trend };
  }, [accounts, currencies, transactions, accountsById, currenciesByCode, period]);
};
