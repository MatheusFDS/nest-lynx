import { createTheme } from '@mui/material/styles';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#3f51b5', // Ajustado para um tom mais suave
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#e0e0e0', // Tom mais suave de cinza claro
      paper: '#f5f5f5',
    },
    text: {
      primary: '#212121', // Ajustado para um tom mais escuro
      secondary: '#757575',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h1: {
      fontSize: '2.2rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '1.8rem',
      fontWeight: 500,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
    button: {
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9', // Ajustado para um tom mais suave de azul
    },
    secondary: {
      main: '#f48fb1', // Ajustado para um tom mais suave de rosa
    },
    background: {
      default: '#1c1c1c', // Tom mais suave de cinza escuro
      paper: '#2e2e2e', // Tom mais suave de cinza médio
    },
    text: {
      primary: '#e0e0e0', // Ajustado para um tom mais claro
      secondary: '#b3b3b3',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h1: {
      fontSize: '2.2rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '1.8rem',
      fontWeight: 500,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
    button: {
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
  },
});

export { lightTheme, darkTheme };
