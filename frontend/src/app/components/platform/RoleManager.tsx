// components/platform/RoleManager.tsx
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext'; // Ajuste o caminho
import {
  Box, Button, Typography, CircularProgress, Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

import {
  fetchPlatformRoles,
  createPlatformRole,
  updatePlatformRole,
  deletePlatformRole,
  PlatformRole,
  PlatformCreateRoleDto,
  PlatformUpdateRoleDto
} from '../../../services/platformAdmin/roleApi'; // Ajuste o caminho

import RoleTable from './RoleTable';
import CreateRoleDialog from './CreateRoleDialog';
import EditRoleDialog from './EditRoleDialog';
import DeleteConfirmDialog from './DeleteConfirmDialog'; // Reutilizando

const RoleManager: React.FC = () => {
  const { token } = useAuth();

  const [roles, setRoles] = useState<PlatformRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [operationError, setOperationError] = useState<string | null>(null);

  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const [currentRoleToEdit, setCurrentRoleToEdit] = useState<PlatformRole | null>(null);
  const [currentRoleToDelete, setCurrentRoleToDelete] = useState<PlatformRole | null>(null);

  const loadRoles = useCallback(async () => {
    if (!token) {
      setError("Não autenticado.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    setOperationError(null);
    try {
      const data = await fetchPlatformRoles(token);
      setRoles(data);
    } catch (err: any) {
      setError(err.message || 'Falha ao carregar roles.');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  const handleOpenCreateDialog = () => {
    setOperationError(null);
    setOpenCreateDialog(true);
  };

  const handleOpenEditDialog = (role: PlatformRole) => {
    setOperationError(null);
    setCurrentRoleToEdit(role);
    setOpenEditDialog(true);
  };

  const handleOpenDeleteDialog = (role: PlatformRole) => {
    setOperationError(null);
    setCurrentRoleToDelete(role);
    setOpenDeleteDialog(true);
  };

  const handleCreateRole = async (roleData: PlatformCreateRoleDto) => {
    if (!token) {
      setOperationError("Não autenticado.");
      return;
    }
    setIsLoading(true);
    setOperationError(null);
    try {
      await createPlatformRole(token, roleData);
      setOpenCreateDialog(false);
      loadRoles();
    } catch (err: any) {
      setOperationError(err.message || 'Falha ao criar role.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditRole = async (roleId: string, roleData: PlatformUpdateRoleDto) => {
    if (!token) {
      setOperationError("Não autenticado.");
      return;
    }
    setIsLoading(true);
    setOperationError(null);
    try {
      await updatePlatformRole(token, roleId, roleData);
      setOpenEditDialog(false);
      setCurrentRoleToEdit(null);
      loadRoles();
    } catch (err: any) {
      setOperationError(err.message || 'Falha ao atualizar role.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRole = async () => {
    if (!token || !currentRoleToDelete) {
      setOperationError("Não autenticado ou role não selecionada.");
      return;
    }
    setIsLoading(true);
    setOperationError(null);
    try {
      await deletePlatformRole(token, currentRoleToDelete.id);
      setOpenDeleteDialog(false);
      setCurrentRoleToDelete(null);
      loadRoles();
    } catch (err: any) {
      setOperationError(err.message || 'Falha ao deletar role.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && roles.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && roles.length === 0) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} mt={2}>
        <Typography variant="h5" component="h2">
          Gerenciar Roles
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateDialog}
        >
          Nova Role
        </Button>
      </Box>
      
      {operationError && <Alert severity="error" sx={{ mb: 2 }}>{operationError}</Alert>}
      
      <RoleTable
        roles={roles}
        onEdit={handleOpenEditDialog}
        onDelete={handleOpenDeleteDialog}
        isLoading={isLoading && roles.length > 0}
      />

      <CreateRoleDialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        onSubmit={handleCreateRole}
        isLoading={isLoading}
        error={operationError}
      />

      {currentRoleToEdit && (
        <EditRoleDialog
          open={openEditDialog}
          onClose={() => { setOpenEditDialog(false); setCurrentRoleToEdit(null); }}
          onSubmit={handleEditRole}
          role={currentRoleToEdit}
          isLoading={isLoading}
          error={operationError}
        />
      )}

      {currentRoleToDelete && (
        <DeleteConfirmDialog
          open={openDeleteDialog}
          onClose={() => { setOpenDeleteDialog(false); setCurrentRoleToDelete(null); }}
          onConfirm={handleDeleteRole}
          itemName={currentRoleToDelete?.name}
          isLoading={isLoading}
          error={operationError}
        />
      )}
    </Box>
  );
};

export default RoleManager;