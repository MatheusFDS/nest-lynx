import React from 'react';
import { Chip, ChipProps } from '@mui/material';
import { 
  OrderStatus, 
  DeliveryStatus, 
  PaymentStatus,
  STATUS_COLORS,
  STATUS_LABELS 
} from '../../types'; // Importando do seu arquivo de tipos principal

// A interface de propriedades do nosso componente
export interface StatusChipProps extends Omit<ChipProps, 'label' | 'color'> {
  status: OrderStatus | DeliveryStatus | PaymentStatus | string;
  type: 'order' | 'delivery' | 'payment';
}

// O componente React, agora em seu próprio arquivo .tsx
export const StatusChip: React.FC<StatusChipProps> = ({ 
  status, 
  type, 
  sx,
  ...props 
}) => {
  const getStatusColor = (status: string, type: string): string => {
    switch (type) {
      case 'order':
        return STATUS_COLORS.ORDER[status as OrderStatus] || '#666';
      case 'delivery':
        return STATUS_COLORS.DELIVERY[status as DeliveryStatus] || '#666';
      case 'payment':
        return STATUS_COLORS.PAYMENT[status as PaymentStatus] || '#666';
      default:
        return '#666';
    }
  };

  const getStatusLabel = (status: string, type: string): string => {
    switch (type) {
      case 'order':
        return STATUS_LABELS.ORDER[status as OrderStatus] || status;
      case 'delivery':
        return STATUS_LABELS.DELIVERY[status as DeliveryStatus] || status;
      case 'payment':
        return STATUS_LABELS.PAYMENT[status as PaymentStatus] || status;
      default:
        return status;
    }
  };

  const color = getStatusColor(status, type);
  const label = getStatusLabel(status, type);

  return (
    <Chip
      label={label}
      size="small"
      sx={{
        backgroundColor: color,
        color: 'white',
        fontWeight: 600,
        fontSize: '0.75rem',
        ...sx
      }}
      {...props}
    />
  );
};