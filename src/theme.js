// src/theme.js
import { createTheme, responsiveFontSizes } from '@mui/material/styles';

// Esta función devuelve un objeto de configuración de tema basado en el modo (light o dark)
const getDesignTokens = (mode) => ({
  palette: {
    mode, // El modo se establece aquí: 'light' o 'dark'
    ...(mode === 'light'
      // ====================================================================
      // VALORES PARA MODO CLARO (Tu paleta de colores original)
      // ====================================================================
      ? {
          primary: {
            main: '#7E57C2',
            light: '#B39DDB',
            dark: '#512DA8',
            contrastText: '#FFFFFF',
          },
          secondary: {
            main: '#607D8B',
            light: '#B0BEC5',
            dark: '#455A64',
            contrastText: '#FFFFFF',
          },
          background: {
            default: '#ECEFF1',
            paper: '#FFFFFF',
          },
          text: {
            primary: '#212121',
            secondary: '#757575',
          },
          premium: {
            main: '#009688',
            contrastText: '#FFFFFF',
          },
        }
      // ====================================================================
      // VALORES PARA MODO OSCURO
      // ====================================================================
      : {
          primary: {
            main: '#B39DDB',
            light: '#E6CEFF',
            dark: '#836FA9',
            contrastText: '#000000',
          },
          secondary: {
            main: '#B0BEC5',
            light: '#E2F1F8',
            dark: '#808E95',
            contrastText: '#000000',
          },
          background: {
            default: '#16161D', // Tu color oscuro base
            paper: '#1E1E26',   // Un poco más claro para tarjetas
          },
          text: {
            primary: '#ECEFF1',
            secondary: '#B0BEC5',
          },
          premium: {
            main: '#009688',
            contrastText: '#FFFFFF',
          },
        }),
    // Propiedades comunes que no cambian con el modo
    divider: 'rgba(255, 255, 255, 0.12)',
    error: { main: '#D32F2F' },
    warning: { main: '#F57C00' },
    info: { main: '#0288D1' },
    success: { main: '#388E3C' },
  },
  typography: {
    fontFamily: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'].join(','),
    h1: { fontSize: '2.75rem', fontWeight: 600 },
    h2: { fontSize: '2.25rem', fontWeight: 600 },
    h3: { fontSize: '1.75rem', fontWeight: 600 },
    h4: { fontSize: '1.5rem', fontWeight: 600 },
    h5: { fontSize: '1.25rem', fontWeight: 500 },
    h6: { fontSize: '1.1rem', fontWeight: 500 },
    button: { fontSize: '0.875rem', fontWeight: 500, textTransform: 'none' },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: (themeParam) => ({
        body: {
          // El fondo degradado cambia dependiendo del modo actual
          background: themeParam.palette.mode === 'light'
            ? `radial-gradient(circle at 20% 25%, #e3e8ff, ${themeParam.palette.background.default})`
            : `linear-gradient(to bottom, #21212B, #16161D)`,
          backgroundAttachment: 'fixed',
        }
      }),
    },
    MuiAppBar: {
      defaultProps: { elevation: 0, color: 'transparent' },
      styleOverrides: {
        root: ({theme}) => ({ 
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(8px)',
            ...(theme.palette.mode === 'dark' && {
                backgroundColor: 'rgba(30, 30, 38, 0.75)',
            })
        }),
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

export const createBulkTheme = (mode) => responsiveFontSizes(createTheme(getDesignTokens(mode)));