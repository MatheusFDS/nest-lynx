// src/theme.ts

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
        borderRadius: 4, // Reduzido de 8 para 4
        boxShadow: 'none',
        padding: '8px 16px',
        '&:hover': {
          boxShadow: 'none',
        },
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 4, // Exemplo adicional para outros componentes
      },
    },
  },
};

const themeColors = {
  primary: '#00838F',
  backgroundDark: '#0A1929',
  backgroundLight: '#ECEFF1', // Tom de cinza mais suave
  textPrimary: '#FFFFFF',
  textSecondary: '#A0AEC0',
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
      // Fundo principal cinza-claro (menos branco)
      default: themeColors.backgroundLight,
      // Paper num cinza levemente diferente, para dar um contraste suave
      paper: '#F5F6F7',
    },
    text: {
      primary: '#1A1A1A', // Texto escuro no modo claro
      secondary: themeColors.textSecondary,
    },
  },
  typography: commonTypography,
  shape: {
    borderRadius: 4, // Reduzido de 8 para 4
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
      default: themeColors.backgroundDark, // Fundo escuro
      paper: '#1A202C', // Papel levemente mais claro que o default
    },
    text: {
      primary: themeColors.textPrimary,
      secondary: themeColors.textSecondary,
    },
  },
  typography: commonTypography,
  shape: {
    borderRadius: 4, // Reduzido de 8 para 4
  },
  components: commonComponents,
});

export { lightTheme, darkTheme };
