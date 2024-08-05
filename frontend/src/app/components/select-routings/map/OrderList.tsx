import React from 'react';
import { Paper, Box, Typography } from '@mui/material';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import OrderItem from './OrderItem';
import { Order } from '../../../../types';

interface OrderListProps {
  orders: Order[];
  moveOrder: (dragIndex: number, hoverIndex: number) => void;
  removeOrder: (index: number) => void;
  openOrderDetails: (order: Order) => void;
}

const listContainerStyle = {
  maxHeight: '300px',
  overflowY: 'auto' as 'auto',
};

const OrderList: React.FC<OrderListProps> = ({ orders, moveOrder, removeOrder, openOrderDetails }) => (
  <Paper elevation={3} style={{ padding: '5px', marginBottom: '5px', flexGrow: 1 }}>
    <Typography variant="h6" style={{ fontSize: '0.85em' }}>Documentos</Typography>
    <Box style={listContainerStyle}>
      <DndProvider backend={HTML5Backend}>
        {orders.map((order, index) => (
          <OrderItem
            key={order.id}
            index={index}
            order={order}
            moveOrder={moveOrder}
            removeOrder={removeOrder}
            openOrderDetails={openOrderDetails}
          />
        ))}
      </DndProvider>
    </Box>
  </Paper>
);

export default OrderList;
