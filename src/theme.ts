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

/**
 * Tokens that repeat across every screen of the redesign. They live here
 * instead of scattered in each component so Account cards, movement rows,
 * and sheets literally share the same shadow and the same radius.
 */
export const tokens = {
  /** Hero card: open account, sheet, detail panel. */
  cardShadow: '0 12px 32px -4px rgba(11,28,48,0.06)',
  /** Secondary card: list row, closed account. */
  rowShadow: '0 4px 12px rgba(11,28,48,0.04)',
  sheetShadow: '0 -20px 50px rgba(11,28,48,0.12)',
  cardRadius: { xs: '20px', md: '24px' },
  /** "Open / selected" marker, always on the left. */
  openMarker: `3px solid #003fb1`,
  hairline: '#c3c5d74d',
  rule: '#c3c5d766',
};

/** Validated color semantics: green for income, red for expense, blue for action. */
export const amountColor = (amount: number, neutral = colors.outlineVariant) => {
  if (amount > 0) return colors.secondary;
  if (amount < 0) return colors.tertiary;
  return neutral;
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

