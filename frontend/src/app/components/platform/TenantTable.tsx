// components/platform/TenantTable.tsx
'use client';

import React from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Typography
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Tenant } from '../../../services/platformAdmin/tenantApi';

interface TenantTableProps {
  tenants: Tenant[];
  onEdit: (tenant: Tenant) => void;
  onDelete: (tenant: Tenant) => void;
  isLoading?: boolean;
}

const TenantTable: React.FC<TenantTableProps> = ({ tenants, onEdit, onDelete, isLoading }) => {
  if (isLoading && (!tenants || tenants.length === 0)) {
    return <Typography sx={{ p: 2, textAlign: 'center' }}>Carregando tenants...</Typography>;
  }

  if (!isLoading && (!tenants || tenants.length === 0)) {
    return <Typography sx={{ p: 2, textAlign: 'center' }}>Nenhum tenant encontrado.</Typography>;
  }

  return (
    <TableContainer component={Paper} elevation={2}>
      <Table sx={{ minWidth: 650 }} aria-label="tabela de tenants">
        <TableHead sx={{ backgroundColor: 'grey.200' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>Nome</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Endereço</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Criado Em</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tenants.map((tenant) => (
            <TableRow
              key={tenant.id}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              hover
            >
              <TableCell component="th" scope="row">
                {tenant.name}
              </TableCell>
              <TableCell>{tenant.address || '-'}</TableCell>
              <TableCell>{new Date(tenant.createdAt).toLocaleDateString()}</TableCell>
              <TableCell align="right">
                <IconButton onClick={() => onEdit(tenant)} color="primary" aria-label="editar tenant">
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => onDelete(tenant)} color="error" aria-label="deletar tenant">
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

export default TenantTable;