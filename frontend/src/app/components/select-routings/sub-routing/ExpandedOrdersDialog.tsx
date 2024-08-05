import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, Paper, Typography, IconButton } from '@mui/material';
import { Info } from '@mui/icons-material';
import { Order } from '../../../../types';

interface ExpandedOrdersDialogProps {
  open: boolean;
  onClose: () => void;
  orders: Order[];
  handleDetailsDialogOpen: (order: Order) => void;
}

const ExpandedOrdersDialog: React.FC<ExpandedOrdersDialogProps> = ({ open, onClose, orders, handleDetailsDialogOpen }) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Todos os Documentos</DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          {orders.map(order => (
            <Grid item xs={12} key={order.id}>
              <Paper style={{ padding: '8px', marginBottom: '8px' }}>
                <Typography variant="body2">{`Documento ${order.numero} - Cliente: ${order.cliente}`}</Typography>
                <Typography variant="caption">{`CEP: ${order.cep}, Valor: ${order.valor}, Peso: ${order.peso}`}</Typography>
                <IconButton
                  edge="end"
                  size="small"
                  onClick={() => handleDetailsDialogOpen(order)}
                  style={{ float: 'right' }}
                >
                  <Info fontSize="small" />
                </IconButton>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">Fechar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExpandedOrdersDialog;
