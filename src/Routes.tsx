import { Navigate, Route, Routes as RoutesDom } from 'react-router-dom';
import { Transactions } from 'pages/Transactions';
import { Login } from 'pages/Login';
import { ReactElement, useContext } from 'react';
import { UserContext } from 'context/UserContext';
import { Dashboard } from 'pages/Dashboard';
import { ROUTES } from 'lib';
import { Savings } from 'pages/Savings';
import { SelectTransaction } from 'pages/SelectTransaction';
import { RegisterMovement } from 'pages/RegisterMovement';
import { CurrencyExchange } from 'pages/CurrencyExchange';
import { EditMovement } from 'pages/EditMovement';
import { AppLayout } from 'components/layout/AppLayout';

const PrivateRoute = ({ children }: { children: ReactElement }) => {
  const { user } = useContext(UserContext);

  if (user) {
    return <AppLayout>{children}</AppLayout>;
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
      <Route
        path={ROUTES.TRANSACTIONS_SELECT}
        element={
          <PrivateRoute>
            <SelectTransaction />
          </PrivateRoute>
        }
      />
      <Route
        path={ROUTES.TRANSACTIONS_NEW}
        element={
          <PrivateRoute>
            <RegisterMovement />
          </PrivateRoute>
        }
      />
      <Route
        path={ROUTES.TRANSACTIONS_EXCHANGE}
        element={
          <PrivateRoute>
            <CurrencyExchange />
          </PrivateRoute>
        }
      />
      <Route
        path={ROUTES.TRANSACTIONS_EDIT}
        element={
          <PrivateRoute>
            <EditMovement />
          </PrivateRoute>
        }
      />
      <Route
        path={ROUTES.SAVINGS_NEW}
        element={
          <PrivateRoute>
            <RegisterMovement saving />
          </PrivateRoute>
        }
      />
      <Route
        path={ROUTES.SAVINGS_EDIT}
        element={
          <PrivateRoute>
            <EditMovement saving />
          </PrivateRoute>
        }
      />
      <Route path={ROUTES.LOGIN} element={<Login />} />
    </RoutesDom>
  );
};
