import React from 'react';
import { Grid } from '@mui/material';
import DirectionCard from './sub-routing/DirectionCard';
import { Direction, Order } from '../../../types';

interface OrderSectionProps {
  directions: Direction[];
  selectedOrders: { [key: number]: Order[] };
  handleShowMap: (directionId: number) => void;
  handleExpandedOrdersDialogOpen: (directionId: number) => void;
  handleDetailsDialogOpen: (order: Order) => void;
}

const OrderSection: React.FC<OrderSectionProps> = ({
  directions,
  selectedOrders,
  handleShowMap,
  handleExpandedOrdersDialogOpen,
  handleDetailsDialogOpen
}) => {

  const calculateTotalWeightAndValue = (orders: Order[]): { totalWeight: number; totalValue: number } => {
    return orders.reduce(
      (acc, order) => {
        acc.totalWeight += order.peso;
        acc.totalValue += order.valor;
        return acc;
      },
      { totalWeight: 0, totalValue: 0 }
    );
  };

  return (
    <Grid container spacing={3}>
      {directions.map(direction => {
        const ordersInDirection = selectedOrders[direction.id] || [];
        if (ordersInDirection.length === 0) return null;

        return (
          <DirectionCard
            key={direction.id}
            direction={direction}
            orders={ordersInDirection}
            handleGenerateDelivery={() => handleShowMap(direction.id)}
            handleExpandedOrdersDialogOpen={handleExpandedOrdersDialogOpen}
            handleDetailsDialogOpen={handleDetailsDialogOpen}
            calculateTotalWeightAndValue={calculateTotalWeightAndValue}
            handleShowMap={handleShowMap} // Adicionando a propriedade handleShowMap
          />
        );
      })}
    </Grid>
  );
};

export default OrderSection;
