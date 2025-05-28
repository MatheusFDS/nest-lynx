// components/platform/DeleteConfirmDialog.tsx
'use client';

import React from 'react';
import {
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  Button, CircularProgress
} from '@mui/material';

interface DeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  itemName?: string;
  isLoading?: boolean;
  error?: string | null;
}

const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({ open, onClose, onConfirm, itemName, isLoading, error }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">Confirmar Exclusão</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {error && <p style={{ color: 'red' }}>{error}</p>}
          Tem certeza que deseja excluir {itemName ? `"${itemName}"` : "este item"}?
          Esta ação não pode ser desfeita.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: '16px 24px' }}>
        <Button onClick={onClose} color="secondary" disabled={isLoading}>
          Cancelar
        </Button>
        <Button onClick={onConfirm} color="error" variant="contained" autoFocus disabled={isLoading}>
          {isLoading ? <CircularProgress size={24} color="inherit" /> : "Excluir"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmDialog;