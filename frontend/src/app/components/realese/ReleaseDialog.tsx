import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { Delivery, Order } from '../../../types';

interface ReleaseDialogProps {
  open: boolean;
  onClose: () => void;
  delivery: Delivery;
  onRelease: () => void;
}

const calculateTotalWeightAndValue = (orders: Order[]) => {
  let totalWeight = 0;
  let totalValue = 0;
  orders.forEach(order => {
    totalWeight += order.peso;
    totalValue += order.valor;
  });
  return { totalWeight, totalValue };
};

const ReleaseDialog: React.FC<ReleaseDialogProps> = ({ open, onClose, delivery, onRelease }) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Liberar Roteiro</DialogTitle>
      <DialogContent>
        <Typography variant="body2">Tem certeza que deseja liberar o roteiro {delivery.id}?</Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Número do Documento</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>CEP</TableCell>
                <TableCell>Valor</TableCell>
                <TableCell>Peso</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {delivery.orders.map(order => (
                <TableRow key={order.id}>
                  <TableCell>{order.numero}</TableCell>
                  <TableCell>{order.cliente}</TableCell>
                  <TableCell>{order.cep}</TableCell>
                  <TableCell>R$ {order.valor.toFixed(2)}</TableCell>
                  <TableCell>{order.peso.toFixed(2)} kg</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Typography variant="body2" style={{ marginTop: '16px' }}>
          Total Peso: {calculateTotalWeightAndValue(delivery.orders).totalWeight.toFixed(2)} kg
        </Typography>
        <Typography variant="body2">
          Total Valor: R$ {calculateTotalWeightAndValue(delivery.orders).totalValue.toFixed(2)}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancelar
        </Button>
        <Button onClick={onRelease} color="primary">
          Liberar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReleaseDialog;
