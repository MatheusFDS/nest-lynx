import { createTheme } from '@mui/material/styles';

const commonTypography = {
  fontFamily: 'Roboto, Arial, sans-serif',
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
        borderRadius: 8, // Ajustando para ser menos arredondado
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
        borderRadius: 8, // Ajustando para ser menos arredondado
      },
    },
  },
};

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#54678F', // Cor principal da paleta de cores
    },
    secondary: {
      main: '#9199BE', // Cor secundária da paleta de cores
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
  typography: commonTypography,
  shape: {
    borderRadius: 8, // Ajustando para ser menos arredondado
  },
  components: commonComponents,
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#9199BE', // Cor principal da paleta de cores
    },
    secondary: {
      main: '#54678F', // Cor secundária da paleta de cores
    },
    background: {
      default: '#212624', // Fundo escuro
      paper: '#2E303E', // Papel mais escuro
    },
    text: {
      primary: '#C2D3DA', // Texto claro
      secondary: '#6C6B74', // Texto secundário
    },
  },
  typography: commonTypography,
  shape: {
    borderRadius: 8, // Ajustando para ser menos arredondado
  },
  components: commonComponents,
});

export { lightTheme, darkTheme };
