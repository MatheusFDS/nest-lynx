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
  Tabs,
  Tab,
} from '@mui/material';
import { Delete, Info, Map } from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { fetchOrders, fetchDirections, fetchDrivers, fetchVehicles, fetchCategories } from '../../services/auxiliaryService';
import { Order, Driver, Vehicle, Direction, Category } from '../../types';
import withAuth from '../components/withAuth';
import { SelectChangeEvent } from '@mui/material/Select';
import { addDelivery } from '../../services/deliveryService';

const RoutingPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [directions, setDirections] = useState<Direction[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<{ [key: number]: Order[] }>({});
  const [selectedDriver, setSelectedDriver] = useState<number | string>('');
  const [selectedVehicle, setSelectedVehicle] = useState<number | string>('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [error, setError] = useState<string>('');
  const [currentDirectionId, setCurrentDirectionId] = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [tabIndex, setTabIndex] = useState(0);
  const [additionalValue, setAdditionalValue] = useState<number>(0);
  const [tollValue, setTollValue] = useState<number>(0);
  const [vehicleValue, setVehicleValue] = useState<number>(0);
  const [tenantId, setTenantId] = useState<number>(1); // Defina o tenantId adequadamente

  const token = localStorage.getItem('token') || '';

  const loadInitialData = async () => {
    try {
      const [ordersData, directionsData, driversData, vehiclesData, categoriesData] = await Promise.all([
        fetchOrders(token),
        fetchDirections(token),
        fetchDrivers(token),
        fetchVehicles(token),
        fetchCategories(token),
      ]);

      const filteredOrders = ordersData.filter((order: { status: string; }) => ['Pendente', 'Reentrega'].includes(order.status));

      setOrders(filteredOrders);
      setDirections(directionsData);
      setDrivers(driversData);
      setVehicles(vehiclesData);
      setCategories(categoriesData);

      const initialOrders: { [key: number]: Order[] } = {};
      directionsData.forEach((direction: Direction) => {
        initialOrders[direction.id] = filteredOrders.filter((order: Order) => {
          return (
            parseInt(order.cep) >= parseInt(direction.rangeInicio) &&
            parseInt(order.cep) <= parseInt(direction.rangeFim)
          );
        });
      });
      setSelectedOrders(initialOrders);
    } catch (error: unknown) {
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
    const directionOrders = selectedOrders[directionId];
    if (directionOrders && directionOrders.length > 0) {
      const order = directionOrders[0];
      const driver = drivers.find(driver => driver.id === order.id);
      if (driver) {
        const vehicle = vehicles.find(vehicle => vehicle.driverId === driver.id);
        if (vehicle) {
          setSelectedDriver(driver.id);
          setSelectedVehicle(vehicle.id);
          setVehicleValue(vehicle.categoryId);
        }
      }
    }
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setCurrentDirectionId(null);
  };

  const handleDetailsDialogOpen = (order: Order) => {
    setSelectedOrder(order);
    setDetailsDialogOpen(true);
  };

  const handleDetailsDialogClose = () => {
    setDetailsDialogOpen(false);
    setSelectedOrder(null);
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

  const getVehicleValue = (vehicleId: number | string) => {
    const vehicle = vehicles.find(vehicle => vehicle.id === vehicleId);
    if (vehicle) {
      const category = categories.find(c => c.id === vehicle.categoryId);
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
    const maxDirectionValue = getMaxDirectionValue(ordersInDirection);
    const vehicleCategoryValue = getVehicleValue(selectedVehicle);
    return maxDirectionValue + vehicleCategoryValue + tollValue;
  };

  const handleConfirmDelivery = async () => {
    if (!currentDirectionId) return;
  
    const ordersInDirection = selectedOrders[currentDirectionId];
    if (!ordersInDirection || ordersInDirection.length === 0) return;
  
    const { totalWeight, totalValue } = calculateTotalWeightAndValue(ordersInDirection);
    const freightValue = calculateFreightValue();
  
    const deliveryData = {
      motoristaId: selectedDriver as number,
      veiculoId: Number(selectedVehicle), // Garantir que veiculoId é um número
      valorFrete: freightValue,
      totalPeso: totalWeight,
      totalValor: totalValue,
      tenantId: tenantId,
      orders: ordersInDirection.map(order => ({
        id: order.id,
        cliente: order.cliente,
        numero: order.numero,
        // Adicione outros campos necessários
      })), // Incluindo os campos necessários
    };
  
    console.log('Delivery data being sent:', JSON.stringify(deliveryData, null, 2));
  
    try {
      await addDelivery(token, deliveryData);
      setDialogOpen(false);
      setCurrentDirectionId(null);
  
      // Atualize os pedidos para remover os confirmados
      setSelectedOrders(prevState => {
        const updatedOrders = { ...prevState };
        updatedOrders[currentDirectionId!] = updatedOrders[currentDirectionId!].filter(order => !deliveryData.orders.map(o => o.id).includes(order.id));
        return updatedOrders;
      });
  
      // Atualize a lista principal de pedidos
      setOrders(prevOrders => prevOrders.filter(order => !deliveryData.orders.map(o => o.id).includes(order.id)));
  
      // Recarregar dados iniciais
      loadInitialData();
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Failed to create delivery:', error.message);
        setError(error.message);
      } else {
        console.error('Failed to create delivery:', error);
        setError('Failed to create delivery.');
      }
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

            const { totalWeight, totalValue } = calculateTotalWeightAndValue(ordersInDirection);

            return (
              <Grid item xs={12} sm={6} md={4} key={direction.id}>
                <Paper elevation={3} style={{ padding: '16px' }}>
                  <Typography variant="h6">{direction.regiao}</Typography>
                  <Typography variant="body1">CEP: {direction.rangeInicio} - {direction.rangeFim}</Typography>
                  <Typography variant="body1">Total Valor: R$ {totalValue.toFixed(2)}</Typography>
                  <Typography variant="body1">Total Peso: {totalWeight.toFixed(2)} kg</Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    style={{ marginTop: '16px' }}
                    onClick={() => handleGenerateDelivery(direction.id)}
                  >
                    Gerar Rota
                  </Button>
                  <Droppable droppableId={directionId}>
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.droppableProps} style={{ marginTop: '16px' }}>
                        {ordersInDirection.map((order, index) => (
                          <Draggable key={order.id.toString()} draggableId={order.id.toString()} index={index}>
                            {(provided) => (
                              <ListItem ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                <Paper style={{ padding: '8px', marginBottom: '8px', width: '100%' }}>
                                  <ListItemText
                                    primary={`Pedido ${order.numero} - Cliente: ${order.cliente}`}
                                    secondary={`CEP: ${order.cep}, Valor: ${order.valor}, Peso: ${order.peso}`}
                                  />
                                  <IconButton
                                    edge="end"
                                    onClick={() => handleDetailsDialogOpen(order)} // Exibir detalhes do pedido
                                  >
                                    <Info />
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
              <Typography variant="body1" style={{ marginTop: '16px' }}>
                Total Peso: {calculateTotalWeightAndValue(selectedOrders[currentDirectionId!] || []).totalWeight.toFixed(2)} kg
              </Typography>
              <Typography variant="body1">Total Valor: R$ {calculateTotalWeightAndValue(selectedOrders[currentDirectionId!] || []).totalValue.toFixed(2)}</Typography>
              <Typography variant="body1">Valor do Frete: R$ {calculateFreightValue().toFixed(2)}</Typography>
            </div>
          )}
          {tabIndex === 1 && (
            <div>
              <List>
                {selectedOrders[currentDirectionId!]?.map(order => (
                  <ListItem key={order.id}>
                    <ListItemText
                      primary={`Pedido ${order.numero} - Cliente: ${order.cliente}`}
                      secondary={`CEP: ${order.cep}, Valor: ${order.valor}, Peso: ${order.peso}`}
                    />
                    <IconButton
                      edge="end"
                      onClick={() => setSelectedOrders(prevState => {
                        const updatedOrders = { ...prevState };
                        updatedOrders[currentDirectionId!] = updatedOrders[currentDirectionId!].filter(o => o.id !== order.id);
                        return updatedOrders;
                      })}
                    >
                      <Delete />
                    </IconButton>
                  </ListItem>
                ))}
                <Typography variant="body1" style={{ marginTop: '16px' }}>
                  Total Peso: {calculateTotalWeightAndValue(selectedOrders[currentDirectionId!] || []).totalWeight.toFixed(2)} kg
                </Typography>
                <Typography variant="body1">Total Valor: R$ {calculateTotalWeightAndValue(selectedOrders[currentDirectionId!] || []).totalValue.toFixed(2)}</Typography>
              </List>
              <Button
                variant="contained"
                color="secondary"
                style={{ marginTop: '16px' }}
                onClick={() => openGoogleMaps(selectedOrders[currentDirectionId!]?.[0]?.cep || '')}
              >
                Mapa
              </Button>
            </div>
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

      {selectedOrder && (
        <Dialog open={detailsDialogOpen} onClose={handleDetailsDialogClose} fullWidth maxWidth="sm">
          <DialogTitle>Detalhes do Pedido</DialogTitle>
          <DialogContent>
            <Typography variant="body1"><strong>Pedido Número:</strong> {selectedOrder.numero}</Typography>
            <Typography variant="body1"><strong>Data:</strong> {selectedOrder.data}</Typography>
            <Typography variant="body1"><strong>ID Cliente:</strong> {selectedOrder.idCliente}</Typography>
            <Typography variant="body1"><strong>Cliente:</strong> {selectedOrder.cliente}</Typography>
            <Typography variant="body1"><strong>Endereço:</strong> {selectedOrder.endereco}</Typography>
            <Typography variant="body1"><strong>Cidade:</strong> {selectedOrder.cidade}</Typography>
            <Typography variant="body1"><strong>UF:</strong> {selectedOrder.uf}</Typography>
            <Typography variant="body1"><strong>Peso:</strong> {selectedOrder.peso} kg</Typography>
            <Typography variant="body1"><strong>Volume:</strong> {selectedOrder.volume} m³</Typography>
            <Typography variant="body1"><strong>Prazo:</strong> {selectedOrder.prazo}</Typography>
            <Typography variant="body1"><strong>Prioridade:</strong> {selectedOrder.prioridade}</Typography>
            <Typography variant="body1"><strong>Telefone:</strong> {selectedOrder.telefone}</Typography>
            <Typography variant="body1"><strong>Email:</strong> {selectedOrder.email}</Typography>
            <Typography variant="body1"><strong>Bairro:</strong> {selectedOrder.bairro}</Typography>
            <Typography variant="body1"><strong>Valor:</strong> R$ {selectedOrder.valor}</Typography>
            <Typography variant="body1"><strong>Instruções de Entrega:</strong> {selectedOrder.instrucoesEntrega}</Typography>
            <Typography variant="body1"><strong>Nome do Contato:</strong> {selectedOrder.nomeContato}</Typography>
            <Typography variant="body1"><strong>CPF/CNPJ:</strong> {selectedOrder.cpfCnpj}</Typography>
            <Typography variant="body1"><strong>CEP:</strong> {selectedOrder.cep}</Typography>
            <Typography variant="body1"><strong>Status:</strong> {selectedOrder.status}</Typography>
            <Typography variant="body1"><strong>Data de Criação:</strong> {selectedOrder.createdAt}</Typography>
            <Typography variant="body1"><strong>Data de Atualização:</strong> {selectedOrder.updatedAt}</Typography>
            {selectedOrder.Delivery && (
              <>
                <Typography variant="body1"><strong>Data de Entrega:</strong> {selectedOrder.Delivery.dataFim}</Typography>
                {selectedOrder.Delivery.Driver && (
                  <Typography variant="body1"><strong>Motorista:</strong> {selectedOrder.Delivery.Driver.name}</Typography>
                )}
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDetailsDialogClose} color="primary">
              Fechar
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Container>
  );
};

export default withAuth(RoutingPage);
