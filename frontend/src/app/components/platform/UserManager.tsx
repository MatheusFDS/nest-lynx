// components/platform/UserManager.tsx
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext'; // Ajuste o caminho
import {
  Box, Button, Typography, CircularProgress, Alert,
  Tabs, Tab, Select, MenuItem, FormControl, InputLabel, SelectChangeEvent, Paper
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PeopleIcon from '@mui/icons-material/People';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

import {
  fetchPlatformUsers,
  createPlatformAdminUserOnPlatform,
  createTenantUserOnPlatform,
  updateUserByPlatformAdmin,
  deleteUserByPlatformAdmin,
  PlatformUser,
  PlatformCreateUserDto,
  PlatformUpdateUserDto,
  PlatformRole,
  PlatformTenant,
} from '../../../services/platformAdmin/userApi'; // Ajuste o caminho
import { fetchPlatformTenants } from '../../../services/platformAdmin/tenantApi';
import { fetchPlatformRoles } from '../../../services/platformAdmin/roleApi';

import UserTable from './UserTable'; // Seu UserTable.tsx que já está correto
import CreateUserDialog from './CreateUserDialog';
import EditUserDialog from './EditUserDialog';
import DeleteConfirmDialog from './DeleteConfirmDialog';

type UserViewMode = 'platformAdmins' | 'tenantUsers';

const UserManager: React.FC = () => {
  const { token } = useAuth();

  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [allRoles, setAllRoles] = useState<PlatformRole[]>([]);
  const [allTenants, setAllTenants] = useState<PlatformTenant[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [operationError, setOperationError] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<UserViewMode>('platformAdmins');
  const [selectedTenantFilter, setSelectedTenantFilter] = useState<string>('');

  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const [currentUserToEdit, setCurrentUserToEdit] = useState<PlatformUser | null>(null);
  const [currentUserToDelete, setCurrentUserToDelete] = useState<PlatformUser | null>(null);

  const loadInitialData = useCallback(async () => {
    console.log('[UserManager] loadInitialData chamado.');
    if (!token) {
        setError("Não autenticado para carregar dados iniciais.");
        setIsLoading(false);
        console.warn('[UserManager] Token não encontrado em loadInitialData.');
        return;
    }
    setIsLoading(true);
    setError(null);
    try {
      console.log('[UserManager] Buscando roles e tenants...');
      const rolesData = await fetchPlatformRoles(token);
      setAllRoles(rolesData);
      console.log('[UserManager] Roles carregadas:', rolesData.length);

      const tenantsData = await fetchPlatformTenants(token);
      setAllTenants(tenantsData);
      console.log('[UserManager] Tenants carregados:', tenantsData.length);
      
      console.log('[UserManager] Buscando usuários da plataforma (inicial)...');
      const usersData = await fetchPlatformUsers(token); 
      setUsers(usersData);
      console.log('[UserManager] Usuários da plataforma (inicial) carregados:', usersData.length);

    } catch (err: any) {
      console.error('[UserManager] Erro em loadInitialData:', err);
      setError(err.message || 'Falha ao carregar dados iniciais.');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const loadUsersByFilter = useCallback(async () => {
    if (!token) {
        console.warn('[UserManager] Token não encontrado em loadUsersByFilter.');
        return;
    }
    console.log(`[UserManager] loadUsersByFilter chamado. viewMode: ${viewMode}, selectedTenantFilter: ${selectedTenantFilter}`);
    setIsLoading(true);
    setError(null);
    try {
      let usersData: PlatformUser[];
      if (viewMode === 'tenantUsers' && selectedTenantFilter) {
        console.log(`[UserManager] Buscando usuários para tenantId: ${selectedTenantFilter}`);
        usersData = await fetchPlatformUsers(token, selectedTenantFilter);
      } else if (viewMode === 'platformAdmins') {
        console.log('[UserManager] Buscando administradores da plataforma.');
        usersData = await fetchPlatformUsers(token);
      } else {
        usersData = viewMode === 'tenantUsers' ? [] : await fetchPlatformUsers(token);
        console.log('[UserManager] Condição de filtro não atendida, usersData:', usersData.length);
      }
      setUsers(usersData);
      console.log('[UserManager] Usuários carregados por filtro:', usersData.length);
    } catch (err: any) {
      console.error('[UserManager] Erro em loadUsersByFilter:', err);
      setError(err.message || `Falha ao carregar usuários.`);
    } finally {
      setIsLoading(false);
    }
  }, [token, viewMode, selectedTenantFilter]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    if(token && (allRoles.length > 0 || allTenants.length > 0)){ 
        console.log('[UserManager] useEffect para loadUsersByFilter disparado por viewMode ou selectedTenantFilter.');
        loadUsersByFilter();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode, selectedTenantFilter, token]); // Removido loadUsersByFilter daqui para evitar loop, já que ele mesmo depende de token. allRoles/Tenants asseguram que dados base foram carregados.


  const handleViewModeChange = (event: React.SyntheticEvent, newValue: UserViewMode) => {
    console.log('[UserManager] Mudança de viewMode para:', newValue);
    setViewMode(newValue);
    setSelectedTenantFilter('');
    setUsers([]); 
  };

  const handleTenantFilterChange = (event: SelectChangeEvent<string>) => {
    console.log('[UserManager] Filtro de tenant alterado para:', event.target.value);
    setSelectedTenantFilter(event.target.value as string);
    setUsers([]);
  };

  const handleOpenCreateDialog = () => {
    console.log('[UserManager] Abrindo diálogo de criação de usuário.');
    setOperationError(null);
    setOpenCreateDialog(true);
  };

  const handleOpenEditDialog = (user: PlatformUser) => {
    console.log('[UserManager] Abrindo diálogo de edição para usuário:', user.id);
    setOperationError(null);
    setCurrentUserToEdit(user);
    setOpenEditDialog(true);
  };

  const handleOpenDeleteDialog = (user: PlatformUser) => {
    console.log('[UserManager] Abrindo diálogo de deleção para usuário:', user.id);
    setOperationError(null);
    setCurrentUserToDelete(user);
    setOpenDeleteDialog(true);
  };

  const handleCreateUser = async (userData: PlatformCreateUserDto, tenantId?: string, isPlatformAdmin?: boolean) => {
    if (!token) {
        setOperationError("Não autenticado.");
        console.error('[UserManager] Token não encontrado em handleCreateUser.');
        return;
    }
    setIsLoading(true);
    setOperationError(null);
    console.log('[UserManager] handleCreateUser - isPlatformAdmin:', isPlatformAdmin, 'tenantId:', tenantId, 'userData:', userData);
    try {
      if (isPlatformAdmin) {
        await createPlatformAdminUserOnPlatform(token, userData);
        console.log('[UserManager] Usuário admin da plataforma criado.');
      } else if (tenantId) {
        await createTenantUserOnPlatform(token, userData, tenantId);
        console.log('[UserManager] Usuário de tenant criado.');
      } else {
        console.error("[UserManager] Tentativa de criar usuário de tenant sem tenantId válido.");
        throw new Error("Tenant ID é inválido ou não fornecido para criar usuário de tenant.");
      }
      setOpenCreateDialog(false);
      loadUsersByFilter(); 
    } catch (err: any) {
      console.error('[UserManager] Erro em handleCreateUser:', err);
      setOperationError(err.message || 'Falha ao criar usuário.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditUser = async (userId: string, userData: PlatformUpdateUserDto) => {
    if (!token) {
        setOperationError("Não autenticado.");
        console.error('[UserManager] Token não encontrado em handleEditUser.');
        return;
    }
    setIsLoading(true);
    setOperationError(null);
    console.log('[UserManager] handleEditUser - userId:', userId, 'userData:', userData);
    try {
      await updateUserByPlatformAdmin(token, userId, userData);
      console.log('[UserManager] Usuário atualizado.');
      setOpenEditDialog(false);
      setCurrentUserToEdit(null);
      loadUsersByFilter();
    } catch (err: any) {
      console.error('[UserManager] Erro em handleEditUser:', err);
      setOperationError(err.message || 'Falha ao atualizar usuário.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!token || !currentUserToDelete) {
        setOperationError("Não autenticado ou usuário não selecionado.");
        console.error('[UserManager] Token ou currentUserToDelete não encontrado em handleDeleteUser.');
        return;
    }
    setIsLoading(true);
    setOperationError(null);
    console.log('[UserManager] handleDeleteUser - userId:', currentUserToDelete.id);
    try {
      await deleteUserByPlatformAdmin(token, currentUserToDelete.id);
      console.log('[UserManager] Usuário deletado.');
      setOpenDeleteDialog(false);
      setCurrentUserToDelete(null);
      loadUsersByFilter();
    } catch (err: any) {
      console.error('[UserManager] Erro em handleDeleteUser:', err);
      setOperationError(err.message || 'Falha ao deletar usuário.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !allRoles.length && !allTenants.length && !users.length) {
    return <Box display="flex" justifyContent="center" alignItems="center" p={3}><CircularProgress /></Box>;
  }

  if (error && !users.length && !isLoading) { // Mostra erro principal se não houver usuários e não estiver carregando
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} mt={2}>
        <Typography variant="h5" component="h2">
          Gerenciar Usuários
        </Typography>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpenCreateDialog}>
          Novo Usuário
        </Button>
      </Box>

      <Paper elevation={1} sx={{ mb: 2 }}>
        <Tabs value={viewMode} onChange={handleViewModeChange} indicatorColor="primary" textColor="primary">
          <Tab icon={<AdminPanelSettingsIcon />} iconPosition="start" label="Administradores da Plataforma" value="platformAdmins" />
          <Tab icon={<PeopleIcon />} iconPosition="start" label="Usuários de Tenant" value="tenantUsers" />
        </Tabs>
        {viewMode === 'tenantUsers' && (
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <FormControl fullWidth size="small" disabled={isLoading || allTenants.length === 0}>
              <InputLabel id="tenant-filter-label">Filtrar por Tenant</InputLabel>
              <Select
                labelId="tenant-filter-label"
                value={selectedTenantFilter}
                label="Filtrar por Tenant"
                onChange={handleTenantFilterChange}
              >
                <MenuItem value="">
                  <em>{allTenants.length === 0 ? "Nenhum tenant disponível" : "Selecione um Tenant"}</em>
                </MenuItem>
                {allTenants.map(tenant => (
                  <MenuItem key={tenant.id} value={tenant.id}>{tenant.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}
      </Paper>
      
      {operationError && <Alert severity="error" sx={{ mb: 2 }}>{operationError}</Alert>}
      {error && viewMode === 'tenantUsers' && !selectedTenantFilter && <Alert severity="info" sx={{mb:2}}>Selecione um tenant para listar seus usuários.</Alert>}


      <UserTable
        users={users}
        onEdit={handleOpenEditDialog}
        onDelete={handleOpenDeleteDialog}
        isLoading={isLoading && users.length > 0} 
      />

      <CreateUserDialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        onSubmit={handleCreateUser}
        roles={allRoles}
        tenants={allTenants}
        isLoading={isLoading} // Passa o isLoading geral para os diálogos
        error={operationError}
      />

      {currentUserToEdit && (
        <EditUserDialog
          open={openEditDialog}
          onClose={() => {setOpenEditDialog(false); setCurrentUserToEdit(null);}}
          onSubmit={handleEditUser}
          user={currentUserToEdit}
          roles={allRoles}
          isLoading={isLoading}
          error={operationError}
        />
      )}

      {currentUserToDelete && (
        <DeleteConfirmDialog
          open={openDeleteDialog}
          onClose={() => {setOpenDeleteDialog(false); setCurrentUserToDelete(null);}}
          onConfirm={handleDeleteUser}
          itemName={currentUserToDelete?.name}
          isLoading={isLoading}
          error={operationError}
        />
      )}
    </Box>
  );
};

export default UserManager;