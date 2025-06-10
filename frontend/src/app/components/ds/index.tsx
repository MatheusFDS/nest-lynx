// src/components/ds/index.tsx
'use client';

import React from 'react';
import {
  Container as MuiContainer,
  Card as MuiCard,
  CardContent as MuiCardContent,
  TextField as MuiTextField,
  Chip as MuiChip,
  Paper as MuiPaper,
  Button as MuiButton,
  IconButton as MuiIconButton,
  Avatar as MuiAvatar,
  Box,
  ContainerProps,
  CardProps,
  TextFieldProps,
  ChipProps,
  PaperProps,
  ButtonProps,
  IconButtonProps,
  AvatarProps,
} from '@mui/material';
import { styled, alpha, keyframes } from '@mui/material/styles';

// ========================================
// DESIGN TOKENS (Cores, Espaçamentos, etc.)
// ========================================

export const tokens = {
  // Cores principais
  colors: {
    primary: '#667eea',
    secondary: '#764ba2', 
    success: '#4caf50',
    warning: '#ff9800',
    error: '#f44336',
    info: '#2196f3',
  },
  
  // Espaçamentos padrão
  spacing: {
    xs: 8,
    sm: 16,
    md: 24,
    lg: 32,
    xl: 48,
  },
  
  // Border radius padrão
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
  
  // Shadows padronizadas
  shadows: {
    sm: '0 2px 8px rgba(0,0,0,0.1)',
    md: '0 4px 20px rgba(0,0,0,0.12)',
    lg: '0 8px 32px rgba(0,0,0,0.15)',
  },
};

// ========================================
// ANIMAÇÕES REUTILIZÁVEIS
// ========================================

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

// ========================================
// COMPONENTE: CONTAINER PADRONIZADO
// ========================================

interface DSContainerProps extends ContainerProps {
  variant?: 'default' | 'page';
}

export const DSContainer = styled(MuiContainer)<DSContainerProps>(({ theme, variant = 'default' }) => ({
  padding: variant === 'page' ? theme.spacing(3) : theme.spacing(2),
  maxWidth: '1400px',
  
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1),
  },
  
  // Animação de entrada suave
  animation: `${fadeInUp} 0.6s ease-out`,
}));

// ========================================
// COMPONENTE: STATS CARD (usado em 6+ páginas)
// ========================================

interface DSStatsCardProps extends CardProps {
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  gradient?: boolean;
}

export const DSStatsCard = styled(MuiCard)<DSStatsCardProps>(({ theme, color = 'primary', gradient = true }) => {
  const colorValue = tokens.colors[color];
  
  return {
    background: gradient 
      ? `linear-gradient(135deg, ${colorValue} 0%, ${alpha(colorValue, 0.8)} 100%)`
      : colorValue,
    color: 'white',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    borderRadius: tokens.radius.lg,
    border: 'none',
    
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: tokens.shadows.lg,
    },
  };
});

// ========================================
// COMPONENTE: FILTER PANEL (usado em 8+ páginas)
// ========================================

export const DSFilterPanel = styled(MuiPaper)(({ theme }) => ({
  padding: tokens.spacing.md,
  background: alpha(theme.palette.background.paper, 0.9),
  backdropFilter: 'blur(10px)',
  borderRadius: tokens.radius.lg,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  marginBottom: tokens.spacing.md,
}));

// ========================================
// COMPONENTE: SEARCH FIELD (usado em 10+ páginas)
// ========================================

export const DSSearchField = styled(MuiTextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: tokens.radius.xl,
    backgroundColor: alpha(theme.palette.background.paper, 0.8),
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s ease',
    
    '&:hover': {
      backgroundColor: theme.palette.background.paper,
    },
    
    '&.Mui-focused': {
      backgroundColor: theme.palette.background.paper,
      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
    },
  },
}));

// ========================================
// COMPONENTE: ITEM CARD (OrderCard, DeliveryCard, etc.)
// ========================================

