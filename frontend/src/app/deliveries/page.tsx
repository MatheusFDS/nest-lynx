'use client';

import React, { useEffect, useState } from 'react';
import { Typography, Container, Button, Grid, Paper, TextField } from '@mui/material';
import { Driver } from '../../types';
import withAuth from '../components/withAuth';

const DriversPage = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [newDriver, setNewDriver] = useState<string>('');
  const [error, setError] = useState<string>('');

  const fetchDrivers = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/drivers', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch drivers');
      }

      const data = await response.json();
      setDrivers(data);
    } catch (error) {
      setError('Failed to fetch drivers.');
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleAddDriver = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/drivers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newDriver }),
      });

      if (!response.ok) {
        throw new Error('Failed to add driver');
      }

      setNewDriver('');
      fetchDrivers();
    } catch (error) {
      setError('Failed to add driver.');
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Drivers
      </Typography>
      {error && <Typography color="error">{error}</Typography>}
      <Grid container spacing={3} style={{ marginTop: '16px' }}>
        <Grid item xs={12}>
          <Paper elevation={3} style={{ padding: '16px' }}>
            <TextField
              label="New Driver"
              value={newDriver}
              onChange={(e) => setNewDriver(e.target.value)}
              fullWidth
              margin="normal"
            />
            <Button variant="contained" color="primary" onClick={handleAddDriver}>
              Add Driver
            </Button>
          </Paper>
        </Grid>
        {drivers.map((driver) => (
          <Grid item xs={12} sm={6} md={4} key={driver.id}>
            <Paper elevation={3} style={{ padding: '16px' }}>
              <Typography variant="h6">{driver.name}</Typography>
              <Typography variant="body1">License: {driver.license}</Typography>
              <Typography variant="body1">CPF: {driver.cpf}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default withAuth(DriversPage);
