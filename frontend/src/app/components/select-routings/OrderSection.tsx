import React from 'react';
import { Grid } from '@mui/material';
import DirectionCard from './sub-routing/DirectionCard';
import { Direction, Order } from '../../../types';

interface OrderSectionProps {
  directions: Direction[];
  selectedOrders: { [key: string]: Order[]; noRegion: Order[] };
  handleShowMap: (directionId: string | null) => void;
  handleExpandedOrdersDialogOpen: (directionId: string | null) => void;
  handleDetailsDialogOpen: (order: Order) => void;
}

const OrderSection: React.FC<OrderSectionProps> = ({
  directions,
  selectedOrders,
  handleShowMap,
  handleExpandedOrdersDialogOpen,
  handleDetailsDialogOpen,
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

  const ordersWithoutDirection = selectedOrders.noRegion || [];

  const sortedDirections = [...directions].sort((a, b) => a.rangeInicio.localeCompare(b.rangeInicio));

  return (
    <Grid container spacing={1}>
      {sortedDirections.map(direction => {
        const ordersInDirection = selectedOrders[direction.id] || [];
        if (ordersInDirection.length === 0) return null;

        return (
          <DirectionCard
            key={direction.id}
            direction={direction}
            orders={ordersInDirection}
            handleGenerateDelivery={() => handleShowMap(direction.id)}
            handleExpandedOrdersDialogOpen={() => handleExpandedOrdersDialogOpen(direction.id)}
            handleDetailsDialogOpen={handleDetailsDialogOpen}
            calculateTotalWeightAndValue={calculateTotalWeightAndValue}
            handleShowMap={handleShowMap}
          />
        );
      })}
      {ordersWithoutDirection.length > 0 && (
        <DirectionCard
          key="no-region"
          direction={null}
          orders={ordersWithoutDirection}
          handleGenerateDelivery={() => handleShowMap(null)}
          handleExpandedOrdersDialogOpen={() => handleExpandedOrdersDialogOpen(null)}
          handleDetailsDialogOpen={handleDetailsDialogOpen}
          calculateTotalWeightAndValue={calculateTotalWeightAndValue}
          handleShowMap={handleShowMap}
        />
      )}
    </Grid>
  );
};

export default OrderSection;
