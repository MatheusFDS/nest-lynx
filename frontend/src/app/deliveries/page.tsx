'use client';

import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  TextField,
  FormControlLabel,
  Checkbox,
  Button,
  Paper,
  Badge,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { SelectChangeEvent } from '@mui/material';
import { fetchDeliveries, updateDelivery, removeOrderFromDelivery, deleteDelivery } from '../../services/deliveryService';
import { fetchDrivers, fetchVehicles, fetchCategories, fetchDirections } from '../../services/auxiliaryService';
import { Order, Driver, Vehicle, Category, Delivery, Direction } from '../../types';
import withAuth from '../hoc/withAuth';
import DeliveryTable from '../components/delivery/DeliveryTable';
import EditDeliveryDialog from '../components/delivery/EditDeliveryDialog';
import OrderDetailsDialog from '../components/delivery/OrderDetailsDialog';
import ConfirmDialog from '../components/delivery/ConfirmDialog';

const StyledButton = styled(Button)({
  margin: '8px',
  padding: '8px 16px',
  backgroundColor: '#1976d2',
  color: '#fff',
  '&:hover': {
    backgroundColor: '#115293',
  },
});

const DeliveriesPage: React.FC = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [directions, setDirections] = useState<Direction[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<string>('');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [error, setError] = useState<string>('');
  const [currentDelivery, setCurrentDelivery] = useState<Delivery | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [tabIndex, setTabIndex] = useState(0);
  const [tollValue, setTollValue] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string }>({ startDate: '', endDate: '' });
  const [showFinalized, setShowFinalized] = useState<boolean>(false);
  const [showPending, setShowPending] = useState<boolean>(false);
  const [showToRelease, setShowToRelease] = useState<boolean>(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false);
  const [confirmDialogAction, setConfirmDialogAction] = useState<() => void>(() => {});

  const token = localStorage.getItem('token') || '';

  const loadInitialData = async () => {
    try {
      const [deliveriesData, driversData, vehiclesData, categoriesData, directionsData] = await Promise.all([
        fetchDeliveries(token),
        fetchDrivers(token),
        fetchVehicles(token),
        fetchCategories(token),
        fetchDirections(token),
      ]);

      setDeliveries(deliveriesData);
      setDrivers(driversData);
      setVehicles(vehiclesData);
      setCategories(categoriesData);
      setDirections(directionsData);
    } catch (error: unknown) {
      setError('Failed to load initial data.');
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleEditDelivery = (delivery: Delivery) => {
    if (delivery.status === 'A liberar') {
      return;
    }

    setCurrentDelivery({
      ...delivery,
      status: delivery.status || 'Em Rota',
    });
    setSelectedDriver(delivery.motoristaId);
    setSelectedVehicle(delivery.veiculoId);
    setTollValue(delivery.valorFrete - getVehicleValue(delivery.veiculoId));
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setCurrentDelivery(null);
  };

  const handleDetailsDialogOpen = (order: Order) => {
    setSelectedOrder(order);
    setDetailsDialogOpen(true);
  };

  const handleDetailsDialogClose = () => {
    setDetailsDialogOpen(false);
    setSelectedOrder(null);
  };

  const calculateTotalWeightAndValue = (orders: Order[]) => {
    let totalWeight = 0;
    let totalValue = 0;
    orders.forEach(order => {
      totalWeight += order.peso;
      totalValue += order.valor;
    });
    return { totalWeight, totalValue };
  };

  const handleDriverChange = (e: SelectChangeEvent<string>) => {
    const driverId = e.target.value;
    setSelectedDriver(driverId);
    const driver = drivers.find(driver => driver.id === driverId);
    if (driver) {
      const vehicle = vehicles.find(vehicle => vehicle.driverId === driver.id);
      if (vehicle) {
        setSelectedVehicle(vehicle.id);
      } else {
        setSelectedVehicle('');
      }
    }
  };

  const handleVehicleChange = (e: SelectChangeEvent<string>) => {
    const vehicleId = e.target.value;
    setSelectedVehicle(vehicleId);
  };

  const getVehicleValue = (vehicleId: string) => {
    const vehicle = vehicles.find(vehicle => vehicle.id === vehicleId);
    if (vehicle) {
      const category = categories.find(c => c.id === vehicle.categoryId);
      return category ? category.valor : 0;
    }
    return 0;
  };

  const handleConfirmDelivery = async () => {
    if (!currentDelivery) return;

    const ordersInDelivery: Order[] = currentDelivery.orders as Order[];

    const { totalWeight, totalValue } = calculateTotalWeightAndValue(ordersInDelivery);

    const deliveryData = {
      motoristaId: selectedDriver,
      veiculoId: selectedVehicle,
      valorFrete: getVehicleValue(selectedVehicle) + tollValue,
      totalPeso: totalWeight,
      totalValor: totalValue,
      status: currentDelivery.status,
      dataInicio: currentDelivery.dataInicio,
      dataFim: currentDelivery.dataFim,
      orders: ordersInDelivery.map((order, index) => ({
        ...order,
        sorting: index + 1,
      })),
    };

    try {
      await updateDelivery(token, currentDelivery.id, deliveryData);
      setDialogOpen(false);
      setCurrentDelivery(null);
      loadInitialData();
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Failed to update delivery:', error.message);
        setError(error.message);
      } else {
        console.error('Failed to update delivery:', error);
        setError('Failed to update delivery.');
      }
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleDateFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange(prevState => ({ ...prevState, [name]: value }));
  };

  const handleDeleteDelivery = async (deliveryId: string) => {
    setConfirmDialogAction(() => async () => {
      try {
        await deleteDelivery(token, deliveryId);
        loadInitialData();
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error('Failed to delete delivery:', error.message);
          setError(error.message);
        } else {
          console.error('Failed to delete delivery:', error);
          setError('Failed to delete delivery.');
        }
      }
      setConfirmDialogOpen(false);
    });
    setConfirmDialogOpen(true);
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    if (name === 'showFinalized') {
      setShowFinalized(checked);
    } else if (name === 'showPending') {
      setShowPending(checked);
    } else if (name === 'showToRelease') {
      setShowToRelease(checked);
    }
  };

  const handleRemoveOrderFromDelivery = async (deliveryId: string, orderId: string) => {
    setConfirmDialogAction(() => async () => {
      try {
        await removeOrderFromDelivery(token, deliveryId, orderId);
        loadInitialData();
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error('Failed to remove order from delivery:', error.message);
          setError(error.message);
        } else {
          console.error('Failed to remove order from delivery:', error);
          setError('Failed to remove order from delivery.');
        }
      }
      setConfirmDialogOpen(false);
    });
    setConfirmDialogOpen(true);
  };

  const filteredDeliveries = deliveries.filter((delivery) => {
    const { startDate, endDate } = dateRange;
    if (searchTerm) {
      return (
        Object.values(delivery).some(value =>
          value ? value.toString().toLowerCase().includes(searchTerm.toLowerCase()) : false
        ) ||
        delivery.orders.some(order =>
          Object.values(order).some(value =>
            value ? value.toString().toLowerCase().includes(searchTerm.toLowerCase()) : false
          )
        )
      );
    }
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const dataInicio = new Date(delivery.dataInicio);
      return dataInicio >= start && dataInicio <= end;
    }
    return true;
  }).filter(delivery => {
    if (showFinalized && delivery.status === 'Finalizado') {
      return true;
    }
    if (showPending && delivery.status === 'Em Rota') {
      return true;
    }
    if (showToRelease && delivery.status === 'A liberar') {
      return true;
    }
    return !showFinalized && !showPending && !showToRelease;
  });

  const getRegionName = (delivery: Delivery) => {
    const orderCep = delivery.orders[0]?.cep;
    const direction = directions.find(dir => parseInt(orderCep) >= parseInt(dir.rangeInicio) && parseInt(orderCep) <= parseInt(dir.rangeFim));
    return direction ? direction.regiao : 'N/A';
  };

  return (
    <Container>
      <Grid container spacing={2} style={{ marginTop: '16px', marginBottom: '16px' }}>
        <Grid item xs={12}>
          <TextField
            label="Buscar"
            fullWidth
            value={searchTerm}
            onChange={handleSearch}
            variant="outlined"
            size="small"
            placeholder="Pesquisar por qualquer campo"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Data Início"
            type="datetime-local"
            fullWidth
            value={dateRange.startDate}
            onChange={handleDateFilter}
            name="startDate"
            InputLabelProps={{ shrink: true }}
            size="small"
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Data Fim"
            type="datetime-local"
            fullWidth
            value={dateRange.endDate}
            onChange={handleDateFilter}
            name="endDate"
            InputLabelProps={{ shrink: true }}
            size="small"
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={<Checkbox checked={showFinalized} onChange={handleStatusFilterChange} name="showFinalized" />}
            label="Finalizadas"
          />
          <FormControlLabel
            control={<Checkbox checked={showPending} onChange={handleStatusFilterChange} name="showPending" />}
            label="Em Rota"
          />
          <FormControlLabel
            control={<Checkbox checked={showToRelease} onChange={handleStatusFilterChange} name="showToRelease" />}
            label="A Liberar"
          />
          <Badge badgeContent={filteredDeliveries.length} color="primary" showZero></Badge>
        </Grid>
      </Grid>
      <Paper elevation={3}>
        {filteredDeliveries.length > 0 ? (
          <DeliveryTable
            deliveries={filteredDeliveries}
            drivers={drivers}
            vehicles={vehicles}
            calculateTotalWeightAndValue={calculateTotalWeightAndValue}
            getRegionName={getRegionName}
            handleEditDelivery={handleEditDelivery}
            handleDeleteDelivery={handleDeleteDelivery}
          />
        ) : (
          <Typography align="center" style={{ padding: '16px' }}>
            Nenhuma entrega encontrada. Use os filtros para buscar entregas.
          </Typography>
        )}
      </Paper>
      <EditDeliveryDialog
        dialogOpen={dialogOpen}
        handleDialogClose={handleDialogClose}
        currentDelivery={currentDelivery}
        setCurrentDelivery={setCurrentDelivery}
        drivers={drivers}
        selectedDriver={selectedDriver}
        handleDriverChange={handleDriverChange}
        vehicles={vehicles}
        selectedVehicle={selectedVehicle}
        handleVehicleChange={handleVehicleChange}
        tollValue={tollValue}
        setTollValue={setTollValue}
        handleConfirmDelivery={handleConfirmDelivery}
        tabIndex={tabIndex}
        setTabIndex={setTabIndex}
        calculateTotalWeightAndValue={calculateTotalWeightAndValue}
        handleRemoveOrderFromDelivery={handleRemoveOrderFromDelivery}
      />
      <OrderDetailsDialog
        detailsDialogOpen={detailsDialogOpen}
        handleDetailsDialogClose={handleDetailsDialogClose}
        selectedOrder={selectedOrder}
      />
      <ConfirmDialog
        confirmDialogOpen={confirmDialogOpen}
        setConfirmDialogOpen={setConfirmDialogOpen}
        confirmDialogAction={confirmDialogAction}
      />
    </Container>
  );
};

export default withAuth(DeliveriesPage);
