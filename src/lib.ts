const APP_PATH = '';

export const ROUTES = {
  APP: APP_PATH,
  TRANSACTIONS: `${APP_PATH}/transactions`,
  SAVINGS: `${APP_PATH}/savings`,
  LOGIN: `${APP_PATH}/login`,
  DASHBOARD: `${APP_PATH}/dashboard`,
};

export const PAGES = [
  { name: 'Movimientos', url: ROUTES.TRANSACTIONS },
  { name: 'Acumulado', url: ROUTES.DASHBOARD },
  { name: 'Ahorros', url: ROUTES.SAVINGS },
];
