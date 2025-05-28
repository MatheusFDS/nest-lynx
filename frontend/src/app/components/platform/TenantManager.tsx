// components/platform/TenantManager.tsx
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext'; // Ajuste o caminho
import {
  Box, Button, Typography, CircularProgress, Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import {
  fetchPlatformTenants,
  createPlatformTenant,
  updatePlatformTenant,
  deletePlatformTenant,
  Tenant,
  PlatformCreateTenantDto,
  PlatformUpdateTenantDto
} from '../../../services/platformAdmin/tenantApi'; // Ajuste o caminho

import TenantTable from './TenantTable';
import CreateTenantDialog from './CreateTenantDialog';
import EditTenantDialog from './EditTenantDialog';
import DeleteConfirmDialog from './DeleteConfirmDialog';

const TenantManager: React.FC = () => {
  const { token } = useAuth(); // Apenas o token para as chamadas de API

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [operationError, setOperationError] = useState<string | null>(null);


  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteConfirmDialog, setOpenDeleteConfirmDialog] = useState(false);

  const [currentTenantToEdit, setCurrentTenantToEdit] = useState<Tenant | null>(null);
  const [currentTenantToDelete, setCurrentTenantToDelete] = useState<Tenant | null>(null);

  const loadTenants = useCallback(async () => {
    if (token) {
      setIsLoading(true);
      setError(null);
      setOperationError(null);
      try {
        const data = await fetchPlatformTenants(token);
        setTenants(data);
      } catch (err: any) {
        setError(err.message || 'Falha ao carregar tenants.');
      } finally {
        setIsLoading(false);
      }
    } else {
      setError('Token de autenticação não encontrado.');
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadTenants();
  }, [loadTenants]);

  const handleOpenCreateDialog = () => {
    setOperationError(null);
    setOpenCreateDialog(true);
  };

  const handleOpenEditDialog = (tenant: Tenant) => {
    setOperationError(null);
    setCurrentTenantToEdit(tenant);
    setOpenEditDialog(true);
  };

  const handleOpenDeleteDialog = (tenant: Tenant) => {
    setOperationError(null);
    setCurrentTenantToDelete(tenant);
    setOpenDeleteConfirmDialog(true);
  };

  const handleCreateTenant = async (tenantData: PlatformCreateTenantDto) => {
    if (!token) {
      setOperationError("Não autenticado.");
      return;
    }
    setIsLoading(true);
    setOperationError(null);
    try {
      await createPlatformTenant(token, tenantData);
      setOpenCreateDialog(false);
      loadTenants();
    } catch (err: any) {
      setOperationError(err.message || 'Falha ao criar tenant.');
      // Não feche o diálogo em caso de erro para o usuário corrigir
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditTenant = async (tenantId: string, tenantData: PlatformUpdateTenantDto) => {
    if (!token) {
      setOperationError("Não autenticado.");
      return;
    }
    setIsLoading(true);
    setOperationError(null);
    try {
      await updatePlatformTenant(token, tenantId, tenantData);
      setOpenEditDialog(false);
      setCurrentTenantToEdit(null);
      loadTenants();
    } catch (err: any) {
      setOperationError(err.message || 'Falha ao atualizar tenant.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTenant = async () => {
    if (!token || !currentTenantToDelete) {
      setOperationError("Não autenticado ou tenant não selecionado.");
      return;
    }
    setIsLoading(true);
    setOperationError(null);
    try {
      await deletePlatformTenant(token, currentTenantToDelete.id);
      setOpenDeleteConfirmDialog(false);
      setCurrentTenantToDelete(null);
      loadTenants();
    } catch (err: any) {
      setOperationError(err.message || 'Falha ao deletar tenant.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && tenants.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && tenants.length === 0) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} mt={2}>
        <Typography variant="h5" component="h2">
          Gerenciar Tenants
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateDialog}
        >
          Novo Tenant
        </Button>
      </Box>

      {error && !tenants.length && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}
      
      <TenantTable
        tenants={tenants}
        onEdit={handleOpenEditDialog}
        onDelete={handleOpenDeleteDialog}
        isLoading={isLoading && tenants.length > 0}
      />

      <CreateTenantDialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        onSubmit={handleCreateTenant}
        isLoading={isLoading}
        error={operationError}
      />

      {currentTenantToEdit && (
        <EditTenantDialog
          open={openEditDialog}
          onClose={() => { setOpenEditDialog(false); setCurrentTenantToEdit(null);}}
          onSubmit={handleEditTenant}
          tenant={currentTenantToEdit}
          isLoading={isLoading}
          error={operationError}
        />
      )}

      {currentTenantToDelete && (
        <DeleteConfirmDialog
          open={openDeleteConfirmDialog}
          onClose={() => { setOpenDeleteConfirmDialog(false); setCurrentTenantToDelete(null);}}
          onConfirm={handleDeleteTenant}
          itemName={currentTenantToDelete?.name}
          isLoading={isLoading}
          error={operationError}
        />
      )}
    </Box>
  );
};

export default TenantManager;