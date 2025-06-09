// src/theme.ts

import { createTheme } from '@mui/material/styles';

const commonTypography = {
  fontFamily: '"Inter", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
  h1: {
    fontSize: '2.25rem',
    fontWeight: 800,
    lineHeight: 1.2,
    letterSpacing: '-0.025em',
  },
  h2: {
    fontSize: '1.875rem',
    fontWeight: 700,
    lineHeight: 1.3,
    letterSpacing: '-0.02em',
  },
  h3: {
    fontSize: '1.5rem',
    fontWeight: 600,
    lineHeight: 1.4,
    letterSpacing: '-0.015em',
  },
  h4: {
    fontSize: '1.25rem',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h5: {
    fontSize: '1.125rem',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  body1: {
    fontSize: '1rem',
    lineHeight: 1.6,
    fontWeight: 400,
  },
  body2: {
    fontSize: '0.875rem',
    lineHeight: 1.5,
    fontWeight: 400,
  },
  button: {
    textTransform: 'none' as const,
    fontWeight: 600,
    fontSize: '0.875rem',
    letterSpacing: '0.01em',
  },
};

const commonComponents = {
  MuiButton: {
    styleOverrides: {
      root: {
        boxShadow: 'none',
        padding: '10px 24px',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          transform: 'translateY(-1px)',
        },
        '&:active': {
          transform: 'translateY(0)',
        },
      },
      contained: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        '&:hover': {
          background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
        },
      },
      outlined: {
        borderWidth: '1.5px',
        '&:hover': {
          borderWidth: '1.5px',
        },
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        background: 'rgba(255, 255, 255, 0.05)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          backgroundColor: 'rgba(2, 1, 1, 0.05)',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
          },
          '&.Mui-focused': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
          },
        },
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        backdropFilter: 'blur(20px)',
        background: 'rgba(255, 255, 255, 0.08)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
      },
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        backdropFilter: 'blur(20px)',
        background: 'rgba(255, 255, 255, 0.1)',
        border: 'none',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      },
    },
  },
};

const themeColors = {
  primary: '#667eea',
  secondary: '#764ba2',
  accent: '#f093fb',
  success: '#4ade80',
  warning: '#fbbf24',
  error: '#f87171',
  backgroundDark: '#0f0f23',
  backgroundLight: '#fafbfc',
  surfaceDark: '#1a1a2e',
  surfaceLight: '#ffffff',
  textPrimaryDark: '#f8fafc',    // Texto claro para fundo escuro
  textSecondaryDark: '#94a3b8',  // Texto secundário para fundo escuro
  textPrimaryLight: '#1e293b',   // Texto escuro para fundo claro
  textSecondaryLight: '#64748b', // Texto secundário para fundo claro
};

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: themeColors.primary,
      light: '#8b9aed',
      dark: '#4c63d2',
    },
    secondary: {
      main: themeColors.secondary,
      light: '#9575cd',
      dark: '#5e35b1',
    },
    background: {
      default: themeColors.backgroundLight,
      paper: themeColors.surfaceLight,
    },
    text: {
      primary: themeColors.textPrimaryLight,
      secondary: themeColors.textSecondaryLight,
    },
    success: {
      main: themeColors.success,
    },
    warning: {
      main: themeColors.warning,
    },
    error: {
      main: themeColors.error,
    },
  },
  typography: commonTypography,
  shape: {
    borderRadius: 12,
  },
  components: {
    ...commonComponents,
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid rgba(30, 41, 59, 0.2)',
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(102, 126, 234, 0.3)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'rgba(30, 41, 59, 0.08)',
            border: '1px solid rgba(30, 41, 59, 0.2)',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: 'rgba(30, 41, 59, 0.12)',
              borderColor: 'rgba(102, 126, 234, 0.5)',
            },
            '&.Mui-focused': {
              backgroundColor: 'rgba(102, 126, 234, 0.08)',
              borderColor: 'rgba(102, 126, 234, 0.8)',
              boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.15)',
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(30, 41, 59, 0.15)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: themeColors.primary,
      light: '#8b9aed',
      dark: '#4c63d2',
    },
    secondary: {
      main: themeColors.secondary,
      light: '#9575cd',
      dark: '#5e35b1',
    },
    background: {
      default: themeColors.backgroundDark,
      paper: themeColors.surfaceDark,
    },
    text: {
      primary: themeColors.textPrimaryDark,
      secondary: themeColors.textSecondaryDark,
    },
    success: {
      main: themeColors.success,
    },
    warning: {
      main: themeColors.warning,
    },
    error: {
      main: themeColors.error,
    },
  },
  typography: commonTypography,
  shape: {
  },
  components: commonComponents,
});

export { lightTheme, darkTheme };
