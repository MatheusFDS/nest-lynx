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

const futuristicPalette = {
  primary: '#0D7377',
  secondary: '#14FFEC',
  background: '#323232',
  surface: '#212121',
  textPrimary: '#E1E1E1',
  textSecondary: '#A1A1A1',
};

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: futuristicPalette.primary,
    },
    secondary: {
      main: futuristicPalette.secondary,
    },
    background: {
      default: '#F5F5F5', // Claro, para melhor contraste com os elementos futurísticos
      paper: '#FFFFFF',
    },
    text: {
      primary: '#0A3D62',
      secondary: '#0A3D62',
    },
  },
  typography: commonTypography,
  shape: {
    borderRadius: 8,
  },
  components: commonComponents,
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: futuristicPalette.primary,
    },
    secondary: {
      main: futuristicPalette.secondary,
    },
    background: {
      default: futuristicPalette.background,
      paper: futuristicPalette.surface,
    },
    text: {
      primary: futuristicPalette.textPrimary,
      secondary: futuristicPalette.textSecondary,
    },
  },
  typography: commonTypography,
  shape: {
    borderRadius: 8,
  },
  components: commonComponents,
});

export { lightTheme, darkTheme };
