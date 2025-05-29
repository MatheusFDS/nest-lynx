import { createTheme } from '@mui/material/styles';

/**
 * Paleta futurística moderna:
 * - Gradientes cyberpunk e neon
 * - Glassmorphism e backdrop blur
 * - Micro-interações fluidas
 * - Design system contemporâneo
 */
const futuristicPalette = {
  primary: '#00d4ff',       // Cyan vibrante
  secondary: '#8b5cf6',     // Roxo moderno
  accent: '#00ff88',        // Verde neon
  background: '#0a0a0f',    // Preto azulado profundo
  surface: 'rgba(15, 23, 42, 0.8)', // Superfície com glassmorphism
  surfaceHover: 'rgba(30, 41, 59, 0.9)',
  textPrimary: '#f1f5f9',   // Branco mais suave
  textSecondary: '#94a3b8', // Cinza azulado
  textTertiary: '#64748b',  // Cinza mais escuro para melhor contraste
  border: 'rgba(148, 163, 184, 0.3)',
  glow: 'rgba(0, 212, 255, 0.4)',
};

const loginTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: futuristicPalette.primary,
      light: '#33ddff',
      dark: '#0099cc',
    },
    secondary: {
      main: futuristicPalette.secondary,
      light: '#a78bfa',
      dark: '#7c3aed',
    },
    background: {
      default: futuristicPalette.background,
      paper: futuristicPalette.surface,
    },
    text: {
      primary: futuristicPalette.textPrimary,
      secondary: futuristicPalette.textSecondary,
    },
    success: {
      main: futuristicPalette.accent,
    },
  },
  typography: {
    fontFamily: '"JetBrains Mono", "Fira Code", "Source Code Pro", monospace',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 800,
      background: `linear-gradient(135deg, ${futuristicPalette.primary} 0%, ${futuristicPalette.secondary} 100%)`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      letterSpacing: '-0.02em',
      textShadow: `0 0 30px ${futuristicPalette.glow}`,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      letterSpacing: '-0.015em',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      fontSize: '0.9rem',
      letterSpacing: '0.5px',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '20px',
          padding: '32px',
          background: `linear-gradient(145deg, ${futuristicPalette.surface}, rgba(30, 41, 59, 0.5))`,
          backdropFilter: 'blur(20px)',
          border: `1px solid ${futuristicPalette.border}`,
          boxShadow: `
            0 25px 50px -12px rgba(0, 0, 0, 0.5),
            0 0 0 1px rgba(255, 255, 255, 0.05),
            inset 0 1px 0 rgba(255, 255, 255, 0.1)
          `,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: `linear-gradient(90deg, transparent, ${futuristicPalette.primary}, transparent)`,
          },
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: `
              0 35px 60px -12px rgba(0, 0, 0, 0.6),
              0 0 40px ${futuristicPalette.glow}
            `,
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          marginBottom: '24px',
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${futuristicPalette.border}`,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              backgroundColor: 'rgba(30, 41, 59, 0.9)',
              borderColor: futuristicPalette.primary,
              boxShadow: `0 0 25px ${futuristicPalette.glow}`,
            },
            '&.Mui-focused': {
              backgroundColor: 'rgba(30, 41, 59, 0.95)',
              borderColor: futuristicPalette.primary,
              boxShadow: `
                0 0 0 3px rgba(0, 212, 255, 0.15),
                0 0 35px ${futuristicPalette.glow}
              `,
            },
            '& fieldset': {
              border: 'none',
            },
          },
          '& .MuiInputBase-input': {
            color: futuristicPalette.textPrimary,
            fontSize: '1rem',
            padding: '16px',
          },
          '& .MuiInputLabel-root': {
            color: futuristicPalette.textTertiary,
            fontSize: '0.9rem',
            '&.Mui-focused': {
              color: futuristicPalette.primary,
              fontWeight: 500,
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          padding: '14px 28px',
          position: 'relative',
          overflow: 'hidden',
          background: `linear-gradient(135deg, ${futuristicPalette.primary} 0%, ${futuristicPalette.secondary} 100%)`,
          border: 'none',
          color: futuristicPalette.textPrimary,
          boxShadow: `
            0 4px 15px rgba(0, 212, 255, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.2)
          `,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
            transition: 'left 0.5s ease',
          },
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: `
              0 8px 25px rgba(0, 212, 255, 0.4),
              0 0 30px ${futuristicPalette.glow}
            `,
            background: `linear-gradient(135deg, ${futuristicPalette.accent} 0%, ${futuristicPalette.primary} 100%)`,
            '&::before': {
              left: '100%',
            },
          },
          '&:active': {
            transform: 'translateY(-1px)',
          },
          '&:disabled': {
            background: 'rgba(148, 163, 184, 0.2)',
            color: 'rgba(248, 250, 252, 0.5)',
            boxShadow: 'none',
          },
        },
        outlined: {
          background: 'transparent',
          border: `2px solid ${futuristicPalette.primary}`,
          color: futuristicPalette.primary,
          '&:hover': {
            background: `rgba(0, 212, 255, 0.1)`,
            borderColor: futuristicPalette.accent,
            color: futuristicPalette.accent,
          },
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: futuristicPalette.primary,
          textDecoration: 'none',
          position: 'relative',
          transition: 'all 0.3s ease',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: '-2px',
            left: 0,
            width: '0%',
            height: '2px',
            background: `linear-gradient(90deg, ${futuristicPalette.primary}, ${futuristicPalette.accent})`,
            transition: 'width 0.3s ease',
          },
          '&:hover': {
            color: futuristicPalette.accent,
            textShadow: `0 0 10px ${futuristicPalette.glow}`,
            '&::after': {
              width: '100%',
            },
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          backdropFilter: 'blur(10px)',
          border: `1px solid ${futuristicPalette.border}`,
        },
      },
    },
  },
});

export default loginTheme;
