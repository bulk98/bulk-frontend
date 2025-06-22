// src/theme.js
import { createTheme } from '@mui/material/styles';

const bulkTheme = createTheme({
  palette: {
    primary: {
      main: '#7E57C2', // Lila/Púrpura medio
      light: '#B39DDB',
      dark: '#512DA8',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#607D8B', // Azul grisáceo / plateado
      light: '#B0BEC5',
      dark: '#455A64',
      contrastText: '#FFFFFF',
    },
    error: { main: '#D32F2F' },
    warning: { main: '#F57C00' },
    info: { main: '#0288D1' },
    success: { main: '#388E3C' },
    text: {
      primary: '#212121', // Negro suave
      secondary: '#757575',
      disabled: 'rgba(0, 0, 0, 0.38)',
    },
    background: {
      default: '#ECEFF1', // Este color ya no será el principal, pero se mantiene como fallback
      paper: '#FFFFFF',
    },
    premium: {
      main: '#009688', // Verde azulado (Teal 500)
      contrastText: '#FFFFFF',
    },
    divider: 'rgba(0, 0, 0, 0.12)',
  },
  typography: {
    fontFamily: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'].join(','),
    h1: { fontSize: '2.75rem', fontWeight: 600, color: '#212121' },
    h2: { fontSize: '2.25rem', fontWeight: 600, color: '#212121' },
    h3: { fontSize: '1.75rem', fontWeight: 600, color: '#212121' },
    h4: { fontSize: '1.5rem', fontWeight: 600, color: '#212121' },
    h5: { fontSize: '1.25rem', fontWeight: 500, color: '#212121' },
    h6: { fontSize: '1.1rem', fontWeight: 500, color: '#212121' },
    button: { fontSize: '0.875rem', fontWeight: 500, textTransform: 'none' },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        body {
          /* MODIFICADO: Se cambia a un degradado radial que imita el logo */
          background: radial-gradient(circle at 20% 25%, #e3e8ff, #ede7f6);
          background-attachment: fixed;
        }
      `,
    },
    MuiAppBar: {
      defaultProps: { elevation: 1, color: 'inherit' },
      styleOverrides: {
        root: ({theme}) => ({ color: theme.palette.text.primary, }),
      }
    },
    MuiPaper: { defaultProps: { elevation: 0, variant: "outlined" }, styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiCard: { defaultProps: { elevation: 2, variant: "elevation" } },
    MuiButton: {
      styleOverrides: {
        root: { padding: '8px 20px', },
        containedPrimary: { '&:hover': { backgroundColor: '#512DA8' } },
        containedSecondary: { '&:hover': { backgroundColor: '#455A64' } },
      }
    },
    MuiTextField: { defaultProps: { variant: 'outlined', size: 'small' } },
    MuiChip: {
        styleOverrides: {
          root: ({ ownerState, theme }) => ({
            fontWeight: 500,
            borderRadius: theme.shape.borderRadius / 1.5,
            ...(ownerState.color === 'primary' && { backgroundColor: theme.palette.primary.light, color: theme.palette.primary.dark, }),
            ...(ownerState.color === 'secondary' && { backgroundColor: theme.palette.secondary.light, color: theme.palette.text.primary, }),
            ...(ownerState.color === 'premium' && { backgroundColor: theme.palette.premium.main, color: theme.palette.premium.contrastText, }),
          }),
        }
      },
    MuiDialog: { styleOverrides: { paper: ({ theme }) => ({ borderRadius: theme.shape.borderRadius * 1.2, }), } },
    MuiTooltip: { styleOverrides: { tooltip: ({ theme }) => ({ backgroundColor: theme.palette.grey[800], fontSize: '0.8rem', }), arrow: ({ theme }) => ({ color: theme.palette.grey[800], }), } }
  },
});

export default bulkTheme;