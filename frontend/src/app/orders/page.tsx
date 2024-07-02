'use client';

import React, { useEffect, useState } from 'react';
import { Typography, Container, Button, Grid, Paper, TextField } from '@mui/material';
import { Order } from '../../types';
import withAuth from '../components/withAuth';

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [newOrder, setNewOrder] = useState<string>('');
  const [error, setError] = useState<string>('');

  const fetchOrders = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/orders', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(data);
    } catch (error) {
      setError('Failed to fetch orders.');
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleAddOrder = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ description: newOrder }),
      });

      if (!response.ok) {
        throw new Error('Failed to add order');
      }

      setNewOrder('');
      fetchOrders();
    } catch (error) {
      setError('Failed to add order.');
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Orders
      </Typography>
      {error && <Typography color="error">{error}</Typography>}
      <Grid container spacing={3} style={{ marginTop: '16px' }}>
        <Grid item xs={12}>
          <Paper elevation={3} style={{ padding: '16px' }}>
            <TextField
              label="New Order"
              value={newOrder}
              onChange={(e) => setNewOrder(e.target.value)}
              fullWidth
              margin="normal"
            />
            <Button variant="contained" color="primary" onClick={handleAddOrder}>
              Add Order
            </Button>
          </Paper>
        </Grid>
        {orders.map((order) => (
          <Grid item xs={12} sm={6} md={4} key={order.id}>
            <Paper elevation={3} style={{ padding: '16px' }}>
              <Typography variant="h6">{order.numero}</Typography>
              <Typography variant="body1">Client: {order.cliente}</Typography>
              <Typography variant="body1">City: {order.cidade}</Typography>
              <Typography variant="body1">Status: {order.status}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default withAuth(OrdersPage);
