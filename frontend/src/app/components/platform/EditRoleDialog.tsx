// components/platform/EditRoleDialog.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogActions, DialogContent, DialogTitle,
  TextField, Button, CircularProgress, Switch, FormControlLabel
} from '@mui/material';
import { PlatformRole, PlatformUpdateRoleDto } from '../../../services/platformAdmin/roleApi'; // Ajuste o caminho

interface EditRoleDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (roleId: string, roleData: PlatformUpdateRoleDto) => Promise<void>;
  role: PlatformRole | null;
  isLoading?: boolean;
  error?: string | null;
}

const EditRoleDialog: React.FC<EditRoleDialogProps> = ({ open, onClose, onSubmit, role, isLoading, error }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPlatformRole, setIsPlatformRole] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (role && open) {
      setName(role.name);
      setDescription(role.description || '');
      setIsPlatformRole(role.isPlatformRole);
      setFormError('');
    }
  }, [role, open]);

  const handleSubmit = async () => {
    if (!role) return;
    if (!name.trim()) {
      setFormError('Nome da Role é obrigatório.');
      return;
    }
    setFormError('');
    const updatedData: PlatformUpdateRoleDto = { 
        name, 
        description: description || undefined, 
        isPlatformRole 
    };
    await onSubmit(role.id, updatedData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Editar Role: {role?.name}</DialogTitle>
      <DialogContent>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {formError && <p style={{ color: 'red' }}>{formError}</p>}
        <TextField
          autoFocus
          margin="dense"
          name="name"
          label="Nome da Role"
          type="text"
          fullWidth
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={isLoading}
        />
        <TextField
          margin="dense"
          name="description"
          label="Descrição (Opcional)"
          type="text"
          fullWidth
          multiline
          rows={2}
          variant="outlined"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isLoading}
        />
        <FormControlLabel
          control={
            <Switch
              checked={isPlatformRole}
              onChange={(e) => setIsPlatformRole(e.target.checked)}
              name="isPlatformRole"
              color="primary"
              disabled={isLoading}
            />
          }
          label="Esta é uma Role da Plataforma?"
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions sx={{ p: '16px 24px' }}>
        <Button onClick={onClose} color="secondary" disabled={isLoading}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary" disabled={isLoading}>
          {isLoading ? <CircularProgress size={24} color="inherit" /> : "Salvar Alterações"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditRoleDialog;