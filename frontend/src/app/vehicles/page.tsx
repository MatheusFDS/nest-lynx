'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Typography,
  Container,
  Button,
  Paper,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Box
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { Vehicle, Driver, Category } from '../../types';
import withAuth from '../hoc/withAuth';
import { fetchVehicles, addVehicle, updateVehicle, deleteVehicle } from '../../services/vehicleService';
import { fetchDrivers } from '../../services/driverService';
import { fetchCategories } from '../../services/categoryService';
import { useLoading } from '../context/LoadingContext';
import SkeletonLoader from '../components/SkeletonLoader';
import { useMessage } from '../context/MessageContext'; // Importar o contexto de mensagens

const VehiclesPage: React.FC = () => {
  const { setLoading, isLoading } = useLoading();
  const { showMessage } = useMessage(); // Hook para mensagens
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [newVehicle, setNewVehicle] = useState<Partial<Vehicle>>({});
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);

  const token = localStorage.getItem('token') || '';

  // Função para extrair o tenantId do token (se necessário)
  const getTenantIdFromToken = (): string | null => {
    try {
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      return tokenPayload.tenantId || null;
    } catch (error) {
      console.error('Error extracting tenantId from token:', error);
      return null;
    }
  };

  const tenantId = getTenantIdFromToken();

  // Função para carregar veículos
  const loadVehicles = useCallback(async () => {
    if (!token) {
      showMessage('Token de autenticação não encontrado.', 'error'); // Mensagem de erro
      return;
    }

    setLoading(true);
    try {
      const fetchedVehicles = await fetchVehicles(token);
      setVehicles(Array.isArray(fetchedVehicles) ? fetchedVehicles : []);
      setFilteredVehicles(Array.isArray(fetchedVehicles) ? fetchedVehicles : []);
      showMessage('Veículos carregados com sucesso.', 'success'); // Mensagem de sucesso
    } catch (error: unknown) {
      console.error('Failed to fetch vehicles:', error);
      showMessage('Falha ao carregar veículos.', 'error'); // Mensagem de erro
    } finally {
      setLoading(false);
    }
  }, [token, setLoading, showMessage]);

  // Função para carregar motoristas
  const loadDrivers = useCallback(async () => {
    if (!token) {
      showMessage('Token de autenticação não encontrado.', 'error'); // Mensagem de erro
      return;
    }

    setLoading(true);
    try {
      const fetchedDrivers = await fetchDrivers(token);
      setDrivers(Array.isArray(fetchedDrivers) ? fetchedDrivers : []);
      showMessage('Motoristas carregados com sucesso.', 'success'); // Mensagem de sucesso
    } catch (error: unknown) {
      console.error('Failed to fetch drivers:', error);
      showMessage('Falha ao carregar motoristas.', 'error'); // Mensagem de erro
    } finally {
      setLoading(false);
    }
  }, [token, setLoading, showMessage]);

  // Função para carregar categorias
  const loadCategories = useCallback(async () => {
    if (!token) {
      showMessage('Token de autenticação não encontrado.', 'error'); // Mensagem de erro
      return;
    }

    setLoading(true);
    try {
      const fetchedCategories = await fetchCategories(token);
      setCategories(Array.isArray(fetchedCategories) ? fetchedCategories : []);
      showMessage('Categorias carregadas com sucesso.', 'success'); // Mensagem de sucesso
    } catch (error: unknown) {
      console.error('Failed to fetch categories:', error);
      showMessage('Falha ao carregar categorias.', 'error'); // Mensagem de erro
    } finally {
      setLoading(false);
    }
  }, [token, setLoading, showMessage]);

  useEffect(() => {
    loadVehicles();
    loadDrivers();
    loadCategories();
  }, [loadVehicles, loadDrivers, loadCategories]);

  // Manipulador de busca
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    const filtered = vehicles.filter(vehicle =>
      vehicle.model.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setFilteredVehicles(filtered);
  };

  // Manipulador de adicionar ou atualizar veículo
  const handleAddOrUpdateVehicle = async () => {
    if (!tenantId) {
      showMessage('tenantId inválido.', 'error'); // Mensagem de erro
      return;
    }

    const vehicleToSave = { ...newVehicle, tenantId } as Vehicle;

    try {
      if (selectedVehicle) {
        await updateVehicle(token, selectedVehicle.id, vehicleToSave);
        showMessage('Veículo atualizado com sucesso.', 'success'); // Mensagem de sucesso
      } else {
        await addVehicle(token, vehicleToSave);
        showMessage('Veículo adicionado com sucesso.', 'success'); // Mensagem de sucesso
      }
      setNewVehicle({});
      setSelectedVehicle(null);
      setShowForm(false);
      loadVehicles();
    } catch (error: unknown) {
      console.error('Failed to submit vehicle:', error);
      showMessage('Falha ao submeter veículo.', 'error'); // Mensagem de erro
    }
  };

  // Manipulador de edição
  const handleEdit = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setNewVehicle(vehicle);
    setShowForm(true);
    showMessage(`Editando o veículo: ${vehicle.model}`, 'info'); // Mensagem informativa
  };

  // Manipulador de exclusão
  const handleDelete = async (id: string) => {
    try {
      await deleteVehicle(token, id);
      showMessage('Veículo deletado com sucesso.', 'success'); // Mensagem de sucesso
      loadVehicles();
    } catch (error: unknown) {
      console.error('Failed to delete vehicle:', error);
      showMessage('Falha ao deletar veículo.', 'error'); // Mensagem de erro
    }
  };

  // Manipulador de fechamento do formulário
  const handleFormClose = () => {
    setSelectedVehicle(null);
    setNewVehicle({});
    setShowForm(false);
    showMessage('Formulário fechado.', 'info'); // Mensagem informativa
  };

  return (
    <Container>
      {/* Removido: Exibição de mensagens de erro diretamente no JSX */}
      {/* {error && <Typography color="error">{error}</Typography>} */}

      <TextField
        label="Buscar"
        value={searchTerm}
        onChange={handleSearch}
        fullWidth
        margin="normal"
      />
      <Button variant="contained" color="primary" onClick={() => setShowForm(true)}>
        Adicionar Veículo
      </Button>
      {showForm && (
        <Paper elevation={3} style={{ padding: '16px', marginTop: '16px' }}>
          <Typography variant="h6">{selectedVehicle ? 'Atualizar Veículo' : 'Adicionar Veículo'}</Typography>
          <TextField
            label="Modelo do Veículo"
            value={newVehicle.model || ''}
            onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Placa"
            value={newVehicle.plate || ''}
            onChange={(e) => setNewVehicle({ ...newVehicle, plate: e.target.value })}
            fullWidth
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Motorista</InputLabel>
            <Select
              value={newVehicle.driverId || ''}
              onChange={(e) => setNewVehicle({ ...newVehicle, driverId: e.target.value })}
            >
              {drivers.map((driver) => (
                <MenuItem key={driver.id} value={driver.id}>
                  {driver.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Categoria</InputLabel>
            <Select
              value={newVehicle.categoryId || ''}
              onChange={(e) => setNewVehicle({ ...newVehicle, categoryId: e.target.value })}
            >
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box style={{ marginTop: '16px' }}>
            <Button variant="contained" color="primary" onClick={handleAddOrUpdateVehicle}>
              {selectedVehicle ? 'Atualizar Veículo' : 'Adicionar Veículo'}
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleFormClose}
              style={{ marginLeft: '8px' }}
            >
              Cancelar
            </Button>
          </Box>
        </Paper>
      )}
      {isLoading ? (
        <SkeletonLoader />
      ) : (
        <TableContainer component={Paper} style={{ marginTop: '16px' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Modelo</TableCell>
                <TableCell>Placa</TableCell>
                <TableCell>Motorista</TableCell>
                <TableCell>Categoria</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredVehicles.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell>{vehicle.model}</TableCell>
                  <TableCell>{vehicle.plate}</TableCell>
                  <TableCell>{drivers.find(driver => driver.id === vehicle.driverId)?.name || 'Sem Motorista'}</TableCell>
                  <TableCell>{categories.find(category => category.id === vehicle.categoryId)?.name || 'Sem Categoria'}</TableCell>
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
      )}
    </Container>
  );
};

export default withAuth(VehiclesPage, { requiredRole: 'admin' });
