import { createTheme } from '@mui/material/styles';

const futuristicPalette = {
  primary: '#0D7377',
  secondary: '#14FFEC',
  background: '#323232',
  surface: '#212121',
  textPrimary: '#E1E1E1',
  textSecondary: '#A1A1A1',
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
      paper: futuristicPalette.surface, // Superfície escura futurística
    },
    text: {
      primary: futuristicPalette.textPrimary, // Texto claro
      secondary: futuristicPalette.textSecondary, // Texto secundário claro
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
