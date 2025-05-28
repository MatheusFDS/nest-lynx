// components/platform/EditTenantDialog.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogActions, DialogContent, DialogTitle,
  TextField, Button, CircularProgress
} from '@mui/material';
import { Tenant, PlatformUpdateTenantDto } from '../../../services/platformAdmin/tenantApi'; // Ajuste o caminho

interface EditTenantDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (tenantId: string, tenantData: PlatformUpdateTenantDto) => Promise<void>;
  tenant: Tenant | null;
  isLoading?: boolean;
  error?: string | null;
}

const EditTenantDialog: React.FC<EditTenantDialogProps> = ({ open, onClose, onSubmit, tenant, isLoading, error }) => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (tenant && open) {
      setName(tenant.name);
      setAddress(tenant.address || '');
      setFormError('');
    }
  }, [tenant, open]);

  const handleSubmit = async () => {
    if (!tenant) return;
    if (!name.trim()) {
      setFormError('Nome do Tenant é obrigatório.');
      return;
    }
    setFormError('');
    const updatedData: PlatformUpdateTenantDto = { name, address };
    await onSubmit(tenant.id, updatedData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Editar Tenant: {tenant?.name}</DialogTitle>
      <DialogContent>
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
          id="address"
          name="address"
          label="Endereço"
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
          {isLoading ? <CircularProgress size={24} color="inherit" /> : "Salvar Alterações"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditTenantDialog;