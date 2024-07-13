import { CircularProgress, Container, Typography } from '@mui/material';
import { Transaction } from '../types/Transaction';
import { useContext, useEffect, useState } from 'react';
import { where } from 'firebase/firestore';
import { getTransactionsSnapshot } from '../services/transactions';
import { UserContext } from '../context/UserContext';
import { TransactionList } from '../components/TransactionList';

export const Transactions = () => {
  const { user } = useContext(UserContext);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
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
      filters: [where('userId', '==', user?.uid)],
    });
    return () => unsubscribe();
  }, [user?.uid]);

  if (loading) {
    return <CircularProgress />;
  }
  if (error) {
    <Typography sx={{ wordWrap: 'break-word' }}>{error}</Typography>;
  }

  return (
    <>
      <Container>
        {!loading && !error && <TransactionList transactions={transactions} />}
      </Container>
    </>
  );
};
