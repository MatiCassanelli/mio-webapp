import { LocalizationProvider } from '@mui/x-date-pickers';
import { Routes } from 'Routes';
import UserProvider from 'context/UserContext';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import dayjs from 'dayjs';
import 'dayjs/locale/es';
dayjs.locale('es');

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
