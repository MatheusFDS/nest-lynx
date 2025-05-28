// components/platform/CreateTenantDialog.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  TextField, Button, CircularProgress
} from '@mui/material';
import { PlatformCreateTenantDto } from '../../../services/platformAdmin/tenantApi'; // Ajuste o caminho

interface CreateTenantDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (tenantData: PlatformCreateTenantDto) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

const CreateTenantDialog: React.FC<CreateTenantDialogProps> = ({ open, onClose, onSubmit, isLoading, error }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (open) {
      setName('');
      setEmail('');
      setAddress('');
      setFormError('');
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim()) {
      setFormError('Nome do Tenant e Email do Administrador são obrigatórios.');
      return;
    }
    setFormError('');
    const tenantData: PlatformCreateTenantDto = { name, email, address };
    await onSubmit(tenantData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Criar Novo Tenant</DialogTitle>
      <DialogContent>
        <DialogContentText mb={2}>
          Preencha os dados para criar um novo tenant e seu administrador inicial.
        </DialogContentText>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {formError && <p style={{ color: 'red' }}>{formError}</p>}
        <TextField
          autoFocus
          margin="dense"
          id="name"
          name="name"
          label="Nome do Tenant"
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
          id="email"
          name="email"
          label="Email do Administrador do Tenant"
          type="email"
          fullWidth
          variant="outlined"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
        />
        <TextField
          margin="dense"
          id="address"
          name="address"
          label="Endereço (Opcional)"
          type="text"
          fullWidth
          variant="outlined"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          disabled={isLoading}
        />
      </DialogContent>
      <DialogActions sx={{ p: '16px 24px' }}>
        <Button onClick={onClose} color="secondary" disabled={isLoading}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary" disabled={isLoading}>
          {isLoading ? <CircularProgress size={24} color="inherit" /> : "Criar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateTenantDialog;