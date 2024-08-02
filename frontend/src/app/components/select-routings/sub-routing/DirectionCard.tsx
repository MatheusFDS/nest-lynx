import React from 'react';
import { Grid, Paper, Typography, Button, IconButton } from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { Order, Direction } from '../../../../types';

interface DirectionCardProps {
  direction: Direction | null;
  orders: Order[];
  handleGenerateDelivery: (directionId: string | null) => void;
  handleExpandedOrdersDialogOpen: (directionId: string | null) => void;
  handleDetailsDialogOpen: (order: Order) => void;
  calculateTotalWeightAndValue: (orders: Order[]) => { totalWeight: number; totalValue: number };
  handleShowMap: (directionId: string | null) => void;
}

const DirectionCard: React.FC<DirectionCardProps> = ({
  direction,
  orders,
  handleGenerateDelivery,
  handleExpandedOrdersDialogOpen,
  handleDetailsDialogOpen,
  calculateTotalWeightAndValue,
  handleShowMap,
}) => {
  const { totalWeight, totalValue } = calculateTotalWeightAndValue(orders);
  const directionId = direction ? direction.id : 'no-region';
  const regionLabel = direction ? direction.regiao : 'Sem Região';

  return (
    <Grid item xs={12} sm={6} md={4}>
      <Paper elevation={3} style={{ padding: '8px', height: '550px', overflow: 'hidden' }}>
        <Typography variant="subtitle1">{regionLabel}</Typography>
        {direction && (
          <>
            <Typography variant="body2">CEP: {direction.rangeInicio} - {direction.rangeFim}</Typography>
          </>
        )}
        <Typography variant="body2">Total Valor: R$ {totalValue.toFixed(2)}</Typography>
        <Typography variant="body2">Total Peso: {totalWeight.toFixed(2)} kg</Typography>
        <Typography variant="body2">Total de Pedidos: {orders.length}</Typography>
        <Button
          variant="contained"
          color="primary"
          size="small"
          style={{ marginTop: '8px' }}
          onClick={() => handleGenerateDelivery(direction ? direction.id : null)}
        >
          Gerar Rota
        </Button>
        <IconButton
          edge="end"
          size="small"
          onClick={() => handleExpandedOrdersDialogOpen(direction ? direction.id : null)}
          style={{ marginLeft: '8px' }}
        >
          <ExpandMore fontSize="small" />
        </IconButton>
        <Droppable droppableId={directionId.toString()}>
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} style={{ marginTop: '8px', overflowY: 'auto', maxHeight: '100%' }}>
              {orders.map((order, index) => (
                <Draggable key={order.id.toString()} draggableId={order.id.toString()} index={index}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                      <Paper style={{ padding: '4px', marginBottom: '4px', width: '100%' }}>
                        <Typography variant="body2">{`Pedido ${order.numero} - Cliente: ${order.cliente}`}</Typography>
                        <Typography variant="caption">{`CEP: ${order.cep}, Valor: ${order.valor}, Peso: ${order.peso}`}</Typography>
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={() => handleDetailsDialogOpen(order)}
                          style={{ float: 'right' }}
                        >
                          <ExpandMore fontSize="small" />
                        </IconButton>
                      </Paper>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </Paper>
    </Grid>
  );
};

export default DirectionCard;
