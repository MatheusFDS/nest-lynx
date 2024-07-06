'use client';

import React, { useEffect, useState } from 'react';
import { Typography, Container, Button, Paper, TextField, Grid, Checkbox, FormControlLabel, Table, TableHead, TableBody, TableRow, TableCell, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Payment, Direction, Delivery } from '../../types';
import withAuth from '../components/withAuth';
import { fetchPayments, updatePaymentStatus, groupPayments, ungroupPayments, fetchDeliveryDetails } from '../../services/paymentService';
import { fetchDirections } from '../../services/auxiliaryService';
import InfoIcon from '@mui/icons-material/Info';
import GetAppIcon from '@mui/icons-material/GetApp';
import CancelIcon from '@mui/icons-material/Cancel';

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
  const [pending, setPending] = useState<boolean>(false);
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
      setFilteredPayments(paymentsData);
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
      await updatePaymentStatus(token, paymentId, status);
      loadPayments();
    } catch (error) {
      setError('Failed to update payment status.');
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
      <Grid container spacing={3} style={{ marginTop: '16px' }}>
        <Grid item xs={12} sm={6}>
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
        <Grid item xs={12} sm={6}>
          <TextField
            label="Data Início"
            type="date"
            fullWidth
            value={startDate}
            onChange={handleDateChange}
            name="startDate"
            InputLabelProps={{ shrink: true }}
            size="small"
            variant="outlined"
          />
          <TextField
            label="Data Fim"
            type="date"
            fullWidth
            value={endDate}
            onChange={handleDateChange}
            name="endDate"
            InputLabelProps={{ shrink: true }}
            size="small"
            variant="outlined"
            style={{ marginTop: '16px' }}
          />
        </Grid>
        <Grid item xs={12}>
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
          <StyledButton onClick={loadPayments} style={{ marginLeft: '8px' }}>
            Aplicar
          </StyledButton>
        </Grid>
      </Grid>
      <StyledButton
        variant="contained"
        color="primary"
        onClick={handleGroupPayments}
        style={{ marginTop: '16px' }}
        disabled={selectedPayments.length === 0 || selectedPayments.some(id => payments.find(payment => payment.id === id)?.groupedPaymentId)}
      >
        Agrupar Selecionados
      </StyledButton>
      <Paper elevation={3} style={{ marginTop: '16px' }}>
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
                <TableCell>{new Date(payment.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>{payment.status === 'Baixado' ? new Date(payment.updatedAt).toLocaleDateString() : 'N/A'}</TableCell>
                <TableCell>{payment.Driver?.name || 'N/A'}</TableCell>
                <TableCell>{payment.isGroup ? 'Sim' : 'Não'}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleViewDetails(payment.paymentDeliveries.map(pd => pd.delivery.id))}>
                    <InfoIcon />
                  </IconButton>
                  <IconButton onClick={() => handlePaymentStatusChange(payment.id, payment.status === 'Baixado' ? 'Pendente' : 'Baixado')}>
                    {payment.status === 'Baixado' ? <CancelIcon /> : <GetAppIcon />}
                  </IconButton>
                  {payment.isGroup && (
                    <StyledButton onClick={() => handleUngroupPayments(payment.id)}>Desagrupar</StyledButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={detailsOpen} onClose={handleDetailsClose} fullWidth maxWidth="md">
        <DialogTitle>Detalhes do Roteiro</DialogTitle>
        <DialogContent>
          {selectedDeliveries.length > 0 ? (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID da Rota</TableCell>
                  <TableCell>Motorista</TableCell>
                  <TableCell>Veículo</TableCell>
                  <TableCell>Valor do Frete</TableCell>
                  <TableCell>Total Peso</TableCell>
                  <TableCell>Total Valor</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Data Início</TableCell>
                  <TableCell>Data Fim</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedDeliveries.map(delivery => (
                  <TableRow key={delivery.id}>
                    <TableCell>{delivery.id}</TableCell>
                    <TableCell>{delivery.Driver?.name || 'N/A'}</TableCell>
                    <TableCell>{delivery.Vehicle?.model || 'N/A'}</TableCell>
                    <TableCell>R$ {delivery.valorFrete.toFixed(2)}</TableCell>
                    <TableCell>{delivery.totalPeso.toFixed(2)} kg</TableCell>
                    <TableCell>R$ {delivery.totalValor.toFixed(2)}</TableCell>
                    <TableCell>{delivery.status}</TableCell>
                    <TableCell>{new Date(delivery.dataInicio).toLocaleDateString()}</TableCell>
                    <TableCell>{delivery.dataFim ? new Date(delivery.dataFim).toLocaleDateString() : 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
