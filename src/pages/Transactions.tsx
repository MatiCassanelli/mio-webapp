import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  CircularProgress,
  Container,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Typography,
} from '@mui/material';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import { Transaction } from 'types/Transaction';
import { useContext, useEffect, useState } from 'react';
import { Timestamp, where } from 'firebase/firestore';
import { getTransactionsSnapshot } from 'services/transactions';
import { UserContext } from 'context/UserContext';
import { TransactionList } from 'components/transaction/TransactionList';
import { TransactionFormModal } from 'components/transaction/TransactionFormModal';
import { TotalCardList } from 'components/category/CategoryTotalCard';
import { MonthSelector } from 'components/common/MonthSelector';
import dayjs, { Dayjs } from 'dayjs';
import { BuySellModal } from 'components/transaction/BuySellModal';

export const Transactions = () => {
  const { user } = useContext(UserContext);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [speedDialOpen, setSpeedDialOpen] = useState(false);
  const [newTransactionModalOpen, setNewTransactionModalOpen] = useState(false);
  const [buySellModalOpen, setBuySellModalOpen] = useState(false);
  const [showTotals, setShowTotals] = useState(true);
  const [month, setMonth] = useState<Dayjs>(dayjs());

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
        where('date', '<=', Timestamp.fromDate(endOfMonth)),
        where('date', '>=', Timestamp.fromDate(startOfMonth)),
      ],
    });
    return () => unsubscribe();
  }, [user?.uid, month]);

  const actions = [
    {
      name: 'Crear movimiento',
      icon: <NoteAddIcon />,
      action: () => setNewTransactionModalOpen(true),
    },
    {
      name: 'Movimiento doble',
      icon: <SyncAltIcon />,
      action: () => setBuySellModalOpen(true),
    },
  ];

  return (
    <>
      <Container sx={{ paddingX: 0, paddingBottom: 6, paddingTop: 1.5 }}>
        <MonthSelector onMonthChange={(date) => setMonth(date)} />
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
                <TotalCardList transactions={transactions} />
              </AccordionDetails>
            </Accordion>
            <TransactionList transactions={transactions} />
            <SpeedDial
              ariaLabel="Acciones para movimientos"
              sx={{
                position: 'fixed',
                bottom: 16,
                right: 16,
                '.MuiSpeedDialAction-staticTooltip .MuiSpeedDialAction-staticTooltipLabel':
                  { textWrap: 'nowrap' },
              }}
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
                  onClick={action}
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
      {buySellModalOpen && (
        <BuySellModal
          open={buySellModalOpen}
          onClose={() => setBuySellModalOpen(false)}
        />
      )}
    </>
  );
};
