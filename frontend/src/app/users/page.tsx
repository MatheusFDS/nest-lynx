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
  FormControl,
  InputLabel,
  Box,
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { User, Role } from '../../types';
import SkeletonLoader from '../components/SkeletonLoader';
import { useLoading } from '../context/LoadingContext';
import { fetchUsers, addUser, updateUser, deleteUser, fetchRoles } from '../../services/userService';
import withAuth from '../hoc/withAuth';
import { useMessage } from '../context/MessageContext'; // Importar o contexto de mensagens

const UsersPage: React.FC = () => {
  const { setLoading, isLoading } = useLoading();
  const { showMessage } = useMessage(); // Hook para mensagens
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [newUser, setNewUser] = useState<Partial<User>>({});
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);

  const token = localStorage.getItem('token') || '';

  // Função para extrair o tenantId do token
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

  // Função para carregar usuários
  const loadUsers = useCallback(async () => {
    if (!token) {
      showMessage('Token de autenticação não encontrado.', 'error'); // Mensagem de erro
      return;
    }

    setLoading(true);
    try {
      const fetchedUsers = await fetchUsers(token);
      setUsers(Array.isArray(fetchedUsers) ? fetchedUsers : []);
      //showMessage('Usuários carregados com sucesso.', 'success'); // Mensagem de sucesso
    } catch (error: unknown) {
      console.error('Failed to fetch users:', error);
      showMessage('Falha ao carregar usuários.', 'error'); // Mensagem de erro
    } finally {
      setLoading(false);
    }
  }, [token, setLoading, showMessage]);

  // Função para carregar roles
  const loadRoles = useCallback(async () => {
    if (!token) {
      showMessage('Token de autenticação não encontrado.', 'error'); // Mensagem de erro
      return;
    }

    setLoading(true);
    try {
      const fetchedRoles = await fetchRoles(token);
      setRoles(Array.isArray(fetchedRoles) ? fetchedRoles : []);
      showMessage('Roles carregados com sucesso.', 'success'); // Mensagem de sucesso
    } catch (error: unknown) {
      console.error('Failed to fetch roles:', error);
      showMessage('Falha ao carregar roles.', 'error'); // Mensagem de erro
    } finally {
      setLoading(false);
    }
  }, [token, setLoading, showMessage]);

  useEffect(() => {
    loadUsers();
    loadRoles();
  }, [loadUsers, loadRoles]);

  // Manipulador de busca
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Filtra usuários com base na busca
  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Manipulador de adicionar ou atualizar usuário
  const handleAddOrUpdateUser = async () => {
    if (!tenantId) {
      showMessage('tenantId inválido.', 'error'); // Mensagem de erro
      return;
    }

    const userToSave = { ...newUser, tenantId } as User;

    try {
      if (selectedUser) {
        await updateUser(token, selectedUser.id, userToSave);
        showMessage('Usuário atualizado com sucesso.', 'success'); // Mensagem de sucesso
      } else {
        await addUser(token, userToSave);
        showMessage('Usuário adicionado com sucesso.', 'success'); // Mensagem de sucesso
      }
      setNewUser({});
      setSelectedUser(null);
      setShowForm(false);
      loadUsers();
    } catch (error: unknown) {
      console.error('Failed to submit user:', error);
      showMessage('Falha ao submeter usuário.', 'error'); // Mensagem de erro
    }
  };

  // Manipulador de edição
  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setNewUser(user);
    setShowForm(true);
    showMessage(`Editando o usuário: ${user.email}`, 'info'); // Mensagem informativa
  };

  // Manipulador de exclusão
  const handleDelete = async (id: string) => {
    try {
      await deleteUser(token, id);
      showMessage('Usuário deletado com sucesso.', 'success'); // Mensagem de sucesso
      loadUsers();
    } catch (error: unknown) {
      console.error('Failed to delete user:', error);
      showMessage('Falha ao deletar usuário.', 'error'); // Mensagem de erro
    }
  };

  // Manipulador de fechamento do formulário
  const handleFormClose = () => {
    setSelectedUser(null);
    setNewUser({});
    setShowForm(false);
    showMessage('Formulário fechado.', 'info'); // Mensagem informativa
  };

  return (
    <Container>
      {/* Removido: Exibição de mensagens de erro diretamente no JSX */}
      {/* {error && <Typography color="error">{error}</Typography>} */}

      <TextField
        label="Buscar Usuários"
        value={searchTerm}
        onChange={handleSearch}
        fullWidth
        margin="normal"
      />
      <Button variant="contained" color="primary" onClick={() => setShowForm(true)}>
        Adicionar Usuário
      </Button>
      {showForm && (
        <Paper elevation={3} style={{ padding: '16px', marginTop: '16px' }}>
          <Typography variant="h6">{selectedUser ? 'Atualizar Usuário' : 'Adicionar Usuário'}</Typography>
          <TextField
            label="Email"
            value={newUser.email || ''}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Senha"
            value={newUser.password || ''}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            type="password"
            fullWidth
            margin="normal"
          />
          <TextField
            label="Nome"
            value={newUser.name || ''}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            fullWidth
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Tipo</InputLabel>
            <Select
              value={newUser.roleId || ''}
              onChange={(e) => setNewUser({ ...newUser, roleId: e.target.value })}
            >
              {roles.map((role) => (
                <MenuItem key={role.id} value={role.id}>
                  {role.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box style={{ marginTop: '16px' }}>
            <Button variant="contained" color="primary" onClick={handleAddOrUpdateUser}>
              {selectedUser ? 'Atualizar Usuário' : 'Adicionar Usuário'}
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
      <TableContainer component={Paper} style={{ marginTop: '16px' }}>
        {isLoading ? (
          <SkeletonLoader />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Email</TableCell>
                <TableCell>Nome</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{roles.find(role => role.id === user.roleId)?.name || 'Sem Role'}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(user)}>
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(user.id)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </TableContainer>
    </Container>
  );
};

export default withAuth(UsersPage, { requiredRole: 'admin' });
