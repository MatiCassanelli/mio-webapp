import React, { useMemo } from 'react';
import Box from '@mui/material/Box';
import dayjs from 'dayjs';
import { signedAmount, Transaction } from 'types/Transaction';
import { GroupHeader } from 'components/common/GroupHeader';
import { TransactionRow } from 'components/transaction/TransactionRow';
import { useData } from 'context/DataContext';
import { formatSigned } from 'utils/money';
import { dayLabel } from 'utils/period';
import { amountColor, colors, tokens } from 'theme';

interface TransactionsByDayProps {
  transactions: Transaction[];
  /**
   * `false` inside an Account: the plaque drops from the rows and each
   * transfer shows through the leg that touches that account.
   */
  showAccount?: boolean;
  selectedId?: string;
  onSelect?: (transaction: Transaction) => void;
  /** On mobile the row expands; on desktop it gets selected and the detail lives alongside. */
  renderDetail?: (transaction: Transaction) => React.ReactNode;
}

/** A list row: a movement, or a transfer with both its legs. */
interface Row {
  transaction: Transaction;
  counterpart?: Transaction;
}

interface Day {
  key: string;
  label: string;
  rows: Row[];
  total: number | null;
  currencyCode?: string;
}

export const TransactionsByDay = ({
  transactions,
  showAccount = true,
  selectedId,
  onSelect,
  renderDetail,
}: TransactionsByDayProps) => {
  const { currenciesByCode } = useData();

  /**
   * Looking across all accounts, a transfer is a single fact: it shows as one
   * row with both Accounts and the arrow, represented by the outgoing leg.
   * Inside an Account nothing gets collapsed — only one of the legs lives there.
   */
  const rows = useMemo<Row[]>(() => {
    if (!showAccount) return transactions.map((transaction) => ({ transaction }));

    const byId = new Map(transactions.map((t) => [t.id, t]));
    const consumed = new Set<string>();

    return transactions.reduce<Row[]>((acc, transaction) => {
      if (transaction.id && consumed.has(transaction.id)) return acc;

      const other = transaction.linkedTransactionId
        ? byId.get(transaction.linkedTransactionId)
        : undefined;

      if (transaction.type !== 'transfer' || !other) {
        return [...acc, { transaction }];
      }

      const outgoing =
        transaction.transfer?.direction === 'out' ? transaction : other;
      const incoming =
        transaction.transfer?.direction === 'out' ? other : transaction;
      consumed.add(outgoing.id!);
      consumed.add(incoming.id!);

      return [...acc, { transaction: outgoing, counterpart: incoming }];
    }, []);
  }, [transactions, showAccount]);

  const days = useMemo<Day[]>(() => {
    const grouped = new Map<string, Row[]>();
    rows.forEach((row) => {
      const key = dayjs(row.transaction.date.toDate()).format('YYYY-MM-DD');
      grouped.set(key, [...(grouped.get(key) ?? []), row]);
    });

    return [...grouped.entries()].map(([key, group]) => {
      // Transfers stay out of the day's net: moving money between your own
      // accounts is neither income nor expense. And adding different currencies
      // together would be a lie, so the figure only shows when the day is a single one.
      const real = group.filter((row) => row.transaction.type !== 'transfer');
      const codes = new Set(
        real.map((row) => row.transaction.account?.currencyCode),
      );
      const singleCurrency = codes.size === 1;

      return {
        key,
        label: dayLabel(dayjs(key)),
        rows: group,
        total: singleCurrency
          ? real.reduce((sum, row) => sum + signedAmount(row.transaction), 0)
          : null,
        currencyCode: singleCurrency ? [...codes][0] : undefined,
      };
    });
  }, [rows]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {days.map((day) => (
        <Box
          key={day.key}
          sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
        >
          <Box sx={{ pt: 0.5 }}>
            <GroupHeader
              label={day.label}
              value={
                day.total != null
                  ? formatSigned(
                      day.total,
                      day.currencyCode
                        ? currenciesByCode[day.currencyCode]
                        : undefined,
                    )
                  : undefined
              }
              valueColor={amountColor(day.total ?? 0, colors.outline)}
            />
          </Box>

          <Box
            sx={{
              bgcolor: 'background.paper',
              borderRadius: tokens.cardRadius,
              px: { xs: 1.75, md: 2.25 },
              boxShadow: tokens.rowShadow,
            }}
          >
            {day.rows.map(({ transaction, counterpart }, index) => {
              const selected = transaction.id === selectedId;
              const detail = selected ? renderDetail?.(transaction) : null;
              return (
                <Box
                  key={transaction.id}
                  sx={{
                    borderLeft: detail ? tokens.openMarker : 'none',
                    ml: detail ? '-3px' : 0,
                    pl: detail ? '3px' : 0,
                  }}
                >
                  {index > 0 && (
                    <Box sx={{ height: '1px', bgcolor: tokens.hairline }} />
                  )}
                  <TransactionRow
                    transaction={transaction}
                    currency={currenciesByCode[transaction.account?.currencyCode]}
                    counterpart={counterpart}
                    counterpartCurrency={
                      counterpart &&
                      currenciesByCode[counterpart.account?.currencyCode]
                    }
                    showAccount={showAccount}
                    selected={selected && !detail}
                    onClick={onSelect ? () => onSelect(transaction) : undefined}
                  />
                  {detail && <Box sx={{ pb: 1.75 }}>{detail}</Box>}
                </Box>
              );
            })}
          </Box>
        </Box>
      ))}
    </Box>
  );
};
