'use client';

import React, { useEffect, useState } from 'react';
import { Typography, Container, Button, Grid, Paper, TextField } from '@mui/material';
import { Direction } from '../../types';
import withAuth from '../components/withAuth';

const DirectionsPage = () => {
  const [directions, setDirections] = useState<Direction[]>([]);
  const [newDirection, setNewDirection] = useState({
    rangeInicio: '',
    rangeFim: '',
    valorDirecao: '',
    regiao: '',
  });
  const [error, setError] = useState<string>('');

  const fetchDirections = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/directions', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch directions');
      }

      const data = await response.json();
      setDirections(data);
    } catch (error) {
      setError('Failed to fetch directions.');
    }
  };

  useEffect(() => {
    fetchDirections();
  }, []);

  const handleAddDirection = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/directions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newDirection),
      });

      if (!response.ok) {
        throw new Error('Failed to add direction');
      }

      setNewDirection({
        rangeInicio: '',
        rangeFim: '',
        valorDirecao: '',
        regiao: '',
      });
      fetchDirections();
    } catch (error) {
      setError('Failed to add direction.');
    }
  };

  return (
    <Container>
      {error && <Typography color="error">{error}</Typography>}
      <Grid container spacing={3} style={{ marginTop: '16px' }}>
        <Grid item xs={12}>
          <Paper elevation={3} style={{ padding: '16px' }}>
            <TextField
              label="Range Início"
              value={newDirection.rangeInicio}
              onChange={(e) => setNewDirection({ ...newDirection, rangeInicio: e.target.value })}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Range Fim"
              value={newDirection.rangeFim}
              onChange={(e) => setNewDirection({ ...newDirection, rangeFim: e.target.value })}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Valor Direção"
              value={newDirection.valorDirecao}
              onChange={(e) => setNewDirection({ ...newDirection, valorDirecao: e.target.value })}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Região"
              value={newDirection.regiao}
              onChange={(e) => setNewDirection({ ...newDirection, regiao: e.target.value })}
              fullWidth
              margin="normal"
            />
            <Button variant="contained" color="primary" onClick={handleAddDirection}>
              Add Direction
            </Button>
          </Paper>
        </Grid>
        {directions.map((direction) => (
          <Grid item xs={12} sm={6} md={4} key={direction.id}>
            <Paper elevation={3} style={{ padding: '16px' }}>
              <Typography variant="h6">Range: {direction.rangeInicio} - {direction.rangeFim}</Typography>
              <Typography variant="body1">Valor: {direction.valorDirecao}</Typography>
              <Typography variant="body1">Região: {direction.regiao}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default withAuth(DirectionsPage);
