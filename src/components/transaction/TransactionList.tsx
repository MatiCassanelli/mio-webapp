import { Divider, List, ListItemButton } from '@mui/material';
import { Transaction } from 'types/Transaction';
import { TransactionItem } from 'components/transaction/TransactionItem';
import { useState } from 'react';
import { TransactionFormModal } from 'components/transaction/TransactionFormModal';

export const TransactionList = ({
  transactions,
}: {
  transactions: Transaction[] | undefined;
}) => {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction>();
  return (
    <>
      <List>
        {transactions?.length
          ? transactions?.map((transaction) => (
              <ListItemButton
                key={transaction.id}
                selected={transaction.id === selectedTransaction?.id}
                onClick={() => setSelectedTransaction(transaction)}
              >
                <TransactionItem transaction={transaction} />
                <Divider sx={{ marginY: 1 }} />
              </ListItemButton>
            ))
          : 'No se encontraron movimientos que mostrar'}
      </List>
      {selectedTransaction && (
        <TransactionFormModal
          existingTransaction={selectedTransaction}
          open={!!selectedTransaction}
          onClose={() => {
            setSelectedTransaction(undefined);
          }}
        />
      )}
    </>
  );
};
