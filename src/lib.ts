const APP_PATH = '';

export const ROUTES = {
  APP: APP_PATH,
  TRANSACTIONS: `${APP_PATH}/transactions`,
  TRANSACTIONS_SELECT: `${APP_PATH}/transactions/choose`,
  TRANSACTIONS_NEW: `${APP_PATH}/transactions/new`,
  TRANSACTIONS_EXCHANGE: `${APP_PATH}/transactions/exchange`,
  TRANSACTIONS_EDIT: `${APP_PATH}/transactions/:id/edit`,
  SAVINGS: `${APP_PATH}/savings`,
  SAVINGS_NEW: `${APP_PATH}/savings/new`,
  SAVINGS_EDIT: `${APP_PATH}/savings/:id/edit`,
  LOGIN: `${APP_PATH}/login`,
  DASHBOARD: `${APP_PATH}/dashboard`,
};

export const transactionEditRoute = (id: string) =>
  `${APP_PATH}/transactions/${id}/edit`;

export const savingEditRoute = (id: string) =>
  `${APP_PATH}/savings/${id}/edit`;

export const PAGES = [
  { name: 'Movimientos', url: ROUTES.TRANSACTIONS, icon: 'receipt_long' },
  { name: 'Acumulado', url: ROUTES.DASHBOARD, icon: 'bar_chart' },
  { name: 'Ahorros', url: ROUTES.SAVINGS, icon: 'savings' },
];