// CORREÇÃO: Renomeado 'variant' para 'dsVariant' para evitar conflito com CardProps do MUI
interface DSItemCardProps extends CardProps {
  selected?: boolean;
  dsVariant?: 'default' | 'hover' | 'interactive';
}

export const DSItemCard = styled(MuiCard)<DSItemCardProps>(({ theme, selected = false, dsVariant = 'default' }) => ({
  marginBottom: tokens.spacing.sm,
  transition: 'all 0.3s ease',
  border: `1px solid ${selected ? theme.palette.primary.main : alpha(theme.palette.divider, 0.1)}`,
  borderRadius: tokens.radius.md,
  backgroundColor: selected ? alpha(theme.palette.primary.main, 0.05) : 'inherit',
  
  ...(dsVariant === 'hover' && {
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: tokens.shadows.md,
      borderColor: theme.palette.primary.main,
    },
  }),
  
  ...(dsVariant === 'interactive' && {
    cursor: 'pointer',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: tokens.shadows.md,
      borderColor: theme.palette.primary.main,
    },
  }),
  
  // Animação de entrada
  animation: `${slideIn} 0.4s ease-out`,
}));


// ========================================
// COMPONENTE: STATUS CHIP (reimplementado 5+ vezes)
// ========================================

interface DSStatusChipProps extends Omit<ChipProps, 'color'> {
  status: string;
  statusMap?: Record<string, { color: 'success' | 'warning' | 'error' | 'info' | 'default', variant?: 'filled' | 'outlined' }>;
}

const defaultStatusMap = {
  'Finalizado': { color: 'success' as const },
  'Entrega Finalizada': { color: 'success' as const },
  'Baixado': { color: 'success' as const },
  
  'Pendente': { color: 'warning' as const },
  'A liberar': { color: 'warning' as const },
  
  'Em rota': { color: 'info' as const },
  'Entrega Iniciada': { color: 'info' as const },
  'Iniciado': { color: 'info' as const },
  
  'Cancelado': { color: 'error' as const },
  'Rejeitado': { color: 'error' as const },
  'Entrega Retornada': { color: 'error' as const },
};

export const DSStatusChip = styled(({ status, statusMap = defaultStatusMap, ...props }: DSStatusChipProps) => {
  const config = statusMap[status] || { color: 'default' as const };
  
  return (
    <MuiChip
      label={status}
      size="small"
      {...props}
      sx={{
        fontWeight: 600,
        borderRadius: tokens.radius.sm,
        ...(config.color === 'success' && {
          backgroundColor: alpha(tokens.colors.success, 0.1),
          color: tokens.colors.success,
          border: `1px solid ${alpha(tokens.colors.success, 0.3)}`,
        }),
        ...(config.color === 'warning' && {
          backgroundColor: alpha(tokens.colors.warning, 0.1),
          color: tokens.colors.warning,
          border: `1px solid ${alpha(tokens.colors.warning, 0.3)}`,
        }),
        ...(config.color === 'error' && {
          backgroundColor: alpha(tokens.colors.error, 0.1),
          color: tokens.colors.error,
          border: `1px solid ${alpha(tokens.colors.error, 0.3)}`,
        }),
        ...(config.color === 'info' && {
          backgroundColor: alpha(tokens.colors.info, 0.1),
          color: tokens.colors.info,
          border: `1px solid ${alpha(tokens.colors.info, 0.3)}`,
        }),
        ...props.sx,
      }}
    />
  );
})``;

// ========================================
// COMPONENTE: ACTION BUTTON (Refresh, Add, etc.)
// ========================================

// CORREÇÃO: Renomeado 'variant' para 'dsVariant' para evitar conflito com ButtonProps do MUI
interface DSActionButtonProps extends ButtonProps {
  dsVariant?: 'primary' | 'secondary' | 'refresh' | 'danger';
}

