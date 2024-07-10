'use client';

import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
} from '@mui/material';
import { fetchDeliveries, releaseDelivery } from '../../services/deliveryService';
import { Delivery, Order } from '../../types';
import withAuth from '../components/withAuth';
import { Info } from '@mui/icons-material';

const ReleasePage: React.FC = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [releaseDialogOpen, setReleaseDialogOpen] = useState(false);
  const [error, setError] = useState<string>('');

  const token = localStorage.getItem('token') || '';

  const loadDeliveries = async () => {
    try {
      const deliveriesData = await fetchDeliveries(token);
      setDeliveries(deliveriesData.filter((delivery: Delivery) => delivery.status === 'A liberar'));
    } catch (error: unknown) {
      setError('Failed to load deliveries.');
    }
  };

  useEffect(() => {
    loadDeliveries();
  }, []);

  const handleReleaseDialogOpen = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setReleaseDialogOpen(true);
  };

  const handleReleaseDialogClose = () => {
    setReleaseDialogOpen(false);
    setSelectedDelivery(null);
  };

  const handleDetailsDialogOpen = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setDetailsDialogOpen(true);
  };

  const handleDetailsDialogClose = () => {
    setDetailsDialogOpen(false);
    setSelectedDelivery(null);
  };

  const handleRelease = async () => {
    if (!selectedDelivery) return;

    try {
      await releaseDelivery(token, selectedDelivery.id);
      setReleaseDialogOpen(false);
      loadDeliveries();
    } catch (error: unknown) {
      setError('Failed to release delivery.');
    }
  };

  const calculateTotalWeightAndValue = (orders: Order[]) => {
    let totalWeight = 0;
    let totalValue = 0;
    orders.forEach(order => {
      totalWeight += order.peso;
      totalValue += order.valor;
    });
    return { totalWeight, totalValue };
  };

  return (
    <Container style={{ marginTop: '24px' }}>
      {error && <Typography color="error">{error}</Typography>}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Motorista</TableCell>
              <TableCell>Veículo</TableCell>
              <TableCell>Total Peso</TableCell>
              <TableCell>Total Valor</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {deliveries.map(delivery => (
              <TableRow key={delivery.id}>
                <TableCell>{delivery.id}</TableCell>
                <TableCell>{delivery.Driver.name}</TableCell>
                <TableCell>{delivery.Vehicle.model}</TableCell>
                <TableCell>{delivery.totalPeso?.toFixed(2)} kg</TableCell>
                <TableCell>R$ {delivery.totalValor?.toFixed(2)}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleDetailsDialogOpen(delivery)}>
                    <Info />
                  </IconButton>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => handleReleaseDialogOpen(delivery)}
                  >
                    Liberar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {selectedDelivery && (
        <>
          <Dialog open={releaseDialogOpen} onClose={handleReleaseDialogClose} fullWidth maxWidth="sm">
            <DialogTitle>Liberar Roteiro</DialogTitle>
            <DialogContent>
              <Typography variant="body2">Tem certeza que deseja liberar o roteiro {selectedDelivery.id}?</Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Número do Pedido</TableCell>
                      <TableCell>Cliente</TableCell>
                      <TableCell>CEP</TableCell>
                      <TableCell>Valor</TableCell>
                      <TableCell>Peso</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedDelivery.orders.map(order => (
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
                Total Peso: {calculateTotalWeightAndValue(selectedDelivery.orders).totalWeight.toFixed(2)} kg
              </Typography>
              <Typography variant="body2">
                Total Valor: R$ {calculateTotalWeightAndValue(selectedDelivery.orders).totalValue.toFixed(2)}
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleReleaseDialogClose} color="secondary">
                Cancelar
              </Button>
              <Button onClick={handleRelease} color="primary">
                Liberar
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog open={detailsDialogOpen} onClose={handleDetailsDialogClose} fullWidth maxWidth="sm">
            <DialogTitle>Detalhes do Roteiro</DialogTitle>
            <DialogContent>
              <Typography variant="h6">Roteiro ID: {selectedDelivery.id}</Typography>
              <Typography variant="body2">Motorista: {selectedDelivery.Driver.name}</Typography>
              <Typography variant="body2">Veículo: {selectedDelivery.Vehicle.model}</Typography>
              <Typography variant="body2">Total Peso: {selectedDelivery.totalPeso?.toFixed(2)} kg</Typography>
              <Typography variant="body2">Total Valor: R$ {selectedDelivery.totalValor?.toFixed(2)}</Typography>
              <TableContainer component={Paper} style={{ marginTop: '16px' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Número do Pedido</TableCell>
                      <TableCell>Cliente</TableCell>
                      <TableCell>CEP</TableCell>
                      <TableCell>Valor</TableCell>
                      <TableCell>Peso</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedDelivery.orders.map(order => (
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
                Total Peso: {calculateTotalWeightAndValue(selectedDelivery.orders).totalWeight.toFixed(2)} kg
              </Typography>
              <Typography variant="body2">
                Total Valor: R$ {calculateTotalWeightAndValue(selectedDelivery.orders).totalValue.toFixed(2)}
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDetailsDialogClose} color="primary">
                Fechar
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Container>
  );
};

export default withAuth(ReleasePage);
