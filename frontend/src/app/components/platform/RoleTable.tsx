// components/platform/RoleTable.tsx
'use client';

import React from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Typography, Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { PlatformRole } from '../../../services/platformAdmin/roleApi'; // Ajuste o caminho

interface RoleTableProps {
  roles: PlatformRole[];
  onEdit: (role: PlatformRole) => void;
  onDelete: (role: PlatformRole) => void;
  isLoading?: boolean;
}

const RoleTable: React.FC<RoleTableProps> = ({ roles, onEdit, onDelete, isLoading }) => {
  if (isLoading && (!roles || roles.length === 0)) {
    return <Typography sx={{ p: 2, textAlign: 'center' }}>Carregando roles...</Typography>;
  }

  if (!isLoading && (!roles || roles.length === 0)) {
    return <Typography sx={{ p: 2, textAlign: 'center' }}>Nenhuma role encontrada.</Typography>;
  }

  return (
    <TableContainer component={Paper} elevation={2}>
      <Table sx={{ minWidth: 650 }} aria-label="tabela de roles">
        <TableHead sx={{ backgroundColor: 'grey.200' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>Nome</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Descrição</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }} align="center">Role da Plataforma?</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Criada Em</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {roles.map((role) => (
            <TableRow
              key={role.id}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              hover
            >
              <TableCell component="th" scope="row">
                {role.name}
              </TableCell>
              <TableCell>{role.description || '-'}</TableCell>
              <TableCell align="center">
                {role.isPlatformRole ? 
                  <Chip icon={<CheckCircleOutlineIcon />} label="Sim" color="secondary" size="small" variant="outlined" /> :
                  <Chip icon={<HighlightOffIcon />} label="Não" color="default" size="small" variant="outlined" />
                }
              </TableCell>
              <TableCell>{role.createdAt ? new Date(role.createdAt).toLocaleDateString() : '-'}</TableCell>
              <TableCell align="right">
                <IconButton onClick={() => onEdit(role)} color="primary" aria-label="editar role">
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => onDelete(role)} color="error" aria-label="deletar role">
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

export default RoleTable;