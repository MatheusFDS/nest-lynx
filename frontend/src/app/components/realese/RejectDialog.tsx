import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField,
} from '@mui/material';
import { Delivery } from '../../../types';

interface RejectDialogProps {
  open: boolean;
  onClose: () => void;
  delivery: Delivery;
  rejectReason: string;
  setRejectReason: (reason: string) => void;
  onReject: () => void;
}

const RejectDialog: React.FC<RejectDialogProps> = ({
  open,
  onClose,
  delivery,
  rejectReason,
  setRejectReason,
  onReject,
}) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Negar Roteiro</DialogTitle>
      <DialogContent>
        <Typography variant="body2">Tem certeza que deseja negar o roteiro {delivery.id}?</Typography>
        <TextField
          label="Motivo da Negação"
          fullWidth
          multiline
          rows={4}
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          variant="outlined"
          margin="normal"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancelar
        </Button>
        <Button onClick={onReject} color="primary">
          Negar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RejectDialog;
