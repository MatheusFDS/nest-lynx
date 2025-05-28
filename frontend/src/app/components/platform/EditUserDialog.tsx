// components/platform/EditUserDialog.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button,
  CircularProgress, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent
} from '@mui/material';
import { PlatformUser, PlatformUpdateUserDto, PlatformRole } from '../../../services/platformAdmin/userApi';

interface EditUserDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (userId: string, userData: PlatformUpdateUserDto) => Promise<void>;
  user: PlatformUser | null;
  roles: PlatformRole[];
  isLoading?: boolean;
  error?: string | null;
}

const EditUserDialog: React.FC<EditUserDialogProps> = ({ open, onClose, onSubmit, user, roles, isLoading, error }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [formError, setFormError] = useState('');

  const isPlatformAdminUser = user?.tenantId === null;

  useEffect(() => {
    if (user && open) {
      console.log('[EditUserDialog] Dialog aberto para editar usuário:', user);
      setName(user.name);
      setEmail(user.email);
      setSelectedRoleId(user.roleId);
      setPassword('');
      setFormError('');
    }
  }, [user, open]);

  const handleSubmit = async () => {
    if (!user) return;
    console.log('[EditUserDialog] handleSubmit chamado. States atuais:', { name, email, selectedRoleId, password });
    if (!name.trim() || !email.trim() || !selectedRoleId) {
      setFormError('Nome, Email e Role são obrigatórios.');
      console.error('[EditUserDialog] Erro de validação no formulário.');
      return;
    }
    if (password && password.length < 6) {
      setFormError('Nova senha deve ter pelo menos 6 caracteres.');
      console.error('[EditUserDialog] Erro de senha curta.');
      return;
    }
    setFormError('');
    const updatedData: PlatformUpdateUserDto = {
      name,
      email,
      roleId: selectedRoleId,
      password: password || undefined,
    };
    console.log('[EditUserDialog] updatedData para onSubmit:', updatedData);
    await onSubmit(user.id, updatedData);
  };
  
  const handleRoleChange = (e: SelectChangeEvent<string>) => {
    console.log('[EditUserDialog] Role selecionada:', e.target.value);
    setSelectedRoleId(e.target.value);
  };

  const availableRoles = isPlatformAdminUser
    ? roles.filter(role => role.isPlatformRole)
    : roles.filter(role => !role.isPlatformRole);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Editar Usuário: {user?.name}</DialogTitle>
      <DialogContent>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {formError && <p style={{ color: 'red' }}>{formError}</p>}
        <TextField autoFocus margin="dense" name="name" label="Nome Completo" type="text" fullWidth variant="outlined" value={name} onChange={(e) => setName(e.target.value)} required disabled={isLoading} />
        <TextField margin="dense" name="email" label="Email" type="email" fullWidth variant="outlined" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading} />
        
        <FormControl fullWidth margin="dense" required disabled={isLoading}>
          <InputLabel id="role-edit-select-label">Role</InputLabel>
          <Select
            labelId="role-edit-select-label"
            value={selectedRoleId}
            label="Role"
            onChange={handleRoleChange}
          >
            {availableRoles.map((role) => (
              <MenuItem key={role.id} value={role.id}>{role.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField margin="dense" name="password" label="Nova Senha (opcional)" type="password" fullWidth variant="outlined" value={password} onChange={(e) => setPassword(e.target.value)} helperText="Deixe em branco para não alterar a senha" disabled={isLoading} />
        
        {user?.tenant?.name && (
            <TextField
                margin="dense"
                label="Tenant"
                type="text"
                fullWidth
                variant="outlined"
                value={user.tenant.name}
                disabled={true}
            />
        )}
         {isPlatformAdminUser && !user?.tenant?.name && ( // Adicionado !user?.tenant?.name para garantir que não é um user de tenant com tenant nulo por algum motivo
            <TextField
                margin="dense"
                label="Tenant"
                type="text"
                fullWidth
                variant="outlined"
                value="N/A (Usuário da Plataforma)"
                disabled={true}
            />
        )}
      </DialogContent>
      <DialogActions sx={{ p: '16px 24px' }}>
        <Button onClick={onClose} color="secondary" disabled={isLoading}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary" disabled={isLoading}>
          {isLoading ? <CircularProgress size={24} color="inherit" /> : "Salvar Alterações"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditUserDialog;