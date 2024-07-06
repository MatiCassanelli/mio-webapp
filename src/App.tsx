import './App.css';
import { Routes } from './Routes';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

const App = () => {
  return (
    <ThemeProvider theme={createTheme()}>
      <CssBaseline />
      <Routes />
    </ThemeProvider>
  );
};

export default App;
