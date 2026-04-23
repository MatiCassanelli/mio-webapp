import { LocalizationProvider } from '@mui/x-date-pickers';
import { Routes } from 'Routes';
import { UserProvider } from 'context/UserContext';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { theme } from 'theme';

import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { CategoryProvider } from 'context/CategoryContext';
dayjs.locale('es');

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <UserProvider>
          <CategoryProvider>
            <Routes />
          </CategoryProvider>
        </UserProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export default App;
