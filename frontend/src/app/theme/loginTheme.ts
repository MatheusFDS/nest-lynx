// src/theme/loginTheme.ts
import { createTheme } from '@mui/material/styles';

const loginTheme = createTheme({
  palette: {
    primary: {
      main: '#54678F',
    },
    secondary: {
      main: '#9199BE',
    },
    background: {
        default: '#F0F0F0', // Branco fosco para fundo
        paper: '#E0E0E0', // Branco fosco para papel
    },
    text: {
        primary: '#2E303E', // Texto escuro
        secondary: '#54678F', // Texto secundário
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
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          marginBottom: '20px',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          padding: '10px 20px',
        },
      },
    },
  },
});

export default loginTheme;
