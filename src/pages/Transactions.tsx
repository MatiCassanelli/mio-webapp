import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Fab from '@mui/material/Fab';
import { Transaction } from 'types/Transaction';
import { useContext, useEffect, useMemo, useState } from 'react';
import { Timestamp, where } from 'firebase/firestore';
import { getTransactionsSnapshot } from 'services/transactions';
import { UserContext } from 'context/UserContext';
import { TransactionList } from 'components/transaction/TransactionList';
import { CurrencyTotals } from 'components/category/CurrencyTotals';
import { CategoryFilter } from 'components/category/CategoryFilter';
import { MonthNavigator } from 'components/common/MonthSelector';
import { Icon } from 'components/common/Icon';
import dayjs, { Dayjs } from 'dayjs';
import { Loading } from './Loading';
import { CategoryContext } from 'context/CategoryContext';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from 'lib';
import { colors } from 'theme';

export const Transactions = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState<Dayjs>(dayjs());
  const {
    selectedCategory,
    selectedSubCategory,
    setSelectedCategory,
    setSelectedSubCategory,
  } = useContext(CategoryContext);

  useEffect(() => {
    setLoading(true);
    const endOfMonth = month.endOf('month').toDate();
    const startOfMonth = month.startOf('month').toDate();
    const unsubscribe = getTransactionsSnapshot({
      onSuccess: (querySnapshot) => {
        const docs = querySnapshot.docs.map((x) => ({
          ...(x.data() as Transaction),
          id: x.id,
        }));
        setTransactions(docs);
        setLoading(false);
      },
      onError: (error) => {
        setError(error.message);
        setLoading(false);
      },
      filters: [
        where('userId', '==', user?.uid),
        where('saving', '==', false),
        where('date', '<=', Timestamp.fromDate(endOfMonth)),
        where('date', '>=', Timestamp.fromDate(startOfMonth)),
      ],
    });
    return () => unsubscribe();
  }, [month, user?.uid]);

  useEffect(() => {
    setSelectedCategory(undefined);
    setSelectedSubCategory(undefined);
  }, [month, setSelectedCategory, setSelectedSubCategory]);

  const filteredTransactions = useMemo(() => {
    if (selectedSubCategory) {
      return transactions.filter(
        (x) => x.category.subcategory?.id === selectedSubCategory.id,
      );
    }
    if (selectedCategory) {
      return transactions.filter((x) => x.category.id === selectedCategory.id);
    }
    return transactions;
  }, [transactions, selectedCategory, selectedSubCategory]);

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        pb: { xs: 10, sm: 4 },
        maxWidth: 1280,
        mx: 'auto',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          mb: 2,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontFamily: '"Manrope", sans-serif',
              fontWeight: 800,
              letterSpacing: '-0.5px',
            }}
          >
            Movimientos
          </Typography>
          <MonthNavigator onMonthChange={(date) => setMonth(date)} />
        </Box>
        <Button
          variant="contained"
          startIcon={<Icon name="add" size={20} />}
          onClick={() => navigate(ROUTES.TRANSACTIONS_SELECT)}
          sx={{
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryContainer})`,
            borderRadius: 3,
            px: 3,
            py: 1.25,
            fontWeight: 700,
            fontSize: 14,
            boxShadow: `0 4px 14px ${colors.primary}33`,
            '&:hover': { boxShadow: `0 6px 20px ${colors.primary}4d` },
            display: { xs: 'none', sm: 'flex' },
          }}
        >
          Nueva Transacción
        </Button>
      </Box>

      {loading && <Loading />}
      {error ? (
        <Typography sx={{ color: 'error.main', mb: 2 }}>{error}</Typography>
      ) : null}

      {!loading && !error && (
        <>
          <CurrencyTotals transactions={transactions} />
          <CategoryFilter transactions={transactions} />
          <TransactionList transactions={filteredTransactions} />
        </>
      )}

      {/* FAB for mobile */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          display: { xs: 'flex', sm: 'none' },
          background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryContainer})`,
          boxShadow: `0 4px 14px ${colors.primary}4d`,
        }}
        onClick={() => navigate(ROUTES.TRANSACTIONS_SELECT)}
      >
        <Icon name="add" size={24} />
      </Fab>
    </Box>
  );
};
