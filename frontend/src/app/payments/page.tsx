'use client';

import React, { useEffect, useState } from 'react';
import { Typography, Container, Button, Paper, TextField, Grid, Checkbox, FormControlLabel, Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material';
import { Payment, Delivery } from '../../types';
import withAuth from '../components/withAuth';
import { fetchPayments, updatePaymentStatus, groupPayments, ungroupPayments, fetchDeliveryDetails } from '../../services/paymentService';

const PaymentsPage = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [grouped, setGrouped] = useState<boolean>(false);
  const [paid, setPaid] = useState<boolean>(false);
  const [pending, setPending] = useState<boolean>(false);
  const [selectedPayments, setSelectedPayments] = useState<number[]>([]);
  const [error, setError] = useState<string>('');

  const token = localStorage.getItem('token') || '';

  const loadPayments = async () => {
    try {
      const data = await fetchPayments(token);
      setPayments(data);
      setFilteredPayments(data);
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
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleViewDetails = async (deliveryId: number) => {
    try {
      const details = await fetchDeliveryDetails(token, deliveryId);
      // Mostrar detalhes em um modal ou outra interface de sua escolha
      console.log(details);
    } catch (error) {
      setError('Failed to fetch delivery details.');
    }
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
          />
          <TextField
            label="Data Fim"
            type="date"
            fullWidth
            value={endDate}
            onChange={handleDateChange}
            name="endDate"
            InputLabelProps={{ shrink: true }}
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
        </Grid>
      </Grid>
      <Button variant="contained" color="primary" onClick={handleGroupPayments} style={{ marginTop: '16px' }}>
        Agrupar Selecionados
      </Button>
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
                    disabled={payment.groupedPaymentId !== null}
                  />
                </TableCell>
                <TableCell>{payment.id}</TableCell>
                <TableCell>{payment.deliveryId}</TableCell>
                <TableCell>{payment.amount}</TableCell>
                <TableCell>{new Date(payment.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>{payment.status === 'Baixado' ? new Date(payment.updatedAt).toLocaleDateString() : 'N/A'}</TableCell>
                <TableCell>
                  <Button onClick={() => handleViewDetails(payment.deliveryId)}>Detalhes</Button>
                  {payment.status === 'Pendente' ? (
                    <Button onClick={() => handlePaymentStatusChange(payment.id, 'Baixado')}>Baixar</Button>
                  ) : (
                    <Button onClick={() => handlePaymentStatusChange(payment.id, 'Pendente')}>Cancelar Baixa</Button>
                  )}
                  {payment.groupedPaymentId ? (
                    <Button onClick={() => handleUngroupPayments(payment.id)}>Desagrupar</Button>
                  ) : (
                    <Button disabled>Desagrupar</Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
};

export default withAuth(PaymentsPage);
