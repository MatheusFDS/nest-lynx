import { createTheme } from '@mui/material/styles';

/**
 * Paleta futurista ajustada:
 * - Azul-petróleo (primary) e verde-água (secondary) para destaque
 * - Fundo (background) em cinza-escuro suave
 * - "surface" levemente transparente, permitindo ver detalhes de fundo
 * - Texto claro, mas não 100% branco puro
 */
const futuristicPalette = {
  primary: '#00838F',       // Azul principal
  secondary: '#14FFEC',     // Verde-água para hover/destaque
  background: '#2D2F33',    // Cinza-escuro suave de fundo
  surface: 'rgba(35, 42, 56, 0.8)', // Superfície levemente transparente
  textPrimary: '#E6E6E6',   // Texto claro (menos brilhante que #FFF)
  textSecondary: '#B0B0B0', // Texto secundário cinza
};

const loginTheme = createTheme({
  palette: {
    primary: {
      main: futuristicPalette.primary,
    },
    secondary: {
      main: futuristicPalette.secondary,
    },
    background: {
      default: futuristicPalette.background, // Fundo escuro futurístico
      paper: futuristicPalette.surface,      // Superfície escura futurística
    },
    text: {
      primary: futuristicPalette.textPrimary,   // Texto claro
      secondary: futuristicPalette.textSecondary, // Texto secundário
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
    },
    button: {
      textTransform: 'none',
      fontWeight: 700,
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '10px',
          padding: '20px',
          backgroundColor: futuristicPalette.surface,
          color: futuristicPalette.textPrimary,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          marginBottom: '20px',
          '& .MuiInputBase-root': {
            color: futuristicPalette.textPrimary,
          },
          '& .MuiInputLabel-root': {
            color: futuristicPalette.textSecondary,
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          padding: '10px 20px',
          backgroundColor: futuristicPalette.primary,
          color: futuristicPalette.textPrimary,
          '&:hover': {
            backgroundColor: futuristicPalette.secondary,
            color: futuristicPalette.background,
          },
        },
      },
    },
  },
});

export default loginTheme;
