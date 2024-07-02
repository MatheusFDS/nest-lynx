'use client';

import React, { useEffect, useState } from 'react';
import { Typography, Container, Button, Grid, Paper, TextField } from '@mui/material';
import { Vehicle } from '../../types';
import withAuth from '../components/withAuth';

const VehiclesPage = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [newVehicle, setNewVehicle] = useState<string>('');
  const [error, setError] = useState<string>('');

  const fetchVehicles = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/vehicles', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch vehicles');
      }

      const data = await response.json();
      setVehicles(data);
    } catch (error) {
      setError('Failed to fetch vehicles.');
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleAddVehicle = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ model: newVehicle }),
      });

      if (!response.ok) {
        throw new Error('Failed to add vehicle');
      }

      setNewVehicle('');
      fetchVehicles();
    } catch (error) {
      setError('Failed to add vehicle.');
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Vehicles
      </Typography>
      {error && <Typography color="error">{error}</Typography>}
      <Grid container spacing={3} style={{ marginTop: '16px' }}>
        <Grid item xs={12}>
          <Paper elevation={3} style={{ padding: '16px' }}>
            <TextField
              label="New Vehicle"
              value={newVehicle}
              onChange={(e) => setNewVehicle(e.target.value)}
              fullWidth
              margin="normal"
            />
            <Button variant="contained" color="primary" onClick={handleAddVehicle}>
              Add Vehicle
            </Button>
          </Paper>
        </Grid>
        {vehicles.map((vehicle) => (
          <Grid item xs={12} sm={6} md={4} key={vehicle.id}>
            <Paper elevation={3} style={{ padding: '16px' }}>
              <Typography variant="h6">{vehicle.model}</Typography>
              <Typography variant="body1">Plate: {vehicle.plate}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default withAuth(VehiclesPage);
