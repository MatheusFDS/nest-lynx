'use client';

import React, { useEffect, useState } from 'react';
import { Typography, Container, Button, Paper, TextField, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { Driver } from '../../types'; // Certifique-se de que Driver está corretamente importado
import withAuth from '../hoc/withAuth';
import { fetchDrivers, addDriver, updateDriver, deleteDriver } from '../../services/driverService';
import { Delete, Edit } from '@mui/icons-material';

const DriversPage: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [filteredDrivers, setFilteredDrivers] = useState<Driver[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [newDriver, setNewDriver] = useState<Partial<Driver>>({});
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const token = localStorage.getItem('token') || '';

  const loadDrivers = async () => {
    try {
      const data = await fetchDrivers(token);
      setDrivers(data);
      setFilteredDrivers(data);
    } catch (error) {
      setError('Failed to fetch drivers.');
    }
  };

  useEffect(() => {
    loadDrivers();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    const filtered = drivers.filter(driver =>
      driver.name.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setFilteredDrivers(filtered);
  };

  const handleAddDriver = async () => {
    try {
      if (selectedDriver) {
        await updateDriver(token, selectedDriver.id, newDriver as Driver);
      } else {
        await addDriver(token, newDriver as Driver);
      }
      setNewDriver({});
      setSelectedDriver(null);
      setShowForm(false);
      loadDrivers();
    } catch (error) {
      setError('Failed to submit driver.');
    }
  };

  const handleEdit = (driver: Driver) => {
    setSelectedDriver(driver);
    setNewDriver(driver);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteDriver(token, id);
      loadDrivers();
    } catch (error) {
      setError('Failed to delete driver.');
    }
  };

  const handleFormClose = () => {
    setSelectedDriver(null);
    setNewDriver({});
    setShowForm(false);
  };

  return (
    <Container>
      {error && <Typography color="error">{error}</Typography>}
      <TextField
        label="Search Drivers"
        value={searchTerm}
        onChange={handleSearch}
        fullWidth
        margin="normal"
      />
      <Button variant="contained" color="primary" onClick={() => setShowForm(true)}>
        Adicionar Motorista
      </Button>
      {showForm && (
        <Paper elevation={3} style={{ padding: '16px', marginTop: '16px' }}>
          <TextField
            label="Driver Name"
            value={newDriver.name || ''}
            onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="License"
            value={newDriver.license || ''}
            onChange={(e) => setNewDriver({ ...newDriver, license: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="CPF"
            value={newDriver.cpf || ''}
            onChange={(e) => setNewDriver({ ...newDriver, cpf: e.target.value })}
            fullWidth
            margin="normal"
          />
          <Button variant="contained" color="primary" onClick={handleAddDriver}>
            {selectedDriver ? 'Update Driver' : 'Add Driver'}
          </Button>
          <Button onClick={handleFormClose}>Cancel</Button>
        </Paper>
      )}
      <TableContainer component={Paper} style={{ marginTop: '16px' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>License</TableCell>
              <TableCell>CPF</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredDrivers.map((driver) => (
              <TableRow key={driver.id}>
                <TableCell>{driver.name}</TableCell>
                <TableCell>{driver.license}</TableCell>
                <TableCell>{driver.cpf}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(driver)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(driver.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default withAuth(DriversPage);
