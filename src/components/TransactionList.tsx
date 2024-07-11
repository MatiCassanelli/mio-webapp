import { Divider, List } from '@mui/material';
import { Transaction } from '../types/Transaction';
import { Fragment } from 'react';
import { TransactionItem } from './TransactionItem';

export const TransactionList = ({
  transactions,
}: {
  transactions: Transaction[] | undefined;
}) => {
  return (
    <List>
      {transactions?.length
        ? transactions?.map((transaction) => (
            <Fragment key={transaction.id}>
              <TransactionItem transaction={transaction} />
              <Divider sx={{ marginY: 1 }} />
            </Fragment>
          ))
        : 'No se encontraron movimientos que mostrar'}
    </List>
  );
};
