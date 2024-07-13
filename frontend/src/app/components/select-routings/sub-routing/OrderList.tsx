import React from 'react';
import { ListItem, ListItemText, IconButton, Paper, Typography } from '@mui/material';
import { Info } from '@mui/icons-material';
import { Draggable } from 'react-beautiful-dnd';
import { Order } from '../../../../types';

interface OrderListProps {
  orders: Order[];
  handleDetailsDialogOpen: (order: Order) => void;
}

const OrderList: React.FC<OrderListProps> = ({ orders, handleDetailsDialogOpen }) => {
  return (
    <>
      {orders.map((order, index) => (
        <Draggable key={order.id.toString()} draggableId={order.id.toString()} index={index}>
          {(provided) => (
            <ListItem ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
              <Paper style={{ padding: '4px', marginBottom: '4px', width: '100%' }}>
                <ListItemText
                  primary={<Typography variant="body2">{`Pedido ${order.numero} - Cliente: ${order.cliente}`}</Typography>}
                  secondary={<Typography variant="caption">{`CEP: ${order.cep}, Valor: ${order.valor}, Peso: ${order.peso}`}</Typography>}
                />
                <IconButton
                  edge="end"
                  size="small"
                  onClick={() => handleDetailsDialogOpen(order)}
                >
                  <Info fontSize="small" />
                </IconButton>
              </Paper>
            </ListItem>
          )}
        </Draggable>
      ))}
    </>
  );
};

export default OrderList;
