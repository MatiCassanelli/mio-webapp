import { LocalizationProvider } from '@mui/x-date-pickers';
import './App.css';
import { Routes } from './Routes';
import UserProvider from './context/UserContext';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

const App = () => {
  const customTheme = createTheme({
    components: {
      MuiDialogContent: {
        styleOverrides: {
          root: {
            '&.margined': {
              paddingTop: '8px',
            },
          },
        },
      },
    },
  });
  return (
    <ThemeProvider theme={customTheme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <UserProvider>
          <Routes />
        </UserProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export default App;
