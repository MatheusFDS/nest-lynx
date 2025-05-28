// components/platform/CreateUserDialog.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button,
  CircularProgress, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent, Box, Switch, FormControlLabel
} from '@mui/material';
import { PlatformCreateUserDto, PlatformRole, PlatformTenant } from '../../../services/platformAdmin/userApi';

interface CreateUserDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (userData: PlatformCreateUserDto, tenantId?: string, isPlatformAdmin?: boolean) => Promise<void>;
  roles: PlatformRole[];
  tenants?: PlatformTenant[];
  isLoading?: boolean;
  error?: string | null;
}

const CreateUserDialog: React.FC<CreateUserDialogProps> = ({
  open, onClose, onSubmit, roles, tenants, isLoading, error
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [isPlatformAdminUser, setIsPlatformAdminUser] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (open) {
      console.log('[CreateUserDialog] Dialog aberto. Resetando formulário.');
      setEmail('');
      setPassword('');
      setName('');
      setSelectedRoleId('');
      setSelectedTenantId('');
      setIsPlatformAdminUser(false);
      setFormError('');
    }
  }, [open]);

  const handleSubmit = async () => {
    console.log('[CreateUserDialog] handleSubmit chamado. States atuais:', { name, email, selectedRoleId, isPlatformAdminUser, selectedTenantId, password });
    if (!name.trim() || !email.trim() || !selectedRoleId || (!isPlatformAdminUser && !selectedTenantId)) {
      setFormError('Todos os campos obrigatórios devem ser preenchidos.');
      console.error('[CreateUserDialog] Erro de validação no formulário. Dados:', { name, email, selectedRoleId, isPlatformAdminUser, selectedTenantId });
      return;
    }
    if (isPlatformAdminUser && password.length < 6) {
        setFormError('Senha deve ter pelo menos 6 caracteres para admin da plataforma.');
        console.error('[CreateUserDialog] Erro de senha curta para admin da plataforma.');
        return;
    }

    setFormError('');
    const userData: PlatformCreateUserDto = { name, email, password: password || undefined, roleId: selectedRoleId };
    
    console.log('[CreateUserDialog] userData para onSubmit:', userData);
    console.log('[CreateUserDialog] selectedTenantId para onSubmit:', selectedTenantId);
    console.log('[CreateUserDialog] isPlatformAdminUser para onSubmit:', isPlatformAdminUser);

    await onSubmit(userData, isPlatformAdminUser ? undefined : selectedTenantId, isPlatformAdminUser);
  };

  const handleIsPlatformAdminChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('[CreateUserDialog] Switch isPlatformAdminUser alterado para:', e.target.checked);
    setIsPlatformAdminUser(e.target.checked);
    setSelectedRoleId(''); 
    setSelectedTenantId('');
  };

  const handleRoleChange = (e: SelectChangeEvent<string>) => {
    console.log('[CreateUserDialog] Role selecionada:', e.target.value);
    setSelectedRoleId(e.target.value);
  };

  const handleTenantChange = (e: SelectChangeEvent<string>) => {
    console.log('[CreateUserDialog] Tenant selecionado:', e.target.value);
    setSelectedTenantId(e.target.value);
  };

  const availableRoles = isPlatformAdminUser
    ? roles.filter(role => role.isPlatformRole)
    : roles.filter(role => !role.isPlatformRole);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Criar Novo Usuário</DialogTitle>
      <DialogContent>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {formError && <p style={{ color: 'red' }}>{formError}</p>}
        <Box sx={{ mb: 2, mt: 1}}>
          <FormControlLabel
            control={
              <Switch
                checked={isPlatformAdminUser}
                onChange={handleIsPlatformAdminChange}
                disabled={isLoading}
              />
            }
            label="Este é um Administrador da Plataforma?"
          />
        </Box>
        <TextField autoFocus margin="dense" name="name" label="Nome Completo" type="text" fullWidth variant="outlined" value={name} onChange={(e) => setName(e.target.value)} required disabled={isLoading} />
        <TextField margin="dense" name="email" label="Email" type="email" fullWidth variant="outlined" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading} />
        <TextField margin="dense" name="password" label="Senha (mín. 6 caracteres)" type="password" fullWidth variant="outlined" value={password} onChange={(e) => setPassword(e.target.value)} required={isPlatformAdminUser} helperText={!isPlatformAdminUser ? "Opcional para usuários de tenant (será gerada uma se vazia)" : ""} disabled={isLoading} />
        
        <FormControl fullWidth margin="dense" required disabled={isLoading}>
          <InputLabel id="role-select-label">Role</InputLabel>
          <Select
            labelId="role-select-label"
            value={selectedRoleId}
            label="Role"
            onChange={handleRoleChange}
          >
            {availableRoles.map((role) => (
              <MenuItem key={role.id} value={role.id}>{role.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {!isPlatformAdminUser && tenants && (
          <FormControl fullWidth margin="dense" required disabled={isLoading}>
            <InputLabel id="tenant-select-label">Tenant</InputLabel>
            <Select
              labelId="tenant-select-label"
              value={selectedTenantId}
              label="Tenant"
              onChange={handleTenantChange}
            >
              {tenants.map((tenant) => (
                <MenuItem key={tenant.id} value={tenant.id}>{tenant.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </DialogContent>
      <DialogActions sx={{ p: '16px 24px' }}>
        <Button onClick={onClose} color="secondary" disabled={isLoading}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary" disabled={isLoading}>
          {isLoading ? <CircularProgress size={24} color="inherit" /> : "Criar Usuário"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateUserDialog;