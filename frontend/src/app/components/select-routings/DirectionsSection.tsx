import React from 'react';
import ExpandedOrdersDialog from './sub-routing/ExpandedOrdersDialog';
import { Order } from '../../../types';

interface DirectionsSectionProps {
  open: boolean;
  onClose: () => void;
  orders: Order[];
  handleDetailsDialogOpen: (order: Order) => void;
}

const DirectionsSection: React.FC<DirectionsSectionProps> = ({
  open,
  onClose,
  orders,
  handleDetailsDialogOpen
}) => {
  return (
    <ExpandedOrdersDialog
      open={open}
      onClose={onClose}
      orders={orders}
      handleDetailsDialogOpen={handleDetailsDialogOpen}
    />
  );
};

export default DirectionsSection;
