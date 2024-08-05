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
import { Edit, Delete, Print, Info } from '@mui/icons-material';
import { Delivery, Driver, Vehicle, Order } from '../../../types';
import { generatePDF } from './DeliveryReport';

interface DeliveryTableProps {
  deliveries: Delivery[];
  drivers: Driver[];
  vehicles: Vehicle[];
  calculateTotalWeightAndValue: (orders: Order[]) => { totalWeight: number; totalValue: number };
  getRegionName: (delivery: Delivery) => string;
  handleEditDelivery: (delivery: Delivery) => void;
  handleDeleteDelivery: (deliveryId: string) => void;
  handleViewOrders: (delivery: Delivery) => void;
}

const DeliveryTable: React.FC<DeliveryTableProps> = ({
  deliveries,
  drivers,
  vehicles,
  calculateTotalWeightAndValue,
  getRegionName,
  handleEditDelivery,
  handleDeleteDelivery,
  handleViewOrders,
}) => {
  const handlePrintDelivery = (delivery: Delivery) => {
    const driver = drivers.find(driver => driver.id === delivery.motoristaId);
    const vehicle = vehicles.find(vehicle => vehicle.id === delivery.veiculoId);
    generatePDF(delivery, driver, vehicle, calculateTotalWeightAndValue, getRegionName);
  };

  return (
    <TableContainer component={Paper} style={{ marginTop: '16px' }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell style={{ whiteSpace: 'nowrap' }}>ID</TableCell>
            <TableCell style={{ whiteSpace: 'nowrap' }}>Região</TableCell>
            <TableCell style={{ whiteSpace: 'nowrap' }}>Motorista</TableCell>
            <TableCell style={{ whiteSpace: 'nowrap' }}>Veículo</TableCell>
            <TableCell style={{ whiteSpace: 'nowrap' }}>Total Valor</TableCell>
            <TableCell style={{ whiteSpace: 'nowrap' }}>Total Peso</TableCell>
            <TableCell style={{ whiteSpace: 'nowrap' }}>Data Início</TableCell>
            <TableCell style={{ whiteSpace: 'nowrap' }}>Data Finalização</TableCell>
            <TableCell style={{ whiteSpace: 'nowrap' }}>Status</TableCell>
            <TableCell style={{ whiteSpace: 'nowrap' }}>Liberador</TableCell>
            <TableCell style={{ whiteSpace: 'nowrap' }}>Data de Liberação</TableCell>
            <TableCell style={{ whiteSpace: 'nowrap' }}>Total de Docs</TableCell>
            <TableCell style={{ whiteSpace: 'nowrap' }}>Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {deliveries.map(delivery => {
            const driver = drivers.find(driver => driver.id === delivery.motoristaId);
            const vehicle = vehicles.find(vehicle => vehicle.id === delivery.veiculoId);
            const { totalWeight, totalValue } = calculateTotalWeightAndValue(delivery.orders as Order[]);
            const regionName = getRegionName(delivery);
            const totalNotes = delivery.orders?.length || 0;

            return (
              <TableRow key={delivery.id}>
                <TableCell style={{ whiteSpace: 'nowrap' }}>{delivery.id}</TableCell>
                <TableCell style={{ whiteSpace: 'nowrap' }}>{regionName}</TableCell>
                <TableCell style={{ whiteSpace: 'nowrap' }}>{driver?.name}</TableCell>
                <TableCell style={{ whiteSpace: 'nowrap' }}>{vehicle?.model}</TableCell>
                <TableCell style={{ whiteSpace: 'nowrap' }}>R$ {totalValue.toFixed(2)}</TableCell>
                <TableCell style={{ whiteSpace: 'nowrap' }}>{totalWeight.toFixed(2)} kg</TableCell>
                <TableCell style={{ whiteSpace: 'nowrap' }}>{delivery.dataInicio ? new Date(delivery.dataInicio).toLocaleString() : 'N/A'}</TableCell>
                <TableCell style={{ whiteSpace: 'nowrap' }}>{delivery.dataFim ? new Date(delivery.dataFim).toLocaleString() : 'N/A'}</TableCell>
                <TableCell style={{ whiteSpace: 'nowrap' }}>{delivery.status}</TableCell>
                <TableCell style={{ whiteSpace: 'nowrap' }}>{delivery.liberador}</TableCell>
                <TableCell style={{ whiteSpace: 'nowrap' }}>{delivery.dataLiberacao ? new Date(delivery.dataLiberacao).toLocaleString() : 'N/A'}</TableCell>
                <TableCell style={{ whiteSpace: 'nowrap' }}>{totalNotes}</TableCell>
                <TableCell style={{ whiteSpace: 'nowrap' }}>
                  <IconButton onClick={() => handleViewOrders(delivery)}>
                    <Info />
                  </IconButton>
                  {(delivery.status !== 'A liberar' && delivery.status !== 'Negado') && (
                    <>
                      <IconButton onClick={() => handleEditDelivery(delivery)}>
                        <Edit />
                      </IconButton>
                      <IconButton onClick={() => handlePrintDelivery(delivery)}>
                        <Print />
                      </IconButton>
                    </>
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
};

export default DeliveryTable;
