import { Navigate, Route, Routes as RoutesDom } from 'react-router-dom';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { ReactElement, useContext } from 'react';
import { UserContext } from './context/UserContext';
const APP_PATH = '';

export const ROUTES = {
  APP: APP_PATH,
  HOME: `${APP_PATH}/home`,
  LOGIN: `${APP_PATH}/login`,
};

const PrivateRoute = ({ children }: { children: ReactElement }) => {
  const { user } = useContext(UserContext);

  if (user) {
    return children;
  }

  return <Navigate to={ROUTES.LOGIN} />;
};

export const Routes = () => {
  return (
    <RoutesDom>
      <Route path={ROUTES.APP}>
        <Route
          path={ROUTES.HOME}
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        <Route path={ROUTES.LOGIN} element={<Login />} />
      </Route>
    </RoutesDom>
  );
};
