import {
  CircularProgress,
  Container,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Typography,
} from '@mui/material';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import { Transaction } from '../types/Transaction';
import { useContext, useEffect, useState } from 'react';
import { where } from 'firebase/firestore';
import { getTransactionsSnapshot } from '../services/transactions';
import { UserContext } from '../context/UserContext';
import { TransactionList } from '../components/TransactionList';
import { TransactionFormModal } from '../components/TransactionFormModal';

export const Transactions = () => {
  const { user } = useContext(UserContext);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [speedDialOpen, setSpeedDialOpen] = useState(false);
  const [newTransactionModalOpen, setNewTransactionModalOpen] = useState(false);

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

  const actions = [
    {
      name: 'Crear movimiento',
      icon: <NoteAddIcon />,
      action: () => setNewTransactionModalOpen(true),
    },
  ];

  if (loading) {
    return <CircularProgress />;
  }
  if (error) {
    <Typography sx={{ wordWrap: 'break-word' }}>{error}</Typography>;
  }

  return (
    <>
      <Container>
        {!loading && !error && (
          <>
            <TransactionList transactions={transactions} />
            <SpeedDial
              ariaLabel="Acciones para movimientos"
              sx={{ position: 'absolute', bottom: 16, right: 16 }}
              icon={<SpeedDialIcon />}
              onClose={() => setSpeedDialOpen(false)}
              onOpen={() => setSpeedDialOpen(true)}
              open={speedDialOpen}
            >
              {actions.map(({ name, icon, action }) => (
                <SpeedDialAction
                  key={name}
                  icon={icon}
                  tooltipTitle={name}
                  tooltipOpen
                  onClick={() => {
                    setSpeedDialOpen(false);
                    action();
                  }}
                />
              ))}
            </SpeedDial>
          </>
        )}
      </Container>
      {newTransactionModalOpen && (
        <TransactionFormModal
          open={newTransactionModalOpen}
          onClose={() => setNewTransactionModalOpen(false)}
        />
      )}
    </>
  );
};
