import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';

interface ConfirmDialogProps {
  confirmDialogOpen: boolean;
  setConfirmDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  confirmDialogAction: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  confirmDialogOpen,
  setConfirmDialogOpen,
  confirmDialogAction,
}) => (
  <Dialog
    open={confirmDialogOpen}
    onClose={() => setConfirmDialogOpen(false)}
    aria-labelledby="confirm-dialog-title"
    aria-describedby="confirm-dialog-description"
  >
    <DialogTitle id="confirm-dialog-title">Confirmar Ação</DialogTitle>
    <DialogContent>
      <Typography>Você tem certeza que deseja continuar com esta ação?</Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={() => setConfirmDialogOpen(false)} color="secondary">
        Cancelar
      </Button>
      <Button
        onClick={() => {
          confirmDialogAction();
        }}
        color="primary"
      >
        Confirmar
      </Button>
    </DialogActions>
  </Dialog>
);

export default ConfirmDialog;
