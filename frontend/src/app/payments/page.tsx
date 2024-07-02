'use client';

import React, { useEffect, useState } from 'react';
import { Typography, Container, Button, Grid, Paper, TextField } from '@mui/material';
import { Payment } from '../../types';
import withAuth from '../components/withAuth';

const PaymentsPage = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [newPayment, setNewPayment] = useState<string>('');
  const [error, setError] = useState<string>('');

  const fetchPayments = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/payments', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch payments');
      }

      const data = await response.json();
      setPayments(data);
    } catch (error) {
      setError('Failed to fetch payments.');
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleAddPayment = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: newPayment }),
      });

      if (!response.ok) {
        throw new Error('Failed to add payment');
      }

      setNewPayment('');
      fetchPayments();
    } catch (error) {
      setError('Failed to add payment.');
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Payments
      </Typography>
      {error && <Typography color="error">{error}</Typography>}
      <Grid container spacing={3} style={{ marginTop: '16px' }}>
        <Grid item xs={12}>
          <Paper elevation={3} style={{ padding: '16px' }}>
            <TextField
              label="New Payment"
              value={newPayment}
              onChange={(e) => setNewPayment(e.target.value)}
              fullWidth
              margin="normal"
            />
            <Button variant="contained" color="primary" onClick={handleAddPayment}>
              Add Payment
            </Button>
          </Paper>
        </Grid>
        {payments.map((payment) => (
          <Grid item xs={12} sm={6} md={4} key={payment.id}>
            <Paper elevation={3} style={{ padding: '16px' }}>
              <Typography variant="h6">Amount: {payment.amount}</Typography>
              <Typography variant="body1">Status: {payment.status}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default withAuth(PaymentsPage);
