import React from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { Order } from '../../../types';

interface ConsultOrderProps {
  detailsDialogOpen: boolean;
  handleDetailsDialogClose: () => void;
  orders: Order[];
}

const ConsultOrder: React.FC<ConsultOrderProps> = ({
  detailsDialogOpen,
  handleDetailsDialogClose,
  orders,
}) => {
  return (
    <Dialog open={detailsDialogOpen} onClose={handleDetailsDialogClose} maxWidth="md" fullWidth>
      <DialogTitle>Detalhes da Entrega</DialogTitle>
      <DialogContent>
        <List>
          {orders.map(order => (
            <ListItem key={order.id}>
              <ListItemText
                primary={`Pedido: ${order.id}`}
                secondary={`Cliente: ${order.cliente} - Valor: R$${order.valor.toFixed(2)}`}
              />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDetailsDialogClose} color="primary">
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConsultOrder;
