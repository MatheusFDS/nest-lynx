// src/components/MessageBanner.tsx
import React, { useEffect, useState } from 'react';
import {
  Alert,
  AlertColor,
  Box,
  IconButton,
  Typography,
  Slide,
  Collapse,
  Avatar,
  Chip,
  Stack,
} from '@mui/material';
import {
  Close as CloseIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Notifications as NotificationIcon,
} from '@mui/icons-material';
import { styled, alpha, keyframes } from '@mui/material/styles';

// Animações
const shimmer = keyframes`
  0% {
    background-position: -468px 0;
  }
  100% {
    background-position: 468px 0;
  }
`;

const glow = keyframes`
  0%, 100% {
    box-shadow: 0 0 5px currentColor;
  }
  50% {
    box-shadow: 0 0 20px currentColor, 0 0 30px currentColor;
  }
`;

// Styled Components
const ModernBannerContainer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: theme.mixins.toolbar.minHeight || 64,
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 1400,
  width: '90%',
  maxWidth: '600px',
    [theme.breakpoints.down('sm')]: {
    width: '95%',
    top: ((theme.mixins.toolbar.minHeight as number) || 64) + 8,
  },
}));

const ModernAlert = styled(Alert)<{ severity: AlertColor }>(({ theme, severity }) => {
  const getGradientColors = () => {
    switch (severity) {
      case 'success':
        return `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.light, 0.05)} 100%)`;
      case 'error':
        return `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.1)} 0%, ${alpha(theme.palette.error.light, 0.05)} 100%)`;
      case 'warning':
        return `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)} 0%, ${alpha(theme.palette.warning.light, 0.05)} 100%)`;
      case 'info':
        return `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(theme.palette.info.light, 0.05)} 100%)`;
      default:
        return `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.light, 0.05)} 100%)`;
    }
  };

  const getBorderColor = () => {
    switch (severity) {
      case 'success': return theme.palette.success.main;
      case 'error': return theme.palette.error.main;
      case 'warning': return theme.palette.warning.main;
      case 'info': return theme.palette.info.main;
      default: return theme.palette.primary.main;
    }
  };

  return {
    borderRadius: theme.spacing(2),
    background: getGradientColors(),
    backdropFilter: 'blur(20px)',
    border: `1px solid ${alpha(getBorderColor(), 0.2)}`,
    boxShadow: `
      0 8px 32px ${alpha(theme.palette.common.black, 0.12)},
      0 0 0 1px ${alpha(getBorderColor(), 0.05)}
    `,
    padding: theme.spacing(1.5, 2),
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: '-468px',
      width: '468px',
      height: '100%',
      background: `linear-gradient(
        90deg,
        transparent,
        ${alpha(getBorderColor(), 0.1)},
        transparent
      )`,
      animation: `${shimmer} 2s infinite`,
    },

    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: `
        0 12px 40px ${alpha(theme.palette.common.black, 0.15)},
        0 0 0 1px ${alpha(getBorderColor(), 0.1)}
      `,
    },

    '& .MuiAlert-icon': {
      fontSize: '1.5rem',
      padding: 0,
      marginRight: theme.spacing(1.5),
      alignItems: 'center',
    },

    '& .MuiAlert-message': {
      padding: 0,
      display: 'flex',
      alignItems: 'center',
      flexGrow: 1,
    },

    '& .MuiAlert-action': {
      padding: 0,
      marginRight: 0,
      marginLeft: theme.spacing(1),
    }
  };
});

const MessageContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  flexGrow: 1,
}));

const TimestampChip = styled(Chip)(({ theme }) => ({
  height: '20px',
  fontSize: '0.7rem',
  backgroundColor: alpha(theme.palette.text.secondary, 0.1),
  color: theme.palette.text.secondary,
  '& .MuiChip-label': {
    padding: '0 6px',
  }
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  padding: theme.spacing(0.5),
  borderRadius: theme.spacing(1),
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: alpha(theme.palette.action.hover, 0.8),
    transform: 'scale(1.1)',
  }
}));

// Componente de ícone personalizado
const MessageIcon = ({ severity, animated = false }: { severity: AlertColor; animated?: boolean }) => {
  const iconProps = {
    sx: {
      fontSize: '1.3rem',
      animation: animated ? `${glow} 2s ease-in-out infinite` : 'none',
    }
  };

  switch (severity) {
    case 'success':
      return <SuccessIcon {...iconProps} />;
    case 'error':
      return <ErrorIcon {...iconProps} />;
    case 'warning':
      return <WarningIcon {...iconProps} />;
    case 'info':
      return <InfoIcon {...iconProps} />;
    default:
      return <NotificationIcon {...iconProps} />;
  }
};

interface MessageBannerProps {
  message: string;
  type: AlertColor;
  onClose?: () => void;
  autoHide?: boolean;
  autoHideDelay?: number;
  showTimestamp?: boolean;
  animated?: boolean;
  persistent?: boolean;
  actions?: React.ReactNode;
}

const MessageBanner: React.FC<MessageBannerProps> = ({
  message,
  type,
  onClose,
  autoHide = true,
  autoHideDelay = 5000,
  showTimestamp = false,
  animated = false,
  persistent = false,
  actions
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(autoHideDelay);
  const [timestamp] = useState(new Date());

  useEffect(() => {
    if (autoHide && !persistent) {
      const interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 100) {
            setIsVisible(false);
            setTimeout(() => onClose?.(), 300);
            return 0;
          }
          return prev - 100;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [autoHide, persistent, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose?.(), 300);
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getProgressPercentage = () => {
    return autoHide && !persistent ? (timeRemaining / autoHideDelay) * 100 : 100;
  };

  return (
    <ModernBannerContainer>
      <Slide direction="down" in={isVisible} timeout={300}>
        <ModernAlert
          severity={type}
          icon={<MessageIcon severity={type} animated={animated} />}
          action={
            <Stack direction="row" spacing={0.5} alignItems="center">
              {actions}
              {showTimestamp && (
                <TimestampChip
                  label={formatTimestamp(timestamp)}
                  size="small"
                />
              )}
              {onClose && (
                <ActionButton
                  aria-label="fechar"
                  color="inherit"
                  size="small"
                  onClick={handleClose}
                >
                  <CloseIcon fontSize="small" />
                </ActionButton>
              )}
            </Stack>
          }
        >
          <MessageContent>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                lineHeight: 1.4,
                flexGrow: 1,
              }}
            >
              {message}
            </Typography>
          </MessageContent>

          {/* Barra de progresso para auto-hide */}
          {autoHide && !persistent && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                height: '2px',
                backgroundColor: 'currentColor',
                width: `${getProgressPercentage()}%`,
                transition: 'width 0.1s linear',
                opacity: 0.3,
              }}
            />
          )}
        </ModernAlert>
      </Slide>
    </ModernBannerContainer>
  );
};

export default MessageBanner;