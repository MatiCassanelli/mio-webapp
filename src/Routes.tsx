import { Navigate, Route, Routes as RoutesDom } from 'react-router-dom';
import { ReactElement, useContext } from 'react';
import { UserContext } from 'context/UserContext';
import { DataProvider } from 'context/DataContext';
import { MovementSheetProvider } from 'context/MovementSheetContext';
import { AppLayout } from 'components/layout/AppLayout';
import { Home } from 'pages/Home';
import { Transactions } from 'pages/Transactions';
import { AccountDetail } from 'pages/AccountDetail';
import { Savings } from 'pages/Savings';
import { AccountsAdmin } from 'pages/AccountsAdmin';
import { CategoriesAdmin } from 'pages/CategoriesAdmin';
import { Profile } from 'pages/Profile';
import { Login } from 'pages/Login';
import { ROUTES } from 'lib';

const PrivateRoute = ({ children }: { children: ReactElement }) => {
  const { user } = useContext(UserContext);

  if (!user) return <Navigate to={ROUTES.LOGIN} />;

  return (
    <DataProvider>
      <MovementSheetProvider>
        <AppLayout>{children}</AppLayout>
      </MovementSheetProvider>
    </DataProvider>
  );
};

const routes: { path: string; element: ReactElement }[] = [
  { path: ROUTES.HOME, element: <Home /> },
  { path: ROUTES.TRANSACTIONS, element: <Transactions /> },
  { path: ROUTES.SAVINGS, element: <Savings /> },
  { path: ROUTES.ACCOUNTS, element: <AccountsAdmin /> },
  { path: ROUTES.ACCOUNT_DETAIL, element: <AccountDetail /> },
  { path: ROUTES.CATEGORIES, element: <CategoriesAdmin /> },
  { path: ROUTES.PROFILE, element: <Profile /> },
];

export const Routes = () => (
  <RoutesDom>
    {routes.map(({ path, element }) => (
      <Route
        key={path}
        path={path}
        element={<PrivateRoute>{element}</PrivateRoute>}
      />
    ))}
    <Route path={ROUTES.LOGIN} element={<Login />} />
    <Route path="*" element={<Navigate to={ROUTES.HOME} />} />
  </RoutesDom>
);
