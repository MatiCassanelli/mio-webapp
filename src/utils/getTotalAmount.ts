import { Transaction } from "types/Transaction";

export const getTotalAmount = (transactions: Transaction[]) => {
  return transactions.reduce(
    (accum, { amount, income }) => (income ? accum + amount : accum - amount),
    0
  );
};