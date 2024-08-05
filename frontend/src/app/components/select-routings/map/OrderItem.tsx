import React, { useRef } from 'react';
import { Paper, Box, ListItemText, IconButton } from '@mui/material';
import { useDrag, useDrop } from 'react-dnd';
import { Delete as DeleteIcon, Info as InfoIcon } from '@mui/icons-material';
import { Order } from '../../../../types';

const ItemTypes = {
  ORDER: 'order',
};

interface OrderItemProps {
  order: Order;
  index: number;
  moveOrder: (dragIndex: number, hoverIndex: number) => void;
  removeOrder: (index: number) => void;
  openOrderDetails: (order: Order) => void;
}

const OrderItem: React.FC<OrderItemProps> = ({ order, index, moveOrder, removeOrder, openOrderDetails }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [, drop] = useDrop({
    accept: ItemTypes.ORDER,
    hover(item: { index: number }, monitor) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;
      moveOrder(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.ORDER,
    item: { type: ItemTypes.ORDER, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <div ref={ref} style={{ opacity: isDragging ? 0 : 1 }}>
      <Paper style={{ padding: '2px', marginBottom: '2px', width: '100%' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <ListItemText
            primary={`Documento ${index + 1} - Nº ${order.numero} - ${order.cliente}`}
            secondary={`CEP: ${order.cep}`}
            primaryTypographyProps={{ variant: 'body2', style: { fontSize: '0.7em' } }}
            secondaryTypographyProps={{ variant: 'caption', style: { fontSize: '0.6em' } }}
          />
          <Box display="flex" alignItems="center">
            <IconButton edge="end" aria-label="details" onClick={() => openOrderDetails(order)} size="small">
              <InfoIcon fontSize="small" />
            </IconButton>
            <IconButton edge="end" aria-label="delete" onClick={() => removeOrder(index)} size="small">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </Paper>
    </div>
  );
};

export default OrderItem;
