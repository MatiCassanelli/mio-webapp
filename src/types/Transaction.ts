import { Timestamp } from 'firebase/firestore';
import { AccountRef } from './Account';
import { CategoryRef } from './Category';

export type TransactionType = 'income' | 'expense' | 'transfer';

/** The two legs of a transfer: the outgoing one and the incoming one. */
export interface TransferLeg {
  direction: 'in' | 'out';
  counterpartAccount: AccountRef;
}

export interface Transaction {
  id?: string;
  userId?: string;
  /** Always positive. The sign comes from `type`. */
  amount: number;
  description: string;
  date: Timestamp;
  type: TransactionType;
  /** Attribute of the movement, not of the Account: any account can hold savings. */
  saving: boolean;
  account: AccountRef;
  /** Optional: transfers don't carry a Category, and neither does the migrated history. */
  category?: CategoryRef;
  transfer?: TransferLeg;
  linkedTransactionId?: string;
  schemaVersion?: number;
}

export const SCHEMA_VERSION = 2;

/** How much this movement adds to or subtracts from its Account's balance. */
export const signedAmount = (transaction: Transaction): number => {
  if (transaction.type === 'income') return transaction.amount;
  if (transaction.type === 'expense') return -transaction.amount;
  return transaction.transfer?.direction === 'in'
    ? transaction.amount
    : -transaction.amount;
};

export const isTransfer = (transaction: Transaction) =>
  transaction.type === 'transfer';
