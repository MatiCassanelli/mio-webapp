import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  CircularProgress,
  Container,
  Fab,
  SpeedDialIcon,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Category, SubCategory, Transaction } from 'types/Transaction';
import { useContext, useEffect, useState } from 'react';
import { where } from 'firebase/firestore';
import { getTransactionsSnapshot } from 'services/transactions';
import { UserContext } from 'context/UserContext';
import { TransactionList } from 'components/transaction/TransactionList';
import { TransactionFormModal } from 'components/transaction/TransactionFormModal';
import { CategoriesTotalList } from 'components/category/CategoryTotalCard';

export const Savings = () => {
  const { user } = useContext(UserContext);
  const [savings, setSavings] = useState<Transaction[]>([]);
  const [filteringSavings, setFilteringSavings] = useState<Transaction[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [newTransactionModalOpen, setNewTransactionModalOpen] = useState(false);
  const [showTotals, setShowTotals] = useState(true);
  const [filteringCategory, setFilteringCategory] = useState<Category>();
  const [filteringSubCategory, setFilteringSubCategory] =
    useState<SubCategory>();

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
    setFilteringSavings(
      filteringCategory
        ? savings.filter((x) => x.category.id === filteringCategory?.id)
        : savings
    );
  }, [filteringCategory, savings]);

  useEffect(() => {
    if (filteringSubCategory) {
      const filtered = savings.filter(
        (x) => x.category.subcategory?.id === filteringSubCategory?.id
      );
      setFilteringSavings(filtered);
    } else if (filteringCategory) {
      setFilteringSavings(
        savings.filter((x) => x.category.id === filteringCategory?.id)
      );
    } else {
      setFilteringSavings(savings);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteringSubCategory, savings]);

  return (
    <>
      <Container sx={{ paddingX: 0, paddingBottom: 6, paddingTop: 1.5 }}>
        {loading && <CircularProgress />}
        {error && (
          <Typography sx={{ wordWrap: 'break-word' }}>{error}</Typography>
        )}
        {!loading && !error && (
          <>
            <Accordion
              expanded={showTotals}
              onChange={() => setShowTotals(!showTotals)}
              elevation={0}
              sx={{
                margin: 1,
                '&.Mui-expanded': {
                  margin: 1,
                },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="total-panel"
                id="total-panel"
                sx={{
                  minHeight: '24px',
                  height: '24px',
                  '&.Mui-expanded': {
                    minHeight: '24px',
                    height: '24px',
                  },
                }}
              >
                {showTotals ? 'Ocultar' : 'Ver'} totales
              </AccordionSummary>
              <AccordionDetails sx={{ padding: 0 }}>
                <CategoriesTotalList
                  transactions={savings}
                  setSelectedCategory={setFilteringCategory}
                  selectedCategory={filteringCategory}
                  setSelectedSubCategory={setFilteringSubCategory}
                  selectedSubCategory={filteringSubCategory}
                />
              </AccordionDetails>
            </Accordion>
            <TransactionList transactions={filteringSavings} saving />
            <Fab
              color="primary"
              sx={{
                position: 'fixed',
                bottom: 16,
                right: 16,
                '.MuiSpeedDialAction-staticTooltip .MuiSpeedDialAction-staticTooltipLabel':
                  { textWrap: 'nowrap' },
              }}
              onClick={() => setNewTransactionModalOpen(true)}
            >
              <SpeedDialIcon />
            </Fab>
          </>
        )}
      </Container>
      {newTransactionModalOpen && (
        <TransactionFormModal
          open={newTransactionModalOpen}
          saving
          onClose={() => setNewTransactionModalOpen(false)}
        />
      )}
    </>
  );
};
