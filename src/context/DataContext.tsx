import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Account } from 'types/Account';
import { Currency } from 'types/Currency';
import { Category } from 'types/Category';
import { Transaction } from 'types/Transaction';
import { getAccountsSnapshot } from 'services/accounts';
import { getCurrenciesSnapshot } from 'services/currencies';
import { getCategoriesSnapshot } from 'services/categories';
import { getUserTransactionsSnapshot } from 'services/transactions';
import { UserContext } from 'context/UserContext';

/**
 * The four collections the app moves, listened to in real time from the
 * client. Writing to Firestore and watching the number update instantly is
 * what keeps loading from feeling like a chore — there's no simulated
 * optimism or `onRequest` Cloud Functions in between.
 */
export interface DataContextProps {
  accounts: Account[];
  currencies: Currency[];
  categories: Category[];
  transactions: Transaction[];
  loading: boolean;
  error: string;
  accountsById: Record<string, Account>;
  currenciesByCode: Record<string, Currency>;
  categoriesById: Record<string, Category>;
}

const empty: DataContextProps = {
  accounts: [],
  currencies: [],
  categories: [],
  transactions: [],
  loading: true,
  error: '',
  accountsById: {},
  currenciesByCode: {},
  categoriesById: {},
};

export const DataContext = createContext<DataContextProps>(empty);

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }: PropsWithChildren) => {
  const { user } = useContext(UserContext);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState('');
  const [ready, setReady] = useState({
    accounts: false,
    currencies: false,
    categories: false,
    transactions: false,
  });

  const uid = user?.uid;

  useEffect(() => {
    if (!uid) return;
    const onError = (e: { message: string }) => setError(e.message);

    const unsubscribers = [
      getAccountsSnapshot({
        onSuccess: (data) => {
          setAccounts(data);
          setReady((r) => ({ ...r, accounts: true }));
        },
        onError,
      }),
      getCurrenciesSnapshot({
        onSuccess: (data) => {
          setCurrencies(data);
          setReady((r) => ({ ...r, currencies: true }));
        },
        onError,
      }),
      getCategoriesSnapshot({
        onSuccess: (data) => {
          setCategories(data);
          setReady((r) => ({ ...r, categories: true }));
        },
        onError,
      }),
      getUserTransactionsSnapshot({
        userId: uid,
        onSuccess: (data) => {
          setTransactions(data);
          setReady((r) => ({ ...r, transactions: true }));
        },
        onError,
      }),
    ];

    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [uid]);

  const value = useMemo<DataContextProps>(() => {
    // Shared base Accounts/Categories (no `userId`) are everyone's; the ones
    // made through the app carry their creator's uid and stay private to them.
    const visibleAccounts = accounts.filter(
      (a) => !a.userId || a.userId === uid,
    );
    const visibleCategories = categories.filter(
      (c) => !c.userId || c.userId === uid,
    );

    return {
      accounts: visibleAccounts,
      currencies,
      categories: visibleCategories,
      transactions,
      error,
      loading: !(
        ready.accounts &&
        ready.currencies &&
        ready.categories &&
        ready.transactions
      ),
      accountsById: Object.fromEntries(visibleAccounts.map((a) => [a.id, a])),
      currenciesByCode: Object.fromEntries(currencies.map((c) => [c.code, c])),
      categoriesById: Object.fromEntries(
        visibleCategories.map((c) => [c.id, c]),
      ),
    };
  }, [accounts, currencies, categories, transactions, error, ready, uid]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
