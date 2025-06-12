'use client'
import { createTheme, ThemeProvider as MUIThemeProvider } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'
import { ptBR } from '@mui/material/locale'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#00695c', // Teal escuro
      light: '#439889',
      dark: '#004c40',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ff6f00', // Laranja vibrante
      light: '#ff9800',
      dark: '#e65100',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f7f8fa', // Cinza muito claro
      paper: '#ffffff',
    },
    text: {
      primary: '#2e3440', // Cinza escuro para texto principal
      secondary: '#5e6b73', // Cinza médio para texto secundário
    },
    grey: {
      50: '#fafbfc',
      100: '#f1f3f4',
      200: '#e8ebef',
      300: '#dadee3',
      400: '#bcc1c6',
      500: '#9ea7ad',
      600: '#7c858d',
      700: '#5e6b73',
      800: '#434a54',
      900: '#2e3440',
    },
    divider: '#e0e4e7',
    action: {
      hover: 'rgba(0, 105, 92, 0.04)',
      selected: 'rgba(0, 105, 92, 0.08)',
      disabled: 'rgba(0, 0, 0, 0.26)',
      disabledBackground: 'rgba(0, 0, 0, 0.12)',
    },
    success: {
      main: '#2e7d32',
      light: '#4caf50',
      dark: '#1b5e20',
    },
    warning: {
      main: '#ed6c02',
      light: '#ff9800',
      dark: '#e65100',
    },
    error: {
      main: '#d32f2f',
      light: '#ef5350',
      dark: '#c62828',
    },
    info: {
      main: '#0288d1',
      light: '#03a9f4',
      dark: '#01579b',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      color: '#2e3440',
      letterSpacing: '-0.01562em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      color: '#2e3440',
      letterSpacing: '-0.00833em',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
      color: '#2e3440',
      letterSpacing: '0em',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
      color: '#2e3440',
      letterSpacing: '0.00735em',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
      color: '#2e3440',
      letterSpacing: '0em',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
      color: '#2e3440',
      letterSpacing: '0.0075em',
    },
    body1: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      color: '#2e3440',
    },
    body2: {
      fontSize: '0.75rem',
      lineHeight: 1.43,
      color: '#5e6b73',
    },
    button: {
      fontWeight: 500,
      textTransform: 'none',
      letterSpacing: '0.02857em',
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0px 1px 3px rgba(0, 0, 0, 0.04), 0px 1px 2px rgba(0, 0, 0, 0.08)',
    '0px 1px 5px rgba(0, 0, 0, 0.06), 0px 2px 2px rgba(0, 0, 0, 0.08)',
    '0px 1px 8px rgba(0, 0, 0, 0.08), 0px 3px 4px rgba(0, 0, 0, 0.08)',
    '0px 2px 4px rgba(0, 0, 0, 0.08), 0px 7px 8px rgba(0, 0, 0, 0.08)',
    '0px 3px 5px rgba(0, 0, 0, 0.08), 0px 9px 12px rgba(0, 0, 0, 0.08)',
    '0px 3px 5px rgba(0, 0, 0, 0.08), 0px 11px 15px rgba(0, 0, 0, 0.08)',
    '0px 4px 6px rgba(0, 0, 0, 0.08), 0px 13px 19px rgba(0, 0, 0, 0.08)',
    '0px 5px 7px rgba(0, 0, 0, 0.08), 0px 15px 22px rgba(0, 0, 0, 0.08)',
    '0px 5px 8px rgba(0, 0, 0, 0.08), 0px 17px 26px rgba(0, 0, 0, 0.08)',
    '0px 6px 10px rgba(0, 0, 0, 0.08), 0px 20px 31px rgba(0, 0, 0, 0.08)',
    '0px 6px 11px rgba(0, 0, 0, 0.08), 0px 22px 35px rgba(0, 0, 0, 0.08)',
    '0px 7px 13px rgba(0, 0, 0, 0.08), 0px 25px 40px rgba(0, 0, 0, 0.08)',
    '0px 7px 14px rgba(0, 0, 0, 0.08), 0px 27px 44px rgba(0, 0, 0, 0.08)',
    '0px 8px 16px rgba(0, 0, 0, 0.08), 0px 30px 49px rgba(0, 0, 0, 0.08)',
    '0px 8px 17px rgba(0, 0, 0, 0.08), 0px 32px 54px rgba(0, 0, 0, 0.08)',
    '0px 9px 19px rgba(0, 0, 0, 0.08), 0px 35px 60px rgba(0, 0, 0, 0.08)',
    '0px 9px 20px rgba(0, 0, 0, 0.08), 0px 38px 65px rgba(0, 0, 0, 0.08)',
    '0px 10px 22px rgba(0, 0, 0, 0.08), 0px 41px 71px rgba(0, 0, 0, 0.08)',
    '0px 10px 23px rgba(0, 0, 0, 0.08), 0px 44px 77px rgba(0, 0, 0, 0.08)',
    '0px 11px 25px rgba(0, 0, 0, 0.08), 0px 47px 84px rgba(0, 0, 0, 0.08)',
    '0px 11px 26px rgba(0, 0, 0, 0.08), 0px 50px 90px rgba(0, 0, 0, 0.08)',
    '0px 12px 28px rgba(0, 0, 0, 0.08), 0px 54px 97px rgba(0, 0, 0, 0.08)',
    '0px 12px 29px rgba(0, 0, 0, 0.08), 0px 57px 104px rgba(0, 0, 0, 0.08)',
    '0px 13px 31px rgba(0, 0, 0, 0.08), 0px 61px 112px rgba(0, 0, 0, 0.08)',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#f7f8fa',
          color: '#2e3440',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#2e3440',
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.08), 0px 2px 2px rgba(0, 0, 0, 0.12)',
          borderBottom: '1px solid #e0e4e7',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e0e4e7',
          boxShadow: '2px 0px 8px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          borderRadius: 12,
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.04), 0px 1px 2px rgba(0, 0, 0, 0.08)',
          border: '1px solid #f1f3f4',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.08), 0px 2px 4px rgba(0, 0, 0, 0.08)',
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 500,
          fontSize: '0.875rem',
          padding: '8px 16px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.08)',
          },
        },
        contained: {
          backgroundColor: '#00695c',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#004c40',
            boxShadow: '0px 4px 8px rgba(0, 105, 92, 0.3)',
          },
        },
        outlined: {
          borderColor: '#e0e4e7',
          color: '#00695c',
          '&:hover': {
            borderColor: '#00695c',
            backgroundColor: 'rgba(0, 105, 92, 0.04)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#ffffff',
            borderRadius: 8,
            '& fieldset': {
              borderColor: '#e0e4e7',
            },
            '&:hover fieldset': {
              borderColor: '#bcc1c6',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#00695c',
              borderWidth: 2,
            },
          },
          '& .MuiInputLabel-root': {
            color: '#5e6b73',
            '&.Mui-focused': {
              color: '#00695c',
            },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          borderRadius: 8,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#e0e4e7',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#bcc1c6',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#00695c',
            borderWidth: 2,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          fontWeight: 500,
          fontSize: '0.75rem',
        },
        colorPrimary: {
          backgroundColor: 'rgba(0, 105, 92, 0.1)',
          color: '#00695c',
          '&:hover': {
            backgroundColor: 'rgba(0, 105, 92, 0.2)',
          },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#f1f3f4',
          '& .MuiTableCell-head': {
            backgroundColor: '#f1f3f4',
            color: '#2e3440',
            fontWeight: 600,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(0, 105, 92, 0.02)',
          },
          '&:nth-of-type(even)': {
            backgroundColor: '#fafbfc',
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '2px 8px',
          '&:hover': {
            backgroundColor: 'rgba(0, 105, 92, 0.08)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(0, 105, 92, 0.12)',
            color: '#00695c',
            '&:hover': {
              backgroundColor: 'rgba(0, 105, 92, 0.16)',
            },
            '& .MuiListItemIcon-root': {
              color: '#00695c',
            },
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontSize: '0.875rem',
        },
        standardSuccess: {
          backgroundColor: 'rgba(46, 125, 50, 0.1)',
          color: '#1b5e20',
          border: '1px solid rgba(46, 125, 50, 0.2)',
        },
        standardError: {
          backgroundColor: 'rgba(211, 47, 47, 0.1)',
          color: '#c62828',
          border: '1px solid rgba(211, 47, 47, 0.2)',
        },
        standardWarning: {
          backgroundColor: 'rgba(237, 108, 2, 0.1)',
          color: '#e65100',
          border: '1px solid rgba(237, 108, 2, 0.2)',
        },
        standardInfo: {
          backgroundColor: 'rgba(2, 136, 209, 0.1)',
          color: '#01579b',
          border: '1px solid rgba(2, 136, 209, 0.2)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.04), 0px 1px 2px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '&:hover': {
            backgroundColor: 'rgba(0, 105, 92, 0.08)',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #e0e4e7',
        },
        indicator: {
          backgroundColor: '#00695c',
          height: 3,
          borderRadius: '3px 3px 0 0',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.875rem',
          color: '#5e6b73',
          '&.Mui-selected': {
            color: '#00695c',
          },
        },
      },
    },
  },
}, ptBR)

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <MUIThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MUIThemeProvider>
  )
}