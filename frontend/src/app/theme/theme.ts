// src/theme/theme.ts
import { createTheme } from '@mui/material/styles';

// ========================================
// DESIGN TOKENS CORPORATIVOS
// ========================================

export const tokens = {
  // Cores mais sérias/corporativas
  colors: {
    primary: '#1976d2',      // Azul mais sério
    secondary: '#424242',     // Cinza neutro
    accent: '#0288d1',       // Azul claro
    success: '#2e7d32',      // Verde mais sério
    warning: '#ed6c02',      // Laranja mais sério
    error: '#d32f2f',        // Vermelho mais sério
    info: '#0288d1',         // Azul informativo
  },
  
  // Backgrounds neutros
  backgrounds: {
    light: '#fafafa',
    dark: '#121212',
    surfaceLight: '#ffffff',
    surfaceDark: '#1e1e1e',
  },
  
  // Textos padrão
  text: {
    primaryDark: '#ffffff',
    secondaryDark: '#b3b3b3',
    primaryLight: '#212121',
    secondaryLight: '#757575',
  },
  
  // Espaçamentos reduzidos
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  
  // Border radius mais reto/corporativo
  radius: {
    sm: 4,
    md: 6,
    lg: 8,
    xl: 12,
  },
  
  // Shadows mais sutis
  shadows: {
    sm: '0 1px 3px rgba(0,0,0,0.12)',
    md: '0 2px 6px rgba(0,0,0,0.15)',
    lg: '0 4px 12px rgba(0,0,0,0.15)',
  },
};

// ========================================
// TIPOGRAFIA CORPORATIVA
// ========================================

const commonTypography = {
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  h1: {
    fontSize: '2rem',
    fontWeight: 500,
    lineHeight: 1.2,
  },
  h2: {
    fontSize: '1.75rem',
    fontWeight: 500,
    lineHeight: 1.3,
  },
  h3: {
    fontSize: '1.5rem',
    fontWeight: 500,
    lineHeight: 1.4,
  },
  h4: {
    fontSize: '1.25rem',
    fontWeight: 500,
    lineHeight: 1.4,
  },
  h5: {
    fontSize: '1.125rem',
    fontWeight: 500,
    lineHeight: 1.4,
  },
  h6: {
    fontSize: '1rem',
    fontWeight: 500,
    lineHeight: 1.4,
  },
  body1: {
    fontSize: '0.875rem',
    lineHeight: 1.5,
    fontWeight: 400,
  },
  body2: {
    fontSize: '0.75rem',
    lineHeight: 1.4,
    fontWeight: 400,
  },
  button: {
    textTransform: 'none' as const,
    fontWeight: 500,
    fontSize: '0.875rem',
  },
};

// ========================================
// COMPONENTES CORPORATIVOS
// ========================================

const createComponents = (mode: 'light' | 'dark') => {
  const isDark = mode === 'dark';
  
  return {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: tokens.radius.sm,
          padding: '8px 16px',
          boxShadow: 'none',
          textTransform: 'none' as const,
          fontWeight: 500,
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          backgroundColor: tokens.colors.primary,
          color: 'white',
          '&:hover': {
            backgroundColor: '#1565c0',
          },
        },
        outlined: {
          borderColor: tokens.colors.primary,
          color: tokens.colors.primary,
          '&:hover': {
            backgroundColor: isDark ? 'rgba(25, 118, 210, 0.08)' : 'rgba(25, 118, 210, 0.04)',
          },
        },
      },
    },
    
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: tokens.radius.sm,
            '& fieldset': {
              borderColor: isDark ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
            },
            '&:hover fieldset': {
              borderColor: tokens.colors.primary,
            },
            '&.Mui-focused fieldset': {
              borderColor: tokens.colors.primary,
              borderWidth: '2px',
            },
          },
        },
      },
    },
    
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: tokens.radius.md,
          boxShadow: tokens.shadows.sm,
          border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
        },
      },
    },
    
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: tokens.radius.md,
          backgroundImage: 'none',
        },
      },
    },
    
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
          color: isDark ? '#ffffff' : '#212121',
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        },
      },
    },
    
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
          backgroundColor: isDark ? '#1e1e1e' : '#fafafa',
        },
      },
    },
    
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: tokens.radius.sm,
          '&.Mui-selected': {
            backgroundColor: isDark ? 'rgba(25, 118, 210, 0.12)' : 'rgba(25, 118, 210, 0.08)',
            '&:hover': {
              backgroundColor: isDark ? 'rgba(25, 118, 210, 0.16)' : 'rgba(25, 118, 210, 0.12)',
            },
          },
        },
      },
    },
    
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: tokens.radius.lg,
        },
      },
    },
    
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: tokens.radius.sm,
        },
      },
    },
  };
};

// ========================================
// TEMA LIGHT
// ========================================

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: tokens.colors.primary,
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: tokens.colors.secondary,
      light: '#6d6d6d',
      dark: '#2e2e2e',
    },
    background: {
      default: tokens.backgrounds.light,
      paper: tokens.backgrounds.surfaceLight,
    },
    text: {
      primary: tokens.text.primaryLight,
      secondary: tokens.text.secondaryLight,
    },
    success: { main: tokens.colors.success },
    warning: { main: tokens.colors.warning },
    error: { main: tokens.colors.error },
    info: { main: tokens.colors.info },
    divider: 'rgba(0, 0, 0, 0.12)',
  },
  typography: commonTypography,
  shape: { borderRadius: tokens.radius.sm },
  components: createComponents('light'),
});

// ========================================
// TEMA DARK
// ========================================

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: tokens.colors.primary,
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: tokens.colors.secondary,
      light: '#6d6d6d',
      dark: '#2e2e2e',
    },
    background: {
      default: tokens.backgrounds.dark,
      paper: tokens.backgrounds.surfaceDark,
    },
    text: {
      primary: tokens.text.primaryDark,
      secondary: tokens.text.secondaryDark,
    },
    success: { main: tokens.colors.success },
    warning: { main: tokens.colors.warning },
    error: { main: tokens.colors.error },
    info: { main: tokens.colors.info },
    divider: 'rgba(255, 255, 255, 0.12)',
  },
  typography: commonTypography,
  shape: { borderRadius: tokens.radius.sm },
  components: createComponents('dark'),
});

// ========================================
// HELPER FUNCTIONS
// ========================================

export const getTheme = (mode: 'light' | 'dark') => {
  return mode === 'dark' ? darkTheme : lightTheme;
};

// ========================================
// EXPORTS
// ========================================

export default { lightTheme, darkTheme, getTheme, tokens };