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

interface DetailsDialogProps {
  open: boolean;
  onClose: () => void;
  delivery: Delivery;
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

const DetailsDialog: React.FC<DetailsDialogProps> = ({ open, onClose, delivery }) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Detalhes do Roteiro</DialogTitle>
      <DialogContent>
        <Typography variant="h6">Roteiro ID: {delivery.id}</Typography>
        <Typography variant="body2">Motorista: {delivery.Driver.name}</Typography>
        <Typography variant="body2">Veículo: {delivery.Vehicle.model}</Typography>
        <Typography variant="body2">Total Peso: {delivery.totalPeso?.toFixed(2)} kg</Typography>
        <Typography variant="body2">Total Valor: R$ {delivery.totalValor?.toFixed(2)}</Typography>
        <TableContainer component={Paper} style={{ marginTop: '16px' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Número do Documento</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>CEP</TableCell>
                <TableCell>Endereço</TableCell>
                <TableCell>Cidade</TableCell>
                <TableCell>UF</TableCell>
                <TableCell>Contato</TableCell>
                <TableCell>Telefone</TableCell>
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
                  <TableCell>{order.endereco}</TableCell>
                  <TableCell>{order.cidade}</TableCell>
                  <TableCell>{order.uf}</TableCell>
                  <TableCell>{order.nomeContato}</TableCell>
                  <TableCell>{order.telefone}</TableCell>
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
        <Button onClick={onClose} color="primary">
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DetailsDialog;
