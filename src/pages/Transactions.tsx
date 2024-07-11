import { CircularProgress, Container, Typography } from '@mui/material';
import { Transaction } from '../types/Transaction';
import { useCallback, useContext, useEffect, useState } from 'react';
import { FirestoreError, where } from 'firebase/firestore';
import { getAllTransactions } from '../services/transactions';
import { UserContext } from '../context/UserContext';
import { TransactionList } from '../components/TransactionList';

export const Transactions = () => {
  const { user } = useContext(UserContext);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const getTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAllTransactions([
        where('userId', '==', user?.uid),
      ]);
      setTransactions(response as Transaction[]);
      setError('');
    } catch (error) {
      setError((error as FirestoreError)?.message);
    }
    setLoading(false);
  }, [user?.uid]);

  useEffect(() => {
    getTransactions();
  }, [getTransactions]);

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
