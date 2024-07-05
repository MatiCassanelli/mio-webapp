import { Route, Routes as RoutesDom } from 'react-router-dom';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
const APP_PATH = '';

export const ROUTES = {
  APP: APP_PATH,
  HOME: `${APP_PATH}/home`,
  LOGIN: `${APP_PATH}/login`,
};

export const Routes = () => {
  return (
    <RoutesDom>
      <Route path={ROUTES.APP}>
        {/* Public routes */}
        <Route path={ROUTES.HOME} element={<Home />} />
        <Route path={ROUTES.LOGIN} element={<Login />} />
        {/* <Route path={ROUTES.UNAUTHORIZED} element={<Unauthorized />} /> */}
      </Route>
    </RoutesDom>
  );
};
