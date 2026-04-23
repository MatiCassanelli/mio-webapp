import { createTheme } from '@mui/material/styles';

export const DRAWER_WIDTH = 256;

export const colors = {
  primary: '#003fb1',
  primaryContainer: '#1a56db',
  onPrimary: '#ffffff',
  onPrimaryContainer: '#d4dcff',
  primaryFixed: '#dbe1ff',
  onPrimaryFixed: '#00174d',
  onPrimaryFixedVariant: '#003dab',

  secondary: '#006c49',
  secondaryContainer: '#6cf8bb',
  secondaryFixed: '#bafde0',
  onSecondary: '#ffffff',
  onSecondaryContainer: '#088a61',

  tertiary: '#980014',
  tertiaryContainer: '#be1e26',
  tertiaryFixed: '#ffdad7',
  onTertiary: '#ffffff',
  onTertiaryFixed: '#410004',
  onTertiaryContainer: '#ffd3cf',

  error: '#ba1a1a',
  errorContainer: '#ffdad6',
  onError: '#ffffff',

  surface: '#f8f9ff',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#eff4ff',
  surfaceContainer: '#e5eeff',
  surfaceContainerHigh: '#dce9ff',
  surfaceContainerHighest: '#d3e4fe',
  surfaceDim: '#cbdbf5',
  surfaceVariant: '#d3e4fe',

  onSurface: '#0b1c30',
  onSurfaceVariant: '#434654',
  outline: '#737686',
  outlineVariant: '#c3c5d7',

  inverseSurface: '#213145',
  inverseOnSurface: '#eaf1ff',
  inversePrimary: '#b5c4ff',
};

export const theme = createTheme({
  palette: {
    primary: {
      main: colors.primary,
      light: colors.primaryContainer,
      dark: colors.onPrimaryFixed,
      contrastText: colors.onPrimary,
    },
    secondary: {
      main: colors.secondary,
      light: colors.secondaryContainer,
      dark: colors.onSecondaryContainer,
      contrastText: colors.onSecondary,
    },
    error: {
      main: colors.error,
      contrastText: colors.onError,
    },
    background: {
      default: colors.surface,
      paper: colors.surfaceContainerLowest,
    },
    text: {
      primary: colors.onSurface,
      secondary: colors.onSurfaceVariant,
    },
  },
  typography: {
    fontFamily: '"Inter", sans-serif',
    h1: { fontFamily: '"Manrope", sans-serif', fontWeight: 800 },
    h2: { fontFamily: '"Manrope", sans-serif', fontWeight: 800 },
    h3: { fontFamily: '"Manrope", sans-serif', fontWeight: 700 },
    h4: { fontFamily: '"Manrope", sans-serif', fontWeight: 700 },
    h5: { fontFamily: '"Manrope", sans-serif', fontWeight: 700 },
    h6: { fontFamily: '"Manrope", sans-serif', fontWeight: 700 },
  },
  shape: {
    borderRadius: 4,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 700,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          border: 'none',
        },
      },
    },
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

