// src/components/LinearDeterminate.tsx
import * as React from 'react';
import { Box, LinearProgress, Fade } from '@mui/material';
import { styled, alpha, keyframes } from '@mui/material/styles';

// Animação de gradiente
const gradientShift = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

// Styled Components
const ModernProgressContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  position: 'fixed',
  top: 0,
  left: 0,
  zIndex: 9999,
  height: '4px',
  background: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(10px)',
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
}));

const ModernLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: '4px',
  borderRadius: 0,
  backgroundColor: 'transparent',
  '& .MuiLinearProgress-bar': {
    background: `linear-gradient(
      90deg,
      ${theme.palette.primary.main},
      ${theme.palette.secondary.main},
      ${theme.palette.primary.light},
      ${theme.palette.primary.main}
    )`,
    backgroundSize: '200% 200%',
    animation: `${gradientShift} 2s ease infinite`,
    borderRadius: 0,
    position: 'relative',
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `linear-gradient(
        90deg,
        transparent,
        ${alpha(theme.palette.primary.main, 0.3)},
        transparent
      )`,
      animation: `${gradientShift} 1.5s ease infinite`,
    }
  },
  // Modo indeterminado com efeito mais suave
  '&.MuiLinearProgress-indeterminate .MuiLinearProgress-bar1': {
    background: `linear-gradient(
      90deg,
      ${theme.palette.primary.main},
      ${theme.palette.primary.light},
      ${theme.palette.secondary.main}
    )`,
    backgroundSize: '200% 100%',
    animation: `${gradientShift} 2s ease infinite`,
  },
  '&.MuiLinearProgress-indeterminate .MuiLinearProgress-bar2': {
    background: `linear-gradient(
      90deg,
      ${theme.palette.secondary.main},
      ${theme.palette.primary.main},
      ${theme.palette.primary.light}
    )`,
    backgroundSize: '200% 100%',
    animation: `${gradientShift} 2s ease infinite reverse`,
  }
}));

const PulseIndicator = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  right: 0,
  width: '8px',
  height: '4px',
  background: theme.palette.primary.main,
  animation: 'pulse 1.5s ease-in-out infinite',
  '@keyframes pulse': {
    '0%, 100%': {
      opacity: 1,
      transform: 'scale(1)',
    },
    '50%': {
      opacity: 0.7,
      transform: 'scale(1.2)',
    }
  }
}));

interface LinearDeterminateProps {
  variant?: 'determinate' | 'indeterminate';
  value?: number;
  showPulse?: boolean;
  autoProgress?: boolean;
  duration?: number;
}

export default function LinearDeterminate({
  variant = 'indeterminate',
  value: initialValue,
  showPulse = true,
  autoProgress = false,
  duration = 5000
}: LinearDeterminateProps) {
  const [progress, setProgress] = React.useState(initialValue || 0);
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    if (autoProgress && variant === 'determinate') {
      const timer = setInterval(() => {
        setProgress((oldProgress) => {
          if (oldProgress === 100) {
            // Auto-hide quando completa
            setTimeout(() => setIsVisible(false), 500);
            return 100;
          }
          const diff = Math.random() * 10;
          return Math.min(oldProgress + diff, 100);
        });
      }, duration / 20); // 20 steps to complete

      return () => {
        clearInterval(timer);
      };
    }
  }, [autoProgress, variant, duration]);

  // Se não for auto-progress e tiver valor inicial, use ele
  React.useEffect(() => {
    if (!autoProgress && initialValue !== undefined) {
      setProgress(initialValue);
    }
  }, [initialValue, autoProgress]);

  return (
    <Fade in={isVisible} timeout={300}>
      <ModernProgressContainer>
        <ModernLinearProgress
          variant={variant}
          value={variant === 'determinate' ? progress : undefined}
        />
        {showPulse && (
          <PulseIndicator />
        )}
      </ModernProgressContainer>
    </Fade>
  );
}