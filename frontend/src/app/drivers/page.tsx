'use client';

import React, { useEffect, useState } from 'react';
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
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Delete, Edit } from '@mui/icons-material';
import withAuth from '../hoc/withAuth';
import {
  fetchDrivers,
  addDriver,
  updateDriver,
  deleteDriver,
} from '../../services/driverService';
import SkeletonLoader from '../components/SkeletonLoader';
import { useLoading } from '../context/LoadingContext'; // Importar o LoadingContext
import { useMessage } from '../context/MessageContext'; // Importar o contexto de mensagens
import { Driver } from '../../types';

const StyledButton = styled(Button)({
  margin: '8px',
  padding: '8px 16px',
  backgroundColor: '#1976d2',
  color: '#fff',
  '&:hover': {
    backgroundColor: '#115293',
  },
});

const DriversPage: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [filteredDrivers, setFilteredDrivers] = useState<Driver[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [newDriver, setNewDriver] = useState<Partial<Driver>>({});
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const { isLoading, setLoading } = useLoading(); // Usar o contexto de carregamento
  const { showMessage } = useMessage(); // Hook para mensagens

  const token = localStorage.getItem('token') || '';

  const loadDrivers = async () => {
    setLoading(true);
    try {
      const data = await fetchDrivers(token);
      setDrivers(data);
      setFilteredDrivers(data);
      showMessage('Motoristas carregados com sucesso!', 'success'); // Mensagem de sucesso
    } catch (error: unknown) {
      console.error('Erro ao buscar motoristas:', error);
      showMessage('Falha ao buscar motoristas.', 'error'); // Mensagem de erro
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrivers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    const filtered = drivers.filter((driver) =>
      driver.name.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredDrivers(filtered);
  };

  const handleAddDriver = async () => {
    if (!newDriver.name || !newDriver.license || !newDriver.cpf) {
      showMessage('Por favor, preencha todos os campos.', 'warning'); // Mensagem de aviso
      return;
    }

    setLoading(true);
    try {
      if (selectedDriver) {
        await updateDriver(token, selectedDriver.id, newDriver as Driver);
        showMessage('Motorista atualizado com sucesso!', 'success'); // Mensagem de sucesso
      } else {
        await addDriver(token, newDriver as Driver);
        showMessage('Motorista adicionado com sucesso!', 'success'); // Mensagem de sucesso
      }
      setNewDriver({});
      setSelectedDriver(null);
      setShowForm(false);
      //await loadDrivers();
    } catch (error: unknown) {
      console.error('Erro ao submeter motorista:', error);
      showMessage('Falha ao submeter motorista.', 'error'); // Mensagem de erro
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (driver: Driver) => {
    setSelectedDriver(driver);
    setNewDriver(driver);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      await deleteDriver(token, id);
      showMessage('Motorista deletado com sucesso!', 'success'); // Mensagem de sucesso
      //await loadDrivers();
    } catch (error: unknown) {
      console.error('Erro ao deletar motorista:', error);
      showMessage('Falha ao deletar motorista.', 'error'); // Mensagem de erro
    } finally {
      setLoading(false);
    }
  };

  const handleFormClose = () => {
    setSelectedDriver(null);
    setNewDriver({});
    setShowForm(false);
  };

  return (
    <Container>
      {/* Campo de Busca */}
      <TextField
        label="Buscar Motoristas"
        value={searchTerm}
        onChange={handleSearch}
        fullWidth
        margin="normal"
      />

      {/* Botão para Adicionar Motorista */}
      <StyledButton
        variant="contained"
        color="primary"
        onClick={() => setShowForm(true)}
      >
        Adicionar Motorista
      </StyledButton>

      {/* Formulário de Adição/Atualização de Motorista */}
      {showForm && (
        <Paper elevation={3} style={{ padding: '16px', marginTop: '16px' }}>
          <TextField
            label="Nome do Motorista"
            value={newDriver.name || ''}
            onChange={(e) =>
              setNewDriver({ ...newDriver, name: e.target.value })
            }
            fullWidth
            margin="normal"
          />
          <TextField
            label="CNH"
            value={newDriver.license || ''}
            onChange={(e) =>
              setNewDriver({ ...newDriver, license: e.target.value })
            }
            fullWidth
            margin="normal"
          />
          <TextField
            label="CPF"
            value={newDriver.cpf || ''}
            onChange={(e) =>
              setNewDriver({ ...newDriver, cpf: e.target.value })
            }
            fullWidth
            margin="normal"
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddDriver}
            style={{ marginRight: '8px' }}
          >
            {selectedDriver ? 'Atualizar Motorista' : 'Adicionar Motorista'}
          </Button>
          <Button variant="outlined" onClick={handleFormClose}>
            Cancelar
          </Button>
        </Paper>
      )}

      {/* Tabela de Motoristas */}
      {isLoading ? (
        <SkeletonLoader />
      ) : (
        <TableContainer component={Paper} style={{ marginTop: '16px' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>CNH</TableCell>
                <TableCell>CPF</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDrivers.map((driver) => (
                <TableRow key={driver.id}>
                  <TableCell>{driver.name}</TableCell>
                  <TableCell>{driver.license}</TableCell>
                  <TableCell>{driver.cpf}</TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handleEdit(driver)}
                      aria-label="editar"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(driver.id)}
                      aria-label="deletar"
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {filteredDrivers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Nenhum motorista encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default withAuth(DriversPage);
