'use client';

import React, { useEffect, useState } from 'react';
import { Typography, Container, Button, Paper, TextField, Grid, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { Payment, Driver } from '../../types';
import withAuth from '../components/withAuth';
import { fetchPayments, updatePaymentStatus } from '../../services/paymentService';
import { fetchDrivers } from '../../services/auxiliaryService';
import { SelectChangeEvent } from '@mui/material/Select';

const PaymentsPage = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [error, setError] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

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

  const loadDrivers = async () => {
    try {
      const driversData = await fetchDrivers(token);
      setDrivers(driversData);
    } catch (error) {
      setError('Failed to fetch drivers.');
    }
  };

  useEffect(() => {
    loadPayments();
    loadDrivers();
  }, []);

  const handleStatusChange = async (paymentId: number, newStatus: string) => {
    try {
      await updatePaymentStatus(token, paymentId, newStatus);
      loadPayments();
    } catch (error) {
      setError('Failed to update payment status.');
    }
  };

  const handleDateFilterChange = () => {
    if (startDate && endDate) {
      let filtered = payments.filter(payment => {
        const paymentDate = new Date(payment.createdAt);
        return paymentDate >= new Date(startDate) && paymentDate <= new Date(endDate);
      });

      if (statusFilter) {
        filtered = filtered.filter(payment => payment.status === statusFilter);
      }

      setFilteredPayments(filtered);
    } else {
      setFilteredPayments(payments);
    }
  };

  const handleStatusFilterChange = (event: SelectChangeEvent<string>) => {
    setStatusFilter(event.target.value);
  };

  const groupedPayments = filteredPayments.reduce((acc, payment) => {
    const driver = drivers.find(driver => driver.id === payment.motoristaId);
    if (driver) {
      if (!acc[driver.name]) {
        acc[driver.name] = {
          motoristaId: driver.id,
          name: driver.name,
          totalAmount: 0,
          payments: []
        };
      }
      acc[driver.name].totalAmount += payment.amount;
      acc[driver.name].payments.push(payment);
    }
    return acc;
  }, {} as Record<string, { motoristaId: number, name: string, totalAmount: number, payments: Payment[] }>);

  return (
    <Container>
      {error && <Typography color="error">{error}</Typography>}
      <Grid container spacing={3} style={{ marginTop: '16px' }}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Start Date"
            type="date"
            fullWidth
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            margin="normal"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="End Date"
            type="date"
            fullWidth
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            margin="normal"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth margin="normal">
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={handleStatusFilterChange}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Pendente">Pendente</MenuItem>
              <MenuItem value="Pago">Pago</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Button variant="contained" color="primary" onClick={handleDateFilterChange}>
            Filter
          </Button>
        </Grid>
      </Grid>
      {Object.keys(groupedPayments).map(driverName => (
        <Paper elevation={3} style={{ padding: '16px', marginTop: '16px' }} key={groupedPayments[driverName].motoristaId}>
          <Typography variant="h6">{driverName}</Typography>
          <Typography variant="body1">Total Amount: {groupedPayments[driverName].totalAmount}</Typography>
          {groupedPayments[driverName].payments.map((payment) => (
            <Paper elevation={3} style={{ padding: '16px', marginTop: '16px' }} key={payment.id}>
              <Typography variant="body1">Amount: {payment.amount}</Typography>
              <Typography variant="body1">Status: {payment.status}</Typography>
              <FormControl fullWidth margin="normal">
                <InputLabel>Status</InputLabel>
                <Select
                  value={payment.status}
                  onChange={(e: SelectChangeEvent<string>) => handleStatusChange(payment.id, e.target.value)}
                >
                  <MenuItem value="Pendente">Pendente</MenuItem>
                  <MenuItem value="Pago">Pago</MenuItem>
                </Select>
              </FormControl>
            </Paper>
          ))}
        </Paper>
      ))}
    </Container>
  );
};

export default withAuth(PaymentsPage);
