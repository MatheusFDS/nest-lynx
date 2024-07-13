import { createTheme } from '@mui/material/styles';

const commonTypography = {
  fontFamily: 'GothicA1, Roboto, Arial, sans-serif',
  h1: {
    fontSize: '2.5rem',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
  },
  h2: {
    fontSize: '2rem',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
  },
  h3: {
    fontSize: '1.75rem',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
  },
  button: {
    textTransform: 'none' as const,
    fontWeight: 700,
  },
};

const commonComponents = {
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        boxShadow: 'none',
        padding: '8px 16px',
        '&:hover': {
          boxShadow: 'none',
        },
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: 12,
      },
    },
  },
};

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#54678F', // Azul intermediário
    },
    secondary: {
      main: '#9199BE', // Azul claro
    },
    background: {
      default: '#F5F5F5', // Fundo claro
      paper: '#FFFFFF', // Papel branco
    },
    text: {
      primary: '#2E303E', // Texto escuro
      secondary: '#6C6B74', // Texto secundário
    },
  },
  typography: commonTypography,
  shape: {
    borderRadius: 12,
  },
  components: commonComponents,
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#9199BE', // Azul claro
    },
    secondary: {
      main: '#54678F', // Azul intermediário
    },
    background: {
      default: '#212624', // Fundo escuro
      paper: '#2E303E', // Papel mais escuro
    },
    text: {
      primary: '#F5F5F5', // Texto claro
      secondary: '#6C6B74', // Texto secundário
    },
  },
  typography: commonTypography,
  shape: {
    borderRadius: 12,
  },
  components: commonComponents,
});

export { lightTheme, darkTheme };
