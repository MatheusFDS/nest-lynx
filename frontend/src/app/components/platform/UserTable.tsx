// components/platform/UserTable.tsx
'use client';

import React from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Typography, Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { PlatformUser } from '../../../services/platformAdmin/userApi'; // Ajuste o caminho

interface UserTableProps {
  users: PlatformUser[];
  onEdit: (user: PlatformUser) => void;
  onDelete: (user: PlatformUser) => void;
  isLoading?: boolean;
}

const UserTable: React.FC<UserTableProps> = ({ users, onEdit, onDelete, isLoading }) => {
  if (isLoading && (!users || users.length === 0)) {
    return <Typography sx={{ p: 2, textAlign: 'center' }}>Carregando usuários...</Typography>;
  }

  if (!isLoading && (!users || users.length === 0)) {
    return <Typography sx={{ p: 2, textAlign: 'center' }}>Nenhum usuário encontrado.</Typography>;
  }

  return (
    <TableContainer component={Paper} elevation={2}>
      <Table sx={{ minWidth: 650 }} aria-label="tabela de usuários">
        <TableHead sx={{ backgroundColor: 'grey.200' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>Nome</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Role</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Tenant</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Criado Em</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow
              key={user.id}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              hover
            >
              <TableCell component="th" scope="row">
                {user.name}
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                {user.role ? (
                  <Chip label={user.role.name} size="small" color={user.role.isPlatformRole ? "secondary" : "primary"} />
                ) : user.roleId}
              </TableCell>
              <TableCell>{user.tenant?.name || (user.role?.isPlatformRole ? 'N/A (Plataforma)' : '-')}</TableCell>
              <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
              <TableCell align="right">
                <IconButton onClick={() => onEdit(user)} color="primary" aria-label="editar usuário">
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => onDelete(user)} color="error" aria-label="deletar usuário">
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default UserTable;