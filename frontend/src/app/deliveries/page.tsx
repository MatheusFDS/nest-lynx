'use client';

import React, { useEffect, useState } from 'react';
import { Typography, Container, Button, Paper, TextField, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions, Tabs, Tab, Select, MenuItem, FormControl, InputLabel, List, ListItem, ListItemText } from '@mui/material';
import { Delivery, Driver, Vehicle, Order } from '../../types';
import withAuth from '../components/withAuth';
import { fetchDeliveries, addDelivery, updateDelivery, deleteDelivery } from '../../services/deliveryService';
import { fetchDrivers, fetchVehicles, fetchOrders } from '../../services/auxiliaryService';
import { Delete, Edit } from '@mui/icons-material';
import { SelectChangeEvent } from '@mui/material/Select';

const DeliveriesPage: React.FC = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState<Delivery[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [newDelivery, setNewDelivery] = useState<Partial<Delivery>>({});
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tabIndex, setTabIndex] = useState(0);

  const token = localStorage.getItem('token') || '';

  const loadDeliveries = async () => {
    try {
      const data = await fetchDeliveries(token);
      setDeliveries(data);
      setFilteredDeliveries(data);
    } catch (error) {
      setError('Failed to fetch deliveries.');
    }
  };

  const loadAuxiliaryData = async () => {
    try {
      const [driversData, vehiclesData, ordersData] = await Promise.all([
        fetchDrivers(token),
        fetchVehicles(token),
        fetchOrders(token)
      ]);
      setDrivers(driversData);
      setVehicles(vehiclesData);
      setOrders(ordersData);
    } catch (error) {
      setError('Failed to fetch auxiliary data.');
    }
  };

  useEffect(() => {
    loadDeliveries();
    loadAuxiliaryData();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    const filtered = deliveries.filter(delivery =>
      delivery.id.toString().includes(e.target.value)
    );
    setFilteredDeliveries(filtered);
  };

  const handleAddDelivery = async () => {
    try {
      if (selectedDelivery) {
        await updateDelivery(token, selectedDelivery.id, { ...newDelivery });
      } else {
        const tenantId = JSON.parse(atob(token.split('.')[1])).tenantId;
        await addDelivery(token, { ...newDelivery, tenantId });
      }
      setNewDelivery({});
      setSelectedDelivery(null);
      setShowForm(false);
      loadDeliveries();
    } catch (error) {
      setError('Failed to submit delivery.');
    }
  };

  const handleEdit = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setNewDelivery(delivery);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteDelivery(token, id);
      loadDeliveries();
    } catch (error) {
      setError('Failed to delete delivery.');
    }
  };

  const handleFormClose = () => {
    setSelectedDelivery(null);
    setNewDelivery({});
    setShowForm(false);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  const handleRemoveOrder = (orderId: number) => {
    setNewDelivery(prevState => ({
      ...prevState,
      orders: prevState.orders?.filter(order => order.id !== orderId)
    }));
  };

  const handleAddOrder = (orderId: number) => {
    if (!newDelivery.orders?.find(order => order.id === orderId)) {
      setNewDelivery(prevState => ({
        ...prevState,
        orders: [...(prevState.orders || []), { id: orderId, numero: '', cliente: '', valor: 0, peso: 0 }]
      }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewDelivery(prevState => ({
      ...prevState,
      [name]: name === 'valorFrete' || name === 'totalPeso' || name === 'totalValor' ? parseFloat(value) : value
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent<number | string>) => {
    const { name, value } = e.target;
    setNewDelivery(prevState => ({
      ...prevState,
      [name as string]: value
    }));
  };

  return (
    <Container>
      {error && <Typography color="error">{error}</Typography>}
      <TextField
        label="Search Deliveries"
        value={searchTerm}
        onChange={handleSearch}
        fullWidth
        margin="normal"
      />
      <Button variant="contained" color="primary" onClick={() => setShowForm(true)}>
        Add Delivery
      </Button>
      {showForm && (
        <Dialog open={showForm} onClose={handleFormClose} fullWidth maxWidth="md">
          <DialogTitle>{selectedDelivery ? 'Edit Delivery' : 'Add Delivery'}</DialogTitle>
          <DialogContent>
            <Tabs value={tabIndex} onChange={handleTabChange}>
              <Tab label="Data" />
              <Tab label="Orders" />
            </Tabs>
            <TabPanel value={tabIndex} index={0}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Motorista</InputLabel>
                <Select
                  name="motoristaId"
                  value={newDelivery.motoristaId || ''}
                  onChange={handleSelectChange}
                >
                  {drivers.map((driver) => (
                    <MenuItem key={driver.id} value={driver.id}>
                      {driver.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth margin="normal">
                <InputLabel>Veículo</InputLabel>
                <Select
                  name="veiculoId"
                  value={newDelivery.veiculoId || ''}
                  onChange={handleSelectChange}
                >
                  {vehicles.map((vehicle) => (
                    <MenuItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.model}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Valor Frete"
                name="valorFrete"
                value={newDelivery.valorFrete !== undefined ? newDelivery.valorFrete.toString() : ''}
                onChange={handleInputChange}
                type="number"
                fullWidth
                margin="normal"
              />
              <TextField
                label="Total Peso"
                name="totalPeso"
                value={newDelivery.totalPeso !== undefined ? newDelivery.totalPeso.toString() : ''}
                onChange={handleInputChange}
                type="number"
                fullWidth
                margin="normal"
              />
              <TextField
                label="Total Valor"
                name="totalValor"
                value={newDelivery.totalValor !== undefined ? newDelivery.totalValor.toString() : ''}
                onChange={handleInputChange}
                type="number"
                fullWidth
                margin="normal"
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={newDelivery.status || ''}
                  onChange={handleSelectChange}
                >
                  <MenuItem value="Em rota">Em rota</MenuItem>
                  <MenuItem value="Finalizado">Finalizado</MenuItem>
                </Select>
              </FormControl>
            </TabPanel>
            <TabPanel value={tabIndex} index={1}>
              <List>
                {orders.filter(order => newDelivery.orders?.map(o => o.id).includes(order.id)).map((order) => (
                  <ListItem key={order.id}>
                    <ListItemText
                      primary={`Pedido ${order.numero} - Cliente: ${order.cliente}`}
                      secondary={`Valor: ${order.valor}, Peso: ${order.peso}`}
                    />
                    <IconButton edge="end" onClick={() => handleRemoveOrder(order.id)}>
                      <Delete />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
              <List>
                {orders.filter(order => !newDelivery.orders?.map(o => o.id).includes(order.id)).map((order) => (
                  <ListItem button key={order.id} onClick={() => handleAddOrder(order.id)}>
                    <ListItemText
                      primary={`Pedido ${order.numero} - Cliente: ${order.cliente}`}
                      secondary={`Valor: ${order.valor}, Peso: ${order.peso}`}
                    />
                  </ListItem>
                ))}
              </List>
            </TabPanel>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleFormClose} color="secondary">
              Cancel
            </Button>
            <Button onClick={handleAddDelivery} color="primary">
              {selectedDelivery ? 'Update Delivery' : 'Add Delivery'}
            </Button>
          </DialogActions>
        </Dialog>
      )}
      <TableContainer component={Paper} style={{ marginTop: '16px' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Delivery ID</TableCell>
              <TableCell>Motorista ID</TableCell>
              <TableCell>Veículo ID</TableCell>
              <TableCell>Valor Frete</TableCell>
              <TableCell>Total Peso</TableCell>
              <TableCell>Total Valor</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredDeliveries.map((delivery) => (
              <TableRow key={delivery.id}>
                <TableCell>{delivery.id}</TableCell>
                <TableCell>{delivery.motoristaId}</TableCell>
                <TableCell>{delivery.veiculoId}</TableCell>
                <TableCell>{delivery.valorFrete}</TableCell>
                <TableCell>{delivery.totalPeso}</TableCell>
                <TableCell>{delivery.totalValor}</TableCell>
                <TableCell>{delivery.status}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(delivery)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(delivery.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

function TabPanel(props: { children?: React.ReactNode; index: number; value: number }) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <div>{children}</div>}
    </div>
  );
}

export default withAuth(DeliveriesPage);
