import './App.css';
import { Routes } from './Routes';
import UserProvider from './context/UserContext';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

const App = () => {
  return (
    <ThemeProvider theme={createTheme()}>
      <CssBaseline />
      <UserProvider>
        <Routes />
      </UserProvider>
    </ThemeProvider>
  );
};

export default App;
