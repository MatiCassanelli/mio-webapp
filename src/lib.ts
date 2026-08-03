const APP_PATH = '';

export const ROUTES = {
  HOME: `${APP_PATH}/`,
  TRANSACTIONS: `${APP_PATH}/transactions`,
  SAVINGS: `${APP_PATH}/savings`,
  ACCOUNTS: `${APP_PATH}/accounts`,
  ACCOUNT_DETAIL: `${APP_PATH}/accounts/:id`,
  CATEGORIES: `${APP_PATH}/categories`,
  PROFILE: `${APP_PATH}/profile`,
  LOGIN: `${APP_PATH}/login`,
};

export const accountDetailRoute = (id: string) => `${APP_PATH}/accounts/${id}`;

/** Desktop side navigation: everything one click away, there's room for it. */
export const DESKTOP_PAGES = [
  { name: 'Inicio', url: ROUTES.HOME, icon: 'account_balance_wallet' },
  { name: 'Movimientos', url: ROUTES.TRANSACTIONS, icon: 'receipt_long' },
  { name: 'Ahorros', url: ROUTES.SAVINGS, icon: 'savings' },
  { name: 'Cuentas', url: ROUTES.ACCOUNTS, icon: 'wallet' },
  { name: 'Categorías', url: ROUTES.CATEGORIES, icon: 'sell' },
];

/**
 * Mobile bottom bar: four destinations and the entry button in the middle.
 * Accounts and Categories are configured once and barely touched again —
 * they live in Profile.
 */
export const MOBILE_PAGES = [
  { name: 'Inicio', url: ROUTES.HOME, icon: 'account_balance_wallet' },
  { name: 'Movimientos', url: ROUTES.TRANSACTIONS, icon: 'receipt_long' },
  { name: 'Ahorros', url: ROUTES.SAVINGS, icon: 'savings' },
  { name: 'Perfil', url: ROUTES.PROFILE, icon: 'account_circle' },
];
