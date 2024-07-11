import {
  CircularProgress,
  Container,
  Divider,
  Typography,
} from '@mui/material';
import { TransactionItem } from '../components/TransactionItem';
import { Transaction } from '../types/Transaction';
import { Fragment } from 'react/jsx-runtime';
import { useCallback, useContext, useEffect, useState } from 'react';
import { FirestoreError, where } from 'firebase/firestore';
import { getAllTransactions } from '../services/transactions';
import { UserContext } from '../context/UserContext';

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

  return (
    <Container>
      {loading && <CircularProgress />}
      {error && (
        <Typography sx={{ wordWrap: 'break-word' }}>{error}</Typography>
      )}
      {!loading &&
        !error &&
        transactions.map((transaction) => (
          <Fragment key={transaction.id}>
            <TransactionItem transaction={transaction} />
            <Divider sx={{ marginY: 1 }} />
          </Fragment>
        ))}
    </Container>
  );
};
