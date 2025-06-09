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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Chip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Delete, Edit, Person } from '@mui/icons-material';
import withAuth from '../hoc/withAuth';
import {
  fetchDrivers,
  addDriver,
  updateDriver,
  deleteDriver,
  fetchAvailableUsers,
} from '../../services/driverService';
import SkeletonLoader from '../components/SkeletonLoader';
import { useLoading } from '../context/LoadingContext';
import { useMessage } from '../context/MessageContext';
import { Driver, AvailableUser } from '../../types';

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
  const [availableUsers, setAvailableUsers] = useState<AvailableUser[]>([]);
  const { isLoading, setLoading } = useLoading();
  const { showMessage } = useMessage();

  const token = localStorage.getItem('token') || '';

  const loadDrivers = async () => {
    setLoading(true);
    try {
      const data = await fetchDrivers(token);
      setDrivers(data);
      setFilteredDrivers(data);
    } catch (error: unknown) {
      console.error('Erro ao buscar motoristas:', error);
      showMessage('Falha ao buscar motoristas.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableUsers = async () => {
    try {
      const users = await fetchAvailableUsers(token);
      setAvailableUsers(users);
    } catch (error: unknown) {
      console.error('Erro ao buscar usuários disponíveis:', error);
      showMessage('Falha ao buscar usuários disponíveis.', 'error');
    }
  };

  useEffect(() => {
    loadDrivers();
    loadAvailableUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    const filtered = drivers.filter((driver) =>
      driver.name.toLowerCase().includes(term.toLowerCase()) ||
      driver.cpf.toLowerCase().includes(term.toLowerCase()) ||
      driver.license.toLowerCase().includes(term.toLowerCase()) ||
      (driver.User?.name?.toLowerCase().includes(term.toLowerCase()) ?? false) ||
      (driver.User?.email?.toLowerCase().includes(term.toLowerCase()) ?? false)
    );
    setFilteredDrivers(filtered);
  };

const handleAddDriver = async () => {
  if (!newDriver.name || !newDriver.license || !newDriver.cpf) {
    showMessage('Por favor, preencha todos os campos obrigatórios.', 'warning');
    return;
  }

  setLoading(true);
  try {
    // Criar objeto apenas com campos permitidos para evitar envio de dados desnecessários
    const driverData = {
      name: newDriver.name,
      license: newDriver.license,
      cpf: newDriver.cpf,
      userId: newDriver.userId || undefined, // Enviar undefined se não selecionado
    };

    if (selectedDriver) {
      await updateDriver(token, selectedDriver.id, driverData);
      showMessage('Motorista atualizado com sucesso!', 'success');
    } else {
      await addDriver(token, driverData);
      showMessage('Motorista adicionado com sucesso!', 'success');
    }
    
    setNewDriver({});
    setSelectedDriver(null);
    setShowForm(false);
    await loadDrivers();
    await loadAvailableUsers();
  } catch (error: unknown) {
    console.error('Erro ao submeter motorista:', error);
    showMessage('Falha ao submeter motorista.', 'error');
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
      showMessage('Motorista deletado com sucesso!', 'success');
      await loadDrivers();
      await loadAvailableUsers(); // Recarregar usuários disponíveis
    } catch (error: unknown) {
      console.error('Erro ao deletar motorista:', error);
      showMessage('Falha ao deletar motorista.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFormClose = () => {
    setSelectedDriver(null);
    setNewDriver({});
    setShowForm(false);
  };

  const handleUserSelect = (event: SelectChangeEvent<string>) => {
    const userId = event.target.value;
    setNewDriver({ ...newDriver, userId: userId || undefined });
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
        placeholder="Busque por nome, CPF, CNH, usuário relacionado..."
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
          <Typography variant="h6" gutterBottom>
            {selectedDriver ? 'Editar Motorista' : 'Adicionar Motorista'}
          </Typography>
          
          <TextField
            label="Nome do Motorista *"
            value={newDriver.name || ''}
            onChange={(e) =>
              setNewDriver({ ...newDriver, name: e.target.value })
            }
            fullWidth
            margin="normal"
            required
          />
          
          <TextField
            label="CNH *"
            value={newDriver.license || ''}
            onChange={(e) =>
              setNewDriver({ ...newDriver, license: e.target.value })
            }
            fullWidth
            margin="normal"
            required
          />
          
          <TextField
            label="CPF *"
            value={newDriver.cpf || ''}
            onChange={(e) =>
              setNewDriver({ ...newDriver, cpf: e.target.value })
            }
            fullWidth
            margin="normal"
            required
          />

          <FormControl fullWidth margin="normal">
            <InputLabel id="user-select-label">Usuário Relacionado (Opcional)</InputLabel>
            <Select
              labelId="user-select-label"
              value={newDriver.userId || ''}
              onChange={handleUserSelect}
              label="Usuário Relacionado (Opcional)"
            >
              <MenuItem value="">
                <em>Nenhum usuário selecionado</em>
              </MenuItem>
              {availableUsers.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.name} - {user.email}
                </MenuItem>
              ))}
              {/* Se estiver editando e o motorista já tem um usuário, incluir na lista */}
              {selectedDriver?.User && !availableUsers.find(u => u.id === selectedDriver.User?.id) && (
                <MenuItem key={selectedDriver.User.id} value={selectedDriver.User.id}>
                  {selectedDriver.User.name} - {selectedDriver.User.email} (Atual)
                </MenuItem>
              )}
            </Select>
          </FormControl>

          <div style={{ marginTop: '16px' }}>
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
          </div>
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
                <TableCell>Usuário Relacionado</TableCell>
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
                    {driver.User ? (
                      <Chip
                        icon={<Person />}
                        label={`${driver.User.name} (${driver.User.email})`}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    ) : (
                      <Chip
                        label="Nenhum usuário"
                        color="default"
                        variant="outlined"
                        size="small"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handleEdit(driver)}
                      aria-label="editar"
                      title="Editar"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(driver.id)}
                      aria-label="deletar"
                      title="Deletar"
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {filteredDrivers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
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