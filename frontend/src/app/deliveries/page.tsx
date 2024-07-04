'use client';

import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Button,
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
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { Delete, Info, Map, Edit } from '@mui/icons-material';
import { fetchDeliveries, updateDelivery, removeOrderFromDelivery, deleteDelivery } from '../../services/deliveryService';
import { fetchDrivers, fetchVehicles, fetchCategories, fetchDirections } from '../../services/auxiliaryService';
import { Order, Driver, Vehicle, Category, Delivery, Direction } from '../../types';
import withAuth from '../components/withAuth';
import { SelectChangeEvent } from '@mui/material/Select';

const DeliveriesPage: React.FC = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [directions, setDirections] = useState<Direction[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<number | string>('');
  const [selectedVehicle, setSelectedVehicle] = useState<number | string>('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [error, setError] = useState<string>('');
  const [currentDelivery, setCurrentDelivery] = useState<Delivery | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [tabIndex, setTabIndex] = useState(0);
  const [tollValue, setTollValue] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string }>({ startDate: '', endDate: '' });

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
    setCurrentDelivery({
      ...delivery,
      status: delivery.status || 'Em Rota',  // Define 'Em Rota' como valor padrão se o status for indefinido
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

  const handleDriverChange = (e: SelectChangeEvent<number | string>) => {
    const driverId = e.target.value as number;
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

  const handleVehicleChange = (e: SelectChangeEvent<number | string>) => {
    const vehicleId = e.target.value as number;
    setSelectedVehicle(vehicleId);
  };

  const getVehicleValue = (vehicleId: number | string) => {
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
      motoristaId: selectedDriver as number,
      veiculoId: Number(selectedVehicle),
      valorFrete: getVehicleValue(selectedVehicle) + tollValue,
      totalPeso: totalWeight,
      totalValor: totalValue,
      status: currentDelivery.status,
      dataInicio: currentDelivery.dataInicio,
      dataFim: currentDelivery.dataFim,
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

  const handleDeleteDelivery = async (deliveryId: number) => {
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
  };

  const filteredDeliveries = deliveries.filter((delivery) => {
    const { startDate, endDate } = dateRange;
    if (searchTerm) {
      return delivery.orders.some(order => order.cliente.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const dataInicio = new Date(delivery.dataInicio);
      return dataInicio >= start && dataInicio <= end;
    }
    return true;
  });

  const getRegionName = (delivery: Delivery) => {
    const orderCep = delivery.orders[0]?.cep;
    const direction = directions.find(dir => parseInt(orderCep) >= parseInt(dir.rangeInicio) && parseInt(orderCep) <= parseInt(dir.rangeFim));
    return direction ? direction.regiao : 'N/A';
  };

  return (
    <Container>
      {error && <Typography color="error">{error}</Typography>}
      <Grid container spacing={2} alignItems="center" style={{ marginBottom: '16px' }}>
        <Grid item xs={12} md={6}>
          <TextField
            label="Buscar"
            value={searchTerm}
            onChange={handleSearch}
            fullWidth
            margin="normal"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <TextField
            label="Data Início"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={dateRange.startDate}
            onChange={handleDateFilter}
            name="startDate"
            fullWidth
            margin="normal"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <TextField
            label="Data Fim"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={dateRange.endDate}
            onChange={handleDateFilter}
            name="endDate"
            fullWidth
            margin="normal"
          />
        </Grid>
      </Grid>
      <Grid container spacing={3}>
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
              {filteredDeliveries.map(delivery => {
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
                    <TableCell>{delivery.dataInicio ? new Date(delivery.dataInicio).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell>{delivery.dataFim ? new Date(delivery.dataFim).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell>{delivery.status}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEditDelivery(delivery)}>
                        <Edit />
                      </IconButton>
                      <IconButton onClick={() => openGoogleMaps(delivery.orders[0]?.cep || '')}>
                        <Map />
                      </IconButton>
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
      </Grid>

      <Dialog open={dialogOpen} onClose={handleDialogClose} fullWidth maxWidth="md">
        <DialogTitle>Editar Roteiro</DialogTitle>
        <DialogContent>
          <Tabs value={tabIndex} onChange={(e, newValue) => setTabIndex(newValue)}>
            <Tab label="DADOS" />
            <Tab label="NOTAS" />
          </Tabs>
          {tabIndex === 0 && currentDelivery && (
            <div>
              <div>
                <Typography variant="h6">Informações da Rota</Typography>
                <Typography>ID da Rota: {currentDelivery.id}</Typography>
                <Typography>Nome da Região: {getRegionName(currentDelivery)}</Typography>
              </div>
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
                label="Valor do Pedágio"
                type="number"
                fullWidth
                margin="normal"
                value={tollValue}
                onChange={(e) => setTollValue(Number(e.target.value))}
              />
              <FormControl fullWidth margin="normal">
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  value={currentDelivery.status}
                  onChange={(e) => setCurrentDelivery(currentDelivery ? { ...currentDelivery, status: e.target.value as string } : null)}
                >
                  <MenuItem value="Em Rota">Em Rota</MenuItem>
                  <MenuItem value="Finalizado">Finalizado</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Data Início"
                type="date"
                fullWidth
                margin="normal"
                InputLabelProps={{ shrink: true }}
                value={currentDelivery.dataInicio ? new Date(currentDelivery.dataInicio).toISOString().split('T')[0] : ''}
                onChange={(e) => setCurrentDelivery({ ...currentDelivery, dataInicio: new Date(e.target.value) })}
              />
              <TextField
                label="Data Finalização"
                type="date"
                fullWidth
                margin="normal"
                InputLabelProps={{ shrink: true }}
                value={currentDelivery.dataFim ? new Date(currentDelivery.dataFim).toISOString().split('T')[0] : ''}
                onChange={(e) => setCurrentDelivery({ ...currentDelivery, dataFim: new Date(e.target.value) })}
              />
            </div>
          )}
          {tabIndex === 1 && (
            <div>
              <List>
                {currentDelivery?.orders.map(order => (
                  <ListItem key={order.id}>
                    <ListItemText
                      primary={`Pedido ${order.numero} - Cliente: ${order.cliente}`}
                      secondary={`CEP: ${order.cep}, Valor: ${order.valor}, Peso: ${order.peso}`}
                    />
                    <IconButton
                      edge="end"
                      onClick={async () => {
                        await removeOrderFromDelivery(token, currentDelivery.id, order.id);
                        setCurrentDelivery(prevState => {
                          if (prevState) {
                            return {
                              ...prevState,
                              orders: prevState.orders.filter(o => o.id !== order.id),
                            };
                          }
                          return null;
                        });
                      }}
                    >
                      <Delete />
                    </IconButton>
                  </ListItem>
                ))}
                <Typography variant="body1" style={{ marginTop: '16px' }}>
                  Total Peso: {calculateTotalWeightAndValue(currentDelivery?.orders as Order[] || []).totalWeight.toFixed(2)} kg
                </Typography>
                <Typography variant="body1">Total Valor: R$ {calculateTotalWeightAndValue(currentDelivery?.orders as Order[] || []).totalValue.toFixed(2)}</Typography>
              </List>
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

export default withAuth(DeliveriesPage);
