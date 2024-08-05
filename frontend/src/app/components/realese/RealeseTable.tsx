import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
} from '@mui/material';
import { Delivery } from '../../../types';
import { Info } from '@mui/icons-material';

interface DeliveryTableProps {
  deliveries: Delivery[];
  handleDetailsDialogOpen: (delivery: Delivery) => void;
  handleReleaseDialogOpen: (delivery: Delivery) => void;
  handleRejectDialogOpen: (delivery: Delivery) => void;
}

const RealeseTable: React.FC<DeliveryTableProps> = ({
  deliveries,
  handleDetailsDialogOpen,
  handleReleaseDialogOpen,
  handleRejectDialogOpen,
}) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Motorista</TableCell>
            <TableCell>Veículo</TableCell>
            <TableCell>Total Peso</TableCell>
            <TableCell>Total Valor</TableCell>
            <TableCell>Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {deliveries.map(delivery => (
            <TableRow key={delivery.id}>
              <TableCell>{delivery.id}</TableCell>
              <TableCell>{delivery.Driver.name}</TableCell>
              <TableCell>{delivery.Vehicle.model}</TableCell>
              <TableCell>{delivery.totalPeso?.toFixed(2)} kg</TableCell>
              <TableCell>R$ {delivery.totalValor?.toFixed(2)}</TableCell>
              <TableCell>
                <IconButton onClick={() => handleDetailsDialogOpen(delivery)}>
                  <Info />
                </IconButton>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={() => handleReleaseDialogOpen(delivery)}
                >
                  Liberar
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  size="small"
                  onClick={() => handleRejectDialogOpen(delivery)}
                  style={{ marginLeft: '8px' }}
                >
                  Negar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default RealeseTable;
