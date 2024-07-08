const APP_PATH = '';

export const ROUTES = {
  APP: APP_PATH,
  HOME: `${APP_PATH}/home`,
  LOGIN: `${APP_PATH}/login`,
  DASHBOARD: `${APP_PATH}/dashboard`,
};

export const PAGES = [
  { name: 'Movimientos', url: ROUTES.HOME },
  { name: 'Dashboard', url: ROUTES.DASHBOARD },
];
