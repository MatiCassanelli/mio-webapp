const APP_PATH = '';

export const ROUTES = {
  APP: APP_PATH,
  TRANSACTIONS: `${APP_PATH}/transactions`,
  LOGIN: `${APP_PATH}/login`,
  DASHBOARD: `${APP_PATH}/dashboard`,
};

export const PAGES = [
  { name: 'Movimientos', url: ROUTES.TRANSACTIONS },
  { name: 'Dashboard', url: ROUTES.DASHBOARD },
];
