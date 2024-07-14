'use client';

import React, { useEffect, useState } from 'react';
import {
  Typography, Container, Button, Paper, TextField, Grid, Checkbox, FormControlLabel,
  Table, TableHead, TableBody, TableRow, TableCell, IconButton, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Payment, Direction, Delivery } from '../../types';
import withAuth from '../hoc/withAuth';
import { fetchPayments, updatePaymentStatus, groupPayments, ungroupPayments, fetchDeliveryDetails } from '../../services/paymentService';
import { fetchDirections } from '../../services/auxiliaryService';
import InfoIcon from '@mui/icons-material/Info';
import GetAppIcon from '@mui/icons-material/GetApp';

const StyledButton = styled(Button)({
  margin: '0 8px',
  padding: '8px 16px',
  backgroundColor: '#1976d2',
  color: '#fff',
  '&:hover': {
    backgroundColor: '#115293',
  },
});

const PaymentsPage = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [directions, setDirections] = useState<Direction[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [grouped, setGrouped] = useState<boolean>(false);
  const [paid, setPaid] = useState<boolean>(false);
  const [pending, setPending] = useState<boolean>(true);
  const [selectedPayments, setSelectedPayments] = useState<number[]>([]);
  const [error, setError] = useState<string>('');
  const [detailsOpen, setDetailsOpen] = useState<boolean>(false);
  const [selectedDeliveries, setSelectedDeliveries] = useState<Delivery[]>([]);

  const token = localStorage.getItem('token') || '';

  const loadPayments = async () => {
    try {
      const [paymentsData, directionsData] = await Promise.all([
        fetchPayments(token),
        fetchDirections(token),
      ]);
      setPayments(paymentsData);
      setFilteredPayments(paymentsData.filter(payment => payment.status === 'Pendente'));
      setDirections(directionsData);
    } catch (error) {
      setError('Failed to fetch payments.');
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    filterPayments(e.target.value, startDate, endDate, grouped, paid, pending);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'startDate') {
      setStartDate(value);
      filterPayments(searchTerm, value, endDate, grouped, paid, pending);
    } else {
      setEndDate(value);
      filterPayments(searchTerm, startDate, value, grouped, paid, pending);
    }
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    if (name === 'grouped') {
      setGrouped(checked);
      filterPayments(searchTerm, startDate, endDate, checked, paid, pending);
    } else if (name === 'paid') {
      setPaid(checked);
      filterPayments(searchTerm, startDate, endDate, grouped, checked, pending);
    } else if (name === 'pending') {
      setPending(checked);
      filterPayments(searchTerm, startDate, endDate, grouped, paid, checked);
    }
  };

  const filterPayments = (searchTerm: string, startDate: string, endDate: string, grouped: boolean, paid: boolean, pending: boolean) => {
    let filtered = payments;

    if (searchTerm) {
      filtered = filtered.filter(payment =>
        Object.values(payment).some(value =>
          value ? value.toString().toLowerCase().includes(searchTerm.toLowerCase()) : false
        )
      );
    }

    if (startDate && endDate) {
      filtered = filtered.filter(payment => {
        const paymentDate = new Date(payment.createdAt);
        return paymentDate >= new Date(startDate) && paymentDate <= new Date(endDate);
      });
    }

    if (grouped) {
      filtered = filtered.filter(payment => payment.groupedPaymentId !== null);
    }

    if (paid) {
      filtered = filtered.filter(payment => payment.status === 'Baixado');
    }

    if (pending) {
      filtered = filtered.filter(payment => payment.status === 'Pendente');
    }

    if (!searchTerm && !startDate && !endDate && !grouped && !paid && !pending) {
      filtered = [];
    }

    setFilteredPayments(filtered);
  };

  const handlePaymentSelect = (paymentId: number) => {
    setSelectedPayments(prevSelected =>
      prevSelected.includes(paymentId)
        ? prevSelected.filter(id => id !== paymentId)
        : [...prevSelected, paymentId]
    );
  };

  const handleGroupPayments = async () => {
    if (selectedPayments.length === 0) {
      setError('Nenhum pagamento selecionado para agrupar.');
      return;
    }

    try {
      await groupPayments(token, selectedPayments);
      loadPayments();
      setSelectedPayments([]);
    } catch (error) {
      setError('Failed to group payments.');
    }
  };

  const handleUngroupPayments = async (paymentId: number) => {
    try {
      await ungroupPayments(token, paymentId);
      loadPayments();
    } catch (error) {
      setError('Failed to ungroup payment.');
    }
  };

  const handlePaymentStatusChange = async (paymentId: number, status: string) => {
    try {
      console.log(`Updating payment status for payment ID: ${paymentId} to ${status}`);
      await updatePaymentStatus(token, paymentId, status);
      loadPayments();
    } catch (error) {
      setError(`Failed to update payment status: ${error}`);
    }
  };

  const handleViewDetails = async (deliveryIds: number[]) => {
    try {
      const detailsPromises = deliveryIds.map(id => fetchDeliveryDetails(token, id));
      const details = await Promise.all(detailsPromises);
      setSelectedDeliveries(details);
      setDetailsOpen(true);
    } catch (error) {
      setError('Failed to fetch delivery details.');
    }
  };

  const handleDetailsClose = () => {
    setDetailsOpen(false);
    setSelectedDeliveries([]);
  };

  return (
    <Container>
      {error && <Typography color="error">{error}</Typography>}
      <Grid container spacing={3} style={{ marginTop: '16px', marginBottom: '16px' }}>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Buscar"
            fullWidth
            value={searchTerm}
            onChange={handleSearch}
            variant="outlined"
            size="small"
            placeholder="Pesquisar por qualquer campo"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <TextField
            label="Data Início"
            type="datetime-local"
            fullWidth
            value={startDate}
            onChange={handleDateChange}
            name="startDate"
            InputLabelProps={{ shrink: true }}
            size="small"
            variant="outlined"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <TextField
            label="Data Fim"
            type="datetime-local"
            fullWidth
            value={endDate}
            onChange={handleDateChange}
            name="endDate"
            InputLabelProps={{ shrink: true }}
            size="small"
            variant="outlined"
          />
        </Grid>
      </Grid>

      <Grid item xs={12} sm={2}>
        <StyledButton
          variant="contained"
          color="primary"
          onClick={handleGroupPayments}
          style={{ marginBottom: '16px' }}
          disabled={selectedPayments.length === 0 || selectedPayments.some(id => payments.find(payment => payment.id === id)?.groupedPaymentId)}
        >
          Agrupar Selecionados
        </StyledButton>

        <FormControlLabel
          control={<Checkbox checked={grouped} onChange={handleStatusFilterChange} name="grouped" />}
          label="Agrupados"
        />
        <FormControlLabel
          control={<Checkbox checked={paid} onChange={handleStatusFilterChange} name="paid" />}
          label="Baixados"
        />
        <FormControlLabel
          control={<Checkbox checked={pending} onChange={handleStatusFilterChange} name="pending" />}
          label="Pendentes"
        />
      </Grid>
      
      <Paper elevation={3}>
        {filteredPayments.length > 0 ? (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Selecionar</TableCell>
                <TableCell>ID Pagamento</TableCell>
                <TableCell>ID Roteiros</TableCell>
                <TableCell>Valor Total</TableCell>
                <TableCell>Data Criação</TableCell>
                <TableCell>Data Baixa</TableCell>
                <TableCell>Nome Motorista</TableCell>
                <TableCell>isGroup</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPayments.map(payment => (
                <TableRow key={payment.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedPayments.includes(payment.id)}
                      onChange={() => handlePaymentSelect(payment.id)}
                      disabled={payment.isGroup || payment.groupedPaymentId !== null}
                    />
                  </TableCell>
                  <TableCell>{payment.id}</TableCell>
                  <TableCell>{payment.paymentDeliveries.map(pd => pd.delivery.id).join(', ')}</TableCell>
                  <TableCell>{payment.amount}</TableCell>
                  <TableCell>{new Date(payment.createdAt).toLocaleString()}</TableCell>
                  <TableCell>{payment.status === 'Baixado' ? new Date(payment.updatedAt).toLocaleString() : 'N/A'}</TableCell>
                  <TableCell>{payment.Driver?.name || 'N/A'}</TableCell>
                  <TableCell>{payment.isGroup ? 'Sim' : 'Não'}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleViewDetails(payment.paymentDeliveries.map(pd => pd.delivery.id))}>
                      <InfoIcon />
                    </IconButton>
                    <IconButton onClick={() => handlePaymentStatusChange(payment.id, payment.status === 'Baixado' ? 'Pendente' : 'Baixado')}>
                      {payment.status === 'Baixado' ? <GetAppIcon style={{ color: 'red' }} /> : <GetAppIcon />}
                    </IconButton>
                    {payment.isGroup && (
                      <StyledButton onClick={() => handleUngroupPayments(payment.id)}>Desagrupar</StyledButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Typography align="center" style={{ padding: '16px' }}>
            Nenhum pagamento encontrado. Use os filtros para buscar pagamentos.
          </Typography>
        )}
      </Paper>

      <Dialog open={detailsOpen} onClose={handleDetailsClose} fullWidth maxWidth="md">
        <DialogTitle>Detalhes do Roteiro</DialogTitle>
        <DialogContent>
          {selectedDeliveries.length > 0 ? (
            selectedDeliveries.map(delivery => (
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

                <Typography variant="h6" style={{ marginTop: '16px' }}>Pedidos</Typography>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID Pedido</TableCell>
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
                        <TableCell>{order.id}</TableCell>
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
          <Button onClick={handleDetailsClose} color="primary">
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default withAuth(PaymentsPage);
