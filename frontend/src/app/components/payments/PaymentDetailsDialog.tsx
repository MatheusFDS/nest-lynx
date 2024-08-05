// components/PaymentDetailsDialog.tsx
import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Grid, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import { Delivery } from '../../../types';

interface PaymentDetailsDialogProps {
  open: boolean;
  deliveries: Delivery[];
  onClose: () => void;
}

const PaymentDetailsDialog: React.FC<PaymentDetailsDialogProps> = ({ open, deliveries, onClose }) => (
  <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
    <DialogTitle>Detalhes do Roteiro</DialogTitle>
    <DialogContent>
      {deliveries.length > 0 ? (
        deliveries.map(delivery => (
          <div key={delivery.id}>
            <Typography variant="h6">Informações da Rota</Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography>ID da Rota: {delivery.id}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography>Motorista: {delivery.Driver?.name || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography>Veículo: {delivery.Vehicle?.model || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography>Valor do Frete: R$ {delivery.valorFrete.toFixed(2)}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography>Total Peso: {delivery.totalPeso.toFixed(2)} kg</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography>Total Valor: R$ {delivery.totalValor.toFixed(2)}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography>Status: {delivery.status}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography>Data Início: {new Date(delivery.dataInicio).toLocaleString()}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography>Data Fim: {delivery.dataFim ? new Date(delivery.dataFim).toLocaleString() : 'N/A'}</Typography>
              </Grid>
            </Grid>

            <Typography variant="h6" style={{ marginTop: '16px' }}>Documentos</Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Documento</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Endereço</TableCell>
                  <TableCell>Cidade</TableCell>
                  <TableCell>UF</TableCell>
                  <TableCell>CEP</TableCell>
                  <TableCell>Valor</TableCell>
                  <TableCell>Peso</TableCell>
                  <TableCell>Volume</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Data de Criação</TableCell>
                  <TableCell>Data de Atualização</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {delivery.orders.map(order => (
                  <TableRow key={order.id}>
                    <TableCell>{order.numero}</TableCell>
                    <TableCell>{order.cliente}</TableCell>
                    <TableCell>{order.endereco}</TableCell>
                    <TableCell>{order.cidade}</TableCell>
                    <TableCell>{order.uf}</TableCell>
                    <TableCell>{order.cep}</TableCell>
                    <TableCell>{order.valor.toFixed(2)}</TableCell>
                    <TableCell>{order.peso.toFixed(2)}</TableCell>
                    <TableCell>{order.volume}</TableCell>
                    <TableCell>{order.status}</TableCell>
                    <TableCell>{new Date(order.createdAt).toLocaleString()}</TableCell>
                    <TableCell>{new Date(order.updatedAt).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ))
      ) : (
        <Typography>Carregando...</Typography>
      )}
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} color="primary">
        Fechar
      </Button>
    </DialogActions>
  </Dialog>
);

export default PaymentDetailsDialog;
