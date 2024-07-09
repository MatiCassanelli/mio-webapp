import {
  CircularProgress,
  Container,
  Divider,
  Typography,
} from '@mui/material';
import { TransactionItem } from '../components/TransactionItem';
import { Transaction } from '../types/Transaction';
import { Fragment } from 'react/jsx-runtime';
import { useEffect, useState } from 'react';
import { getAllTransactions } from '../services/transactions';
import { FirestoreError } from 'firebase/firestore';

export const Transactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const getTransactions = async () => {
    setLoading(true);
    try {
      const response = await getAllTransactions();
      setTransactions(response);
      setError('');
    } catch (error) {
      setError((error as FirestoreError).message);
    }
    setLoading(false);
  };

  useEffect(() => {
    getTransactions();
  }, []);

  return (
    <Container>
      {loading && <CircularProgress />}
      {error && <Typography>{error}</Typography>}
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
