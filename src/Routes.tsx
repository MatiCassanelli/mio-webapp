import { Navigate, Route, Routes as RoutesDom } from 'react-router-dom';
import { Transactions } from 'pages/Transactions';
import { Login } from 'pages/Login';
import { ReactElement, useContext } from 'react';
import { UserContext } from 'context/UserContext';
import { BasePage } from 'pages/BasePage';
import { Dashboard } from 'pages/Dashboard';
import { ROUTES } from 'lib';
import { Savings } from 'pages/Savings';

const PrivateRoute = ({ children }: { children: ReactElement }) => {
  const { user } = useContext(UserContext);

  if (user) {
    return <BasePage>{children}</BasePage>;
  }

  return <Navigate to={ROUTES.LOGIN} />;
};

export const Routes = () => {
  return (
    <RoutesDom>
      <Route
        path={ROUTES.APP}
        element={
          <PrivateRoute>
            <Transactions />
          </PrivateRoute>
        }
      />
      <Route
        path={ROUTES.TRANSACTIONS}
        element={
          <PrivateRoute>
            <Transactions />
          </PrivateRoute>
        }
      />
      <Route
        path={ROUTES.SAVINGS}
        element={
          <PrivateRoute>
            <Savings />
          </PrivateRoute>
        }
      />
      <Route
        path={ROUTES.DASHBOARD}
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route path={ROUTES.LOGIN} element={<Login />} />
    </RoutesDom>
  );
};
