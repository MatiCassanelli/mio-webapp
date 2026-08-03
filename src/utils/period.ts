import dayjs, { Dayjs } from 'dayjs';
import { Transaction } from 'types/Transaction';

/**
 * Each Account's balance never depends on the period: it's always the
 * accumulated total across all history. The period only changes how much
 * came in and how much went out.
 */
export interface Period {
  /** `null` for "all history". */
  start: Dayjs | null;
  end: Dayjs | null;
  label: string;
  /** Only pure months can be navigated with the arrows. */
  month?: Dayjs;
  isAll: boolean;
}

export const monthPeriod = (month: Dayjs): Period => ({
  start: month.startOf('month'),
  end: month.endOf('month'),
  label: month.format('MMMM YYYY'),
  month,
  isAll: false,
});

export const lastMonthsPeriod = (months: number): Period => {
  const end = dayjs().endOf('month');
  const start = end.subtract(months - 1, 'month').startOf('month');
  return {
    start,
    end,
    label: `${start.format('MMM')} – ${end.format('MMM')}`,
    isAll: false,
  };
};

export const yearPeriod = (year: number): Period => {
  const start = dayjs().year(year).startOf('year');
  return {
    start,
    end: start.endOf('year'),
    label: `Año ${year}`,
    isAll: false,
  };
};

/** Stable by identity: used as a `useMemo` dependency. */
export const ALL_TIME: Period = {
  start: null,
  end: null,
  label: 'Todo el historial',
  isAll: true,
};

export const allTimePeriod = (): Period => ALL_TIME;

export const customPeriod = (start: Dayjs, end: Dayjs): Period => ({
  start: start.startOf('day'),
  end: end.endOf('day'),
  label: `${start.format('DD/MM/YY')} – ${end.format('DD/MM/YY')}`,
  isAll: false,
});

export const inPeriod = (transaction: Transaction, period: Period) => {
  if (period.isAll) return true;
  const date = transaction.date.toMillis();
  if (period.start && date < period.start.valueOf()) return false;
  if (period.end && date > period.end.valueOf()) return false;
  return true;
};

/** The same period shifted one month back, to compare against the previous one. */
export const previousPeriod = (period: Period): Period | null => {
  if (period.isAll || !period.month) return null;
  return monthPeriod(period.month.subtract(1, 'month'));
};

/** "Hoy · 25 jul" / "Ayer · 24 jul" / "22 jul" */
export const dayLabel = (date: Dayjs) => {
  const today = dayjs().startOf('day');
  const day = date.startOf('day');
  const formatted = date.format('DD MMM');
  if (day.isSame(today)) return `Hoy · ${formatted}`;
  if (day.isSame(today.subtract(1, 'day'))) return `Ayer · ${formatted}`;
  return formatted;
};