export const DSActionButton = styled(MuiButton)<DSActionButtonProps>(({ theme, dsVariant = 'primary', variant, ...rest }) => {
  const baseStyles = {
    borderRadius: tokens.radius.md,
    textTransform: 'none' as const,
    fontWeight: 600,
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-1px)',
    },
  };
  
  switch (dsVariant) {
    case 'refresh':
      return {
        ...baseStyles,
        backgroundColor: theme.palette.primary.main,
        color: 'white',
        '&:hover': {
          ...baseStyles['&:hover'],
          backgroundColor: theme.palette.primary.dark,
        },
      };
      
    case 'danger':
      return {
        ...baseStyles,
        backgroundColor: tokens.colors.error,
        color: 'white',
        '&:hover': {
          ...baseStyles['&:hover'],
          backgroundColor: alpha(tokens.colors.error, 0.8),
        },
      };
      
    default:
      return baseStyles;
  }
});


// ========================================
// COMPONENTE: ICON BUTTON MODERNIZADO
// ========================================

interface DSIconButtonProps extends IconButtonProps {
  variant?: 'default' | 'primary' | 'success' | 'error';
}

export const DSIconButton = styled(MuiIconButton)<DSIconButtonProps>(({ theme, variant = 'default' }) => ({
  borderRadius: tokens.radius.sm,
  transition: 'all 0.2s ease',
  
  ...(variant === 'primary' && {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    color: theme.palette.primary.main,
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.2),
      transform: 'scale(1.05)',
    },
  }),
  
  ...(variant === 'success' && {
    backgroundColor: alpha(tokens.colors.success, 0.1),
    color: tokens.colors.success,
    '&:hover': {
      backgroundColor: alpha(tokens.colors.success, 0.2),
      transform: 'scale(1.05)',
    },
  }),
  
  ...(variant === 'error' && {
    backgroundColor: alpha(tokens.colors.error, 0.1),
    color: tokens.colors.error,
    '&:hover': {
      backgroundColor: alpha(tokens.colors.error, 0.2),
      transform: 'scale(1.05)',
    },
  }),
}));

// ========================================
// COMPONENTE: MODERN AVATAR
// ========================================

// CORREÇÃO: Renomeado 'variant' para 'dsVariant' para evitar conflito com AvatarProps do MUI
interface DSAvatarProps extends AvatarProps {
  dsVariant?: 'default' | 'gradient';
}

export const DSAvatar = styled(MuiAvatar)<DSAvatarProps>(({ theme, dsVariant = 'default' }) => ({
  ...(dsVariant === 'gradient' && {
    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    color: theme.palette.primary.contrastText,
    border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  }),
}));


// ========================================
// COMPONENTE: UTILITY BOX (para layouts)
// ========================================

interface DSBoxProps {
  spacing?: keyof typeof tokens.spacing;
  flex?: boolean;
  center?: boolean;
  between?: boolean;
  column?: boolean;
  gap?: number;
}

export const DSBox = styled(Box)<DSBoxProps>(({ spacing, flex, center, between, column, gap }) => ({
  ...(spacing && { padding: tokens.spacing[spacing] }),
  ...(flex && { display: 'flex' }),
  ...(center && { alignItems: 'center', justifyContent: 'center' }),
  ...(between && { justifyContent: 'space-between', alignItems: 'center' }),
  ...(column && { flexDirection: 'column' }),
  ...(gap && { gap }),
}));

// ========================================
// EXPORT PRINCIPAL
// ========================================

export const DS = {
  Container: DSContainer,
  StatsCard: DSStatsCard,
  FilterPanel: DSFilterPanel,
  SearchField: DSSearchField,
  ItemCard: DSItemCard,
  StatusChip: DSStatusChip,
  ActionButton: DSActionButton,
  IconButton: DSIconButton,
  Avatar: DSAvatar,
  Box: DSBox,
  tokens,
};

export default DS;