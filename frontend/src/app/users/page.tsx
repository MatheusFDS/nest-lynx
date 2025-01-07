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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { User, Role } from '../../types';
import SkeletonLoader from '../components/SkeletonLoader';
import { useLoading } from '../context/LoadingContext';
import { fetchUsers, addUser, updateUser, deleteUser, fetchRoles } from '../../services/userService';
import withAuth from '../hoc/withAuth';

const UsersPage: React.FC = () => {
  const { setLoading, isLoading } = useLoading();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [newUser, setNewUser] = useState<Partial<User>>({});
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

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
  const loadUsers = async () => {
    setLoading(true);
    try {
      const users = await fetchUsers(token);
      setUsers(Array.isArray(users) ? users : []);
    } catch (error) {
      setError('Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  // Função para carregar roles
  const loadRoles = async () => {
    try {
      const roles = await fetchRoles(token);
      setRoles(Array.isArray(roles) ? roles : []);
    } catch (error) {
      setError('Failed to fetch roles.');
    }
  };

  useEffect(() => {
    loadUsers();
    loadRoles();
  }, [token]);

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
      setError('Invalid tenantId');
      return;
    }

    const userToSave = { ...newUser, tenantId } as User;

    try {
      if (selectedUser) {
        await updateUser(token, selectedUser.id, userToSave);
      } else {
        await addUser(token, userToSave);
      }
      setNewUser({});
      setSelectedUser(null);
      setShowForm(false);
      loadUsers();
    } catch (error) {
      setError('Failed to submit user.');
    }
  };

  // Manipulador de edição
  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setNewUser(user);
    setShowForm(true);
  };

  // Manipulador de exclusão
  const handleDelete = async (id: string) => {
    try {
      await deleteUser(token, id);
      loadUsers();
    } catch (error) {
      setError('Failed to delete user.');
    }
  };

  // Manipulador de fechamento do formulário
  const handleFormClose = () => {
    setSelectedUser(null);
    setNewUser({});
    setShowForm(false);
  };

  return (
    <Container>
      {error && <Typography color="error">{error}</Typography>}
      <TextField
        label="Search Users"
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
          <Button variant="contained" color="primary" onClick={handleAddOrUpdateUser}>
            {selectedUser ? 'Atualizar Usuário' : 'Adicionar Usuário'}
          </Button>
          <Button onClick={handleFormClose}>Cancelar</Button>
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
                <TableCell>Tipo</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{roles.find(role => role.id === user.roleId)?.name || 'No Role'}</TableCell>
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
