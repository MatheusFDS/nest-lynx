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
        borderRadius: 8,
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
        borderRadius: 8,
      },
    },
  },
};

const themeColors = {
  primary: '#1F80E0', // Azul Claro
  backgroundDark: '#040714', // Azul Escuro
  backgroundLight: '#E5E7EB', // Cinza Claro
  textPrimary: '#FFFFFF', // Branco
  textSecondary: '#A0AEC0', // Cinza Médio
};

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: themeColors.primary,
    },
    secondary: {
      main: themeColors.backgroundDark,
    },
    background: {
      default: themeColors.backgroundLight,
      paper: '#FFFFFF',
    },
    text: {
      primary: themeColors.backgroundDark,
      secondary: themeColors.textSecondary,
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
      main: themeColors.primary,
    },
    secondary: {
      main: themeColors.backgroundLight,
    },
    background: {
      default: themeColors.backgroundDark,
      paper: '#1A202C',
    },
    text: {
      primary: themeColors.textPrimary,
      secondary: themeColors.textSecondary,
    },
  },
  typography: commonTypography,
  shape: {
    borderRadius: 8,
  },
  components: commonComponents,
});

export { lightTheme, darkTheme };
