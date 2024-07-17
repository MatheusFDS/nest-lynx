'use client';

import React, { useEffect, useState } from 'react';
import { Typography, Container, Button, Paper, TextField, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import { Vehicle, Driver, Category } from '../../types'; // Importando os tipos
import withAuth from '../hoc/withAuth';
import { fetchVehicles, addVehicle, updateVehicle, deleteVehicle } from '../../services/vehicleService';
import { fetchDrivers } from '../../services/driverService'; // Certifique-se de que estas funções existem
import { fetchCategories } from '../../services/categoryService'; // Certifique-se de que estas funções existem
import { Delete, Edit } from '@mui/icons-material';

const VehiclesPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [newVehicle, setNewVehicle] = useState<Partial<Vehicle>>({});
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const token = localStorage.getItem('token') || '';

  const loadVehicles = async () => {
    try {
      const data = await fetchVehicles(token);
      setVehicles(data);
      setFilteredVehicles(data);
    } catch (error) {
      setError('Failed to fetch vehicles.');
    }
  };

  const loadDrivers = async () => {
    try {
      const data = await fetchDrivers(token);
      setDrivers(data);
    } catch (error) {
      setError('Failed to fetch drivers.');
    }
  };

  const loadCategories = async () => {
    try {
      const data = await fetchCategories(token);
      setCategories(data);
    } catch (error) {
      setError('Failed to fetch categories.');
    }
  };

  useEffect(() => {
    loadVehicles();
    loadDrivers();
    loadCategories();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    const filtered = vehicles.filter(vehicle =>
      vehicle.model.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setFilteredVehicles(filtered);
  };

  const handleAddVehicle = async () => {
    try {
      if (selectedVehicle) {
        await updateVehicle(token, selectedVehicle.id, newVehicle as Vehicle);
      } else {
        await addVehicle(token, newVehicle as Vehicle);
      }
      setNewVehicle({});
      setSelectedVehicle(null);
      setShowForm(false);
      loadVehicles();
    } catch (error) {
      setError('Failed to submit vehicle.');
    }
  };

  const handleEdit = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setNewVehicle(vehicle);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteVehicle(token, id);
      loadVehicles();
    } catch (error) {
      setError('Failed to delete vehicle.');
    }
  };

  const handleFormClose = () => {
    setSelectedVehicle(null);
    setNewVehicle({});
    setShowForm(false);
  };

  return (
    <Container>
      {error && <Typography color="error">{error}</Typography>}
      <TextField
        label="Search Vehicles"
        value={searchTerm}
        onChange={handleSearch}
        fullWidth
        margin="normal"
      />
      <Button variant="contained" color="primary" onClick={() => setShowForm(true)}>
        Adicionar Veiculo
      </Button>
      {showForm && (
        <Paper elevation={3} style={{ padding: '16px', marginTop: '16px' }}>
          <TextField
            label="Vehicle Model"
            value={newVehicle.model || ''}
            onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Plate"
            value={newVehicle.plate || ''}
            onChange={(e) => setNewVehicle({ ...newVehicle, plate: e.target.value })}
            fullWidth
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Driver</InputLabel>
            <Select
              value={newVehicle.driverId || ''}
              onChange={(e) => setNewVehicle({ ...newVehicle, driverId: Number(e.target.value) })}
            >
              {drivers.map((driver) => (
                <MenuItem key={driver.id} value={driver.id}>
                  {driver.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Category</InputLabel>
            <Select
              value={newVehicle.categoryId || ''}
              onChange={(e) => setNewVehicle({ ...newVehicle, categoryId: Number(e.target.value) })}
            >
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="contained" color="primary" onClick={handleAddVehicle}>
            {selectedVehicle ? 'Update Vehicle' : 'Add Vehicle'}
          </Button>
          <Button onClick={handleFormClose}>Cancel</Button>
        </Paper>
      )}
      <TableContainer component={Paper} style={{ marginTop: '16px' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Model</TableCell>
              <TableCell>Plate</TableCell>
              <TableCell>Driver</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredVehicles.map((vehicle) => (
              <TableRow key={vehicle.id}>
                <TableCell>{vehicle.model}</TableCell>
                <TableCell>{vehicle.plate}</TableCell>
                <TableCell>{drivers.find(driver => driver.id === vehicle.driverId)?.name}</TableCell>
                <TableCell>{categories.find(category => category.id === vehicle.categoryId)?.name}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(vehicle)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(vehicle.id)}>
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

export default withAuth(VehiclesPage);
