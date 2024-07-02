'use client';

import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Tabs,
  Tab,
} from '@mui/material';
import { Delete, Map, Info } from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { fetchOrders, fetchDirections, fetchDrivers, fetchVehicles } from '../../services/auxiliaryService';
import { Order, Driver, Vehicle, Direction } from '../../types';
import withAuth from '../components/withAuth';
import { SelectChangeEvent } from '@mui/material/Select';

const RoutingPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [directions, setDirections] = useState<Direction[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<{ [key: number]: Order[] }>({});
  const [selectedDriver, setSelectedDriver] = useState<number | string>('');
  const [selectedVehicle, setSelectedVehicle] = useState<number | string>('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState<string>('');
  const [currentDirectionId, setCurrentDirectionId] = useState<number | null>(null);
  const [tabIndex, setTabIndex] = useState(0);
  const [additionalValue, setAdditionalValue] = useState<number>(0);
  const [tollValue, setTollValue] = useState<number>(0);
  const [vehicleValue, setVehicleValue] = useState<number>(0);
  const [tenantId, setTenantId] = useState<number>(1); // Defina o tenantId adequadamente

  const token = localStorage.getItem('token') || '';

  const loadInitialData = async () => {
    try {
      const [ordersData, directionsData, driversData, vehiclesData] = await Promise.all([
        fetchOrders(token),
        fetchDirections(token),
        fetchDrivers(token),
        fetchVehicles(token),
      ]);

      setOrders(ordersData);
      setDirections(directionsData);
      setDrivers(driversData);
      setVehicles(vehiclesData);

      const initialOrders: { [key: number]: Order[] } = {};
      directionsData.forEach((direction: Direction) => {
        initialOrders[direction.id] = ordersData.filter((order: Order) => {
          return (
            parseInt(order.cep) >= parseInt(direction.rangeInicio) &&
            parseInt(order.cep) <= parseInt(direction.rangeFim)
          );
        });
      });
      setSelectedOrders(initialOrders);
    } catch (error) {
      setError('Failed to load initial data.');
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleOrderTransfer = (orderId: number, fromDirectionId: number, toDirectionId: number) => {
    setSelectedOrders(prevState => {
      const fromOrders = prevState[fromDirectionId].filter(order => order.id !== orderId);
      const toOrders = [...prevState[toDirectionId], orders.find(order => order.id === orderId)!];
      return { ...prevState, [fromDirectionId]: fromOrders, [toDirectionId]: toOrders };
    });
  };

  const handleSaveState = () => {
    // Save the current state of orders in directions
  };

  const handleGenerateDelivery = (directionId: number) => {
    setCurrentDirectionId(directionId);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setCurrentDirectionId(null);
  };

  const openGoogleMaps = (cep: string) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${cep}`;
    window.open(url, '_blank');
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

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination } = result;

    if (source.droppableId !== destination.droppableId) {
      handleOrderTransfer(parseInt(result.draggableId), parseInt(source.droppableId), parseInt(destination.droppableId));
    }
  };

  const getVehicleValue = (vehicleId: number | string) => {
    const vehicle = vehicles.find(vehicle => vehicle.id === vehicleId);
    if (vehicle) {
      const category = vehicle.categoryId ? vehicles.find(v => v.id === vehicle.categoryId) : null;
      return category ? category.valor : 0;
    }
    return 0;
  };

  const getMaxDirectionValue = (ordersInDirection: Order[]) => {
    let maxDirectionValue = 0;
    if (Array.isArray(ordersInDirection)) {
      ordersInDirection.forEach(order => {
        const direction = directions.find(
          direction =>
            parseInt(order.cep) >= parseInt(direction.rangeInicio) &&
            parseInt(order.cep) <= parseInt(direction.rangeFim)
        );
        if (direction && Number(direction.valorDirecao) > maxDirectionValue) {
          maxDirectionValue = Number(direction.valorDirecao);
        }
      });
    }
    return maxDirectionValue;
  };

  const calculateFreightValue = () => {
    const ordersInDirection = selectedOrders[currentDirectionId!] || [];
    return getVehicleValue(selectedVehicle) + getMaxDirectionValue(ordersInDirection) + additionalValue + tollValue;
  };

  const handleDriverChange = (e: SelectChangeEvent<number | string>) => {
    const driverId = e.target.value as number;
    setSelectedDriver(driverId);
    const driver = drivers.find(driver => driver.id === driverId);
    if (driver) {
      const vehicle = vehicles.find(vehicle => vehicle.driverId === driver.id);
      if (vehicle) {
        setSelectedVehicle(vehicle.id);
        setVehicleValue(vehicle.categoryId); // Utilize o categoryId para obter o valor da categoria
      } else {
        setSelectedVehicle('');
        setVehicleValue(0);
      }
    }
  };

  const handleVehicleChange = (e: SelectChangeEvent<number | string>) => {
    const vehicleId = e.target.value as number;
    setSelectedVehicle(vehicleId);
    setVehicleValue(getVehicleValue(vehicleId));
  };

  const handleConfirmDelivery = async () => {
    if (!currentDirectionId) return;

    const ordersInDirection = selectedOrders[currentDirectionId];
    if (!ordersInDirection || ordersInDirection.length === 0) return;

    const { totalWeight, totalValue } = calculateTotalWeightAndValue(ordersInDirection);
    const freightValue = calculateFreightValue();

    const deliveryData = {
      motoristaId: selectedDriver as number,
      veiculoId: selectedVehicle as number,
      valorFrete: freightValue,
      totalPeso: totalWeight,
      totalValor: totalValue,
      tenantId: tenantId, // Defina o tenantId adequadamente
      orders: ordersInDirection.map(order => order.id),
    };

    try {
      const response = await fetch('http://localhost:4000/delivery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(deliveryData),
      });

      if (!response.ok) {
        throw new Error('Failed to create delivery');
      }

      setDialogOpen(false);
      setCurrentDirectionId(null);
      loadInitialData();
    } catch (error) {
      setError('Failed to create delivery.');
    }
  };

  return (
    <Container>
      {error && <Typography color="error">{error}</Typography>}
      <DragDropContext onDragEnd={onDragEnd}>
        <Grid container spacing={3}>
          {directions.map(direction => {
            const directionId = direction.id.toString();
            const ordersInDirection = selectedOrders[direction.id] || [];
            if (ordersInDirection.length === 0) return null;

            return (
              <Grid item xs={12} sm={6} md={4} key={direction.id}>
                <Paper elevation={3} style={{ padding: '16px' }}>
                  <Typography variant="h6">{direction.regiao}</Typography>
                  <Typography variant="body1">CEP: {direction.rangeInicio} - {direction.rangeFim}</Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    style={{ marginTop: '16px' }}
                    onClick={() => handleGenerateDelivery(direction.id)}
                  >
                    Gerar Rota
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    style={{ marginTop: '16px', marginLeft: '8px' }}
                    onClick={() => openGoogleMaps(direction.rangeInicio)}
                  >
                    Mapa
                  </Button>
                  <Droppable droppableId={directionId}>
                    {(provided, snapshot) => (
                      <div ref={provided.innerRef} {...provided.droppableProps} style={{ marginTop: '16px' }}>
                        {ordersInDirection.map((order, index) => (
                          <Draggable key={order.id.toString()} draggableId={order.id.toString()} index={index}>
                            {(provided, snapshot) => (
                              <ListItem ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                <Paper style={{ padding: '8px', marginBottom: '8px', width: '100%' }}>
                                  <ListItemText
                                    primary={`Pedido ${order.numero} - Cliente: ${order.cliente}`}
                                    secondary={`CEP: ${order.cep}, Valor: ${order.valor}, Peso: ${order.peso}`}
                                  />
                                  <IconButton
                                    edge="end"
                                    onClick={() => handleOrderTransfer(order.id, parseInt(directionId), parseInt(directionId))}
                                  >
                                    <Delete />
                                  </IconButton>
                                </Paper>
                              </ListItem>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </DragDropContext>

      <Dialog open={dialogOpen} onClose={handleDialogClose} fullWidth maxWidth="md">
        <DialogTitle>Gerar Roteiro</DialogTitle>
        <DialogContent>
          <Tabs value={tabIndex} onChange={(e, newValue) => setTabIndex(newValue)}>
            <Tab label="DADOS" />
            <Tab label="NOTAS" />
          </Tabs>
          {tabIndex === 0 && (
            <div>
              <FormControl fullWidth margin="normal">
                <InputLabel>Motorista</InputLabel>
                <Select value={selectedDriver} onChange={handleDriverChange}>
                  {drivers.map(driver => (
                    <MenuItem key={driver.id} value={driver.id}>
                      {driver.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth margin="normal">
                <InputLabel>Veículo</InputLabel>
                <Select value={selectedVehicle} onChange={handleVehicleChange}>
                  {vehicles.map(vehicle => (
                    <MenuItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.model}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Valor do Veículo"
                value={vehicleValue}
                onChange={(e) => setVehicleValue(parseFloat(e.target.value))}
                type="number"
                fullWidth
                margin="normal"
                disabled
              />
              <TextField
                label="Valor Adicional"
                value={additionalValue}
                onChange={(e) => setAdditionalValue(parseFloat(e.target.value))}
                type="number"
                fullWidth
                margin="normal"
              />
              <TextField
                label="Valor do Pedágio"
                value={tollValue}
                onChange={(e) => setTollValue(parseFloat(e.target.value))}
                type="number"
                fullWidth
                margin="normal"
              />
              <Typography variant="body1" style={{ marginTop: '16px' }}>
                Total Peso: {calculateTotalWeightAndValue(selectedOrders[currentDirectionId!] || []).totalWeight.toFixed(2)} kg
              </Typography>
              <Typography variant="body1">Total Valor: R$ {calculateTotalWeightAndValue(selectedOrders[currentDirectionId!] || []).totalValue.toFixed(2)}</Typography>
              <Typography variant="body1">Valor do Frete: R$ {calculateFreightValue().toFixed(2)}</Typography>
            </div>
          )}
          {tabIndex === 1 && (
            <List>
              {selectedOrders[currentDirectionId!]?.map(order => (
                <ListItem key={order.id}>
                  <ListItemText
                    primary={`Pedido ${order.numero} - Cliente: ${order.cliente}`}
                    secondary={`CEP: ${order.cep}, Valor: ${order.valor}, Peso: ${order.peso}`}
                  />
                </ListItem>
              ))}
              <Typography variant="body1" style={{ marginTop: '16px' }}>
                Total Peso: {calculateTotalWeightAndValue(selectedOrders[currentDirectionId!] || []).totalWeight.toFixed(2)} kg
              </Typography>
              <Typography variant="body1">Total Valor: R$ {calculateTotalWeightAndValue(selectedOrders[currentDirectionId!] || []).totalValue.toFixed(2)}</Typography>
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleConfirmDelivery} color="primary">
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default withAuth(RoutingPage);
