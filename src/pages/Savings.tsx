import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Fab from '@mui/material/Fab';
import Typography from '@mui/material/Typography';
import { Transaction } from 'types/Transaction';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { where } from 'firebase/firestore';
import { getTransactionsSnapshot } from 'services/transactions';
import { UserContext } from 'context/UserContext';
import { TransactionList } from 'components/transaction/TransactionList';
import { CurrencyTotals } from 'components/category/CurrencyTotals';
import { CategoryFilter } from 'components/category/CategoryFilter';
import { CategoryContext } from 'context/CategoryContext';
import { Icon } from 'components/common/Icon';
import { Loading } from './Loading';
import { colors } from 'theme';
import { ROUTES } from 'lib';

export const Savings = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [savings, setSavings] = useState<Transaction[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const {
    selectedCategory,
    selectedSubCategory,
    setSelectedCategory,
    setSelectedSubCategory,
  } = useContext(CategoryContext);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = getTransactionsSnapshot({
      onSuccess: (querySnapshot) => {
        const docs = querySnapshot.docs.map((x) => ({
          ...(x.data() as Transaction),
          id: x.id,
        }));
        setSavings(docs);
        setLoading(false);
      },
      onError: (error) => {
        setError(error.message);
        setLoading(false);
      },
      filters: [where('userId', '==', user?.uid), where('saving', '==', true)],
    });
    return () => unsubscribe();
  }, [user?.uid]);

  useEffect(() => {
    setSelectedCategory(undefined);
    setSelectedSubCategory(undefined);
  }, [setSelectedCategory, setSelectedSubCategory]);

  const filteredSavings = useMemo(() => {
    if (selectedSubCategory) {
      return savings.filter(
        (x) => x.category.subcategory?.id === selectedSubCategory.id,
      );
    }
    if (selectedCategory) {
      return savings.filter((x) => x.category.id === selectedCategory.id);
    }
    return savings;
  }, [savings, selectedCategory, selectedSubCategory]);

  return (
    <>
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
              Ahorros
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Icon name="add" size={20} />}
            onClick={() => navigate(ROUTES.SAVINGS_NEW)}
            sx={{
              background: `linear-gradient(135deg, ${colors.secondary}, ${colors.secondaryContainer})`,
              borderRadius: 3,
              px: 3,
              py: 1.25,
              fontWeight: 700,
              fontSize: 14,
              color: 'white',
              boxShadow: `0 4px 14px ${colors.secondary}33`,
              '&:hover': { boxShadow: `0 6px 20px ${colors.secondary}4d` },
              display: { xs: 'none', sm: 'flex' },
            }}
          >
            Nuevo Ahorro
          </Button>
        </Box>

        {loading && <Loading />}
        {error && (
          <Typography sx={{ color: 'error.main', mb: 2 }}>{error}</Typography>
        )}

        {!loading && !error && (
          <>
            <CurrencyTotals transactions={savings} />
            <CategoryFilter transactions={savings} />
            <TransactionList transactions={filteredSavings} saving />
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
            background: `linear-gradient(135deg, ${colors.secondary}, ${colors.secondaryContainer})`,
            boxShadow: `0 4px 14px ${colors.secondary}4d`,
          }}
          onClick={() => navigate(ROUTES.SAVINGS_NEW)}
        >
          <Icon name="add" size={24} />
        </Fab>
      </Box>
    </>
  );
};
