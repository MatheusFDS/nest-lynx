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
} from '@mui/material';
import { Edit, Delete, Map } from '@mui/icons-material';
import { Delivery, Driver, Vehicle, Order } from '../../../types';

interface DeliveryTableProps {
  deliveries: Delivery[];
  drivers: Driver[];
  vehicles: Vehicle[];
  calculateTotalWeightAndValue: (orders: Order[]) => { totalWeight: number; totalValue: number };
  getRegionName: (delivery: Delivery) => string;
  handleEditDelivery: (delivery: Delivery) => void;
  handleDeleteDelivery: (deliveryId: number) => void;
}

const DeliveryTable: React.FC<DeliveryTableProps> = ({
  deliveries,
  drivers,
  vehicles,
  calculateTotalWeightAndValue,
  getRegionName,
  handleEditDelivery,
  handleDeleteDelivery,
}) => (
  <TableContainer component={Paper} style={{ marginTop: '16px' }}>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>ID</TableCell>
          <TableCell>Região</TableCell>
          <TableCell>Motorista</TableCell>
          <TableCell>Veículo</TableCell>
          <TableCell>Total Valor</TableCell>
          <TableCell>Total Peso</TableCell>
          <TableCell>Data Início</TableCell>
          <TableCell>Data Finalização</TableCell>
          <TableCell>Status</TableCell>
          <TableCell>Ações</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {deliveries.map(delivery => {
          const driver = drivers.find(driver => driver.id === delivery.motoristaId);
          const vehicle = vehicles.find(vehicle => vehicle.id === delivery.veiculoId);
          const { totalWeight, totalValue } = calculateTotalWeightAndValue(delivery.orders as Order[]);
          const regionName = getRegionName(delivery);

          return (
            <TableRow key={delivery.id}>
              <TableCell>{delivery.id}</TableCell>
              <TableCell>{regionName}</TableCell>
              <TableCell>{driver?.name}</TableCell>
              <TableCell>{vehicle?.model}</TableCell>
              <TableCell>R$ {totalValue.toFixed(2)}</TableCell>
              <TableCell>{totalWeight.toFixed(2)} kg</TableCell>
              <TableCell>{delivery.dataInicio ? new Date(delivery.dataInicio).toLocaleString() : 'N/A'}</TableCell>
              <TableCell>{delivery.dataFim ? new Date(delivery.dataFim).toLocaleString() : 'N/A'}</TableCell>
              <TableCell>{delivery.status}</TableCell>
              <TableCell>
                {delivery.status !== 'A liberar' && (
                  <IconButton onClick={() => handleEditDelivery(delivery)}>
                    <Edit />
                  </IconButton>
                )}
                <IconButton onClick={() => handleDeleteDelivery(delivery.id)}>
                  <Delete />
                </IconButton>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  </TableContainer>
);

export default DeliveryTable;
