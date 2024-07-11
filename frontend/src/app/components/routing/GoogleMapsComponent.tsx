import React, { useCallback, useState, useEffect, useRef } from 'react';
import { GoogleMap, DirectionsRenderer } from '@react-google-maps/api';
import axios from 'axios';
import { Paper, Button, Typography, Box, ListItemText, IconButton, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { Delete as DeleteIcon, Info as InfoIcon } from '@mui/icons-material';
import OrderDetailsDialog from './OrderDetailsDialog';
import { fetchTenantData, fetchDrivers, fetchVehicles, fetchCategories, fetchDirections } from '../../../services/auxiliaryService';
import { addDelivery } from '../../../services/deliveryService';
import { Tenant, Order, Driver, Vehicle, Category, Direction } from '../../../types';
import { useGoogleMaps } from '../../context/googleMapsContext';

const API_KEY = 'AIzaSyCI6j3093lkPtwImKxNXLT101hp96uTbn0';

interface GoogleMapsComponentProps {
  tenantId: number;
  orders: Order[];
  onClose: () => void;
  onGenerateRoute: (orderedOrders: Order[]) => void;
}

const containerStyle = {
  width: '100%',
  height: '60%',
};

const panelStyle = {
  width: '100%',
  height: '100%',
  padding: '5px',
  fontSize: '0.55em',
};

const actions = {
  width: '100%',
  height: '40%',
  fontSize: '0.55em',
};

const listContainerStyle = {
  maxHeight: '400px',
  overflowY: 'auto' as 'auto',
};

const center = {
  lat: -15.7942,
  lng: -47.8822,
};

const geocodeAddress = async (address: string) => {
  try {
    const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
      params: {
        address,
        key: API_KEY,
      },
    });
    const { data } = response;
    if (data.status === 'OK' && data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry.location;
      return { lat, lng };
    } else {
      console.error('Geocoding error:', data.status);
      return null;
    }
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

const GoogleMapsComponent: React.FC<GoogleMapsComponentProps> = ({ tenantId, orders, onClose, onGenerateRoute }) => {
  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null);
  const [distance, setDistance] = useState<string | null>(null);
  const [duration, setDuration] = useState<string | null>(null);
  const [tenantAddress, setTenantAddress] = useState<string | null>(null);
  const [orderedOrders, setOrderedOrders] = useState<Order[]>(orders);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<number | string>('');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<number | string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [directions, setDirections] = useState<Direction[]>([]);
  const [freightValue, setFreightValue] = useState<number>(0);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState<boolean>(false);

  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const googleMapsContext = useGoogleMaps();

  const fetchTenantAddress = async (token: string) => {
    try {
      const tenantData: Tenant[] = await fetchTenantData(token);
      if (tenantData && tenantData.length > 0 && tenantData[0].address) {
        return tenantData[0].address;
      }
      return null;
    } catch (error) {
      console.error('Error fetching tenant address:', error);
      return null;
    }
  };

  const fetchInitialData = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      const address = await fetchTenantAddress(token);
      if (address) {
        setTenantAddress(address);
      } else {
        console.error('Tenant address is null or undefined');
      }

      const driversData = await fetchDrivers(token);
      setDrivers(driversData);
      const vehiclesData = await fetchVehicles(token);
      setVehicles(vehiclesData);
      const categoriesData = await fetchCategories(token);
      setCategories(categoriesData);
      const directionsData = await fetchDirections(token);
      setDirections(directionsData);
    }
  };

  const calculateRoute = useCallback(async () => {
    if (orderedOrders.length < 1 || !tenantAddress) return;

    const tenantLocation = await geocodeAddress(tenantAddress);
    if (!tenantLocation) return;

    const waypoints = orderedOrders.map(order => ({
      location: { lat: order.lat, lng: order.lng },
      stopover: true,
    }));

    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin: tenantLocation,
        destination: tenantLocation,
        waypoints,
        optimizeWaypoints: false,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK && result) {
          setDirectionsResponse(result);

          const route = result.routes[0];
          let totalDistance = 0;
          let totalDuration = 0;

          route.legs.forEach((leg: any) => {
            totalDistance += leg.distance.value;
            totalDuration += leg.duration.value;
          });

          setDistance((totalDistance / 1000).toFixed(2) + ' km');
          setDuration((totalDuration / 60).toFixed(2) + ' mins');
        } else {
          console.error(`Error fetching directions ${result}`);
        }
      }
    );
  }, [orderedOrders, tenantAddress]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (mapRef.current) {
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];

      const addMarker = (position: google.maps.LatLngLiteral) => {
        const marker = new google.maps.Marker({
          position,
          map: mapRef.current!,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: 'red',
            fillOpacity: 1,
            strokeWeight: 0,
            scale: 6,
          },
        });

        markersRef.current.push(marker);
      };

      geocodeAddress(tenantAddress!).then((tenantLocation) => {
        if (tenantLocation) {
          addMarker(tenantLocation);
        }

        orderedOrders.forEach((order) => {
          addMarker({ lat: order.lat, lng: order.lng });
        });
      });
    }
    if (tenantAddress) {
      calculateRoute();
    }
  }, [orderedOrders, tenantAddress, calculateRoute]);

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(orderedOrders);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setOrderedOrders(items);
    calculateRoute();
  };

  const handleGenerateRoute = async () => {
    const token = localStorage.getItem('token')!;
    const ordersInDirection = orderedOrders;
    const { totalWeight, totalValue } = calculateTotalWeightAndValue(ordersInDirection);

    const deliveryData = {
      motoristaId: selectedDriver as number,
      veiculoId: Number(selectedVehicle),
      valorFrete: freightValue,
      totalPeso: totalWeight,
      totalValor: totalValue,
      tenantId: tenantId,
      orders: ordersInDirection.map(order => ({
        id: order.id,
        cliente: order.cliente,
        numero: order.numero,
      })),
    };

    try {
      const createdDelivery = await addDelivery(token, deliveryData);
      if (createdDelivery.status === 'A liberar') {
        alert('O roteiro foi enviado para liberação do gestor. Caso deseje adicionar mais pedidos posteriormente, exclua o roteiro.');
      } else {
        alert('Roteiro gerado com sucesso!');
      }
      onGenerateRoute(orderedOrders);
      onClose();
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Failed to create delivery:', error.message);
        alert(`Erro: ${error.message}`);
      } else {
        console.error('Failed to create delivery:', error);
        alert('Erro: Falha ao criar roteiro.');
      }
    }
  };

  const handleDriverChange = (event: SelectChangeEvent<number | string>) => {
    const driverId = event.target.value as number;
    setSelectedDriver(driverId);

    const driverVehicles = vehicles.filter(vehicle => vehicle.driverId === driverId);
    if (driverVehicles.length > 0) {
      const vehicle = driverVehicles[0];
      setSelectedVehicle(vehicle.id);
      setFreightValue(calculateFreightValue(vehicle.categoryId));
    }
  };

  const handleVehicleChange = (event: SelectChangeEvent<number | string>) => {
    const vehicleId = event.target.value as number;
    setSelectedVehicle(vehicleId);

    const vehicle = vehicles.find(vehicle => vehicle.id === vehicleId);
    if (vehicle) {
      setFreightValue(calculateFreightValue(vehicle.categoryId));
    }
  };

  const calculateFreightValue = (categoryId: number): number => {
    const category = categories.find(category => category.id === categoryId);
    const directionValue = directions.length > 0 ? parseFloat(directions[0].valorDirecao) : 0;
    return (category ? category.valor : 0) + directionValue;
  };

  const calculateTotalWeightAndValue = (orders: Order[]) => {
    return orders.reduce(
      (acc, order) => {
        acc.totalWeight += order.peso;
        acc.totalValue += order.valor;
        return acc;
      },
      { totalWeight: 0, totalValue: 0 }
    );
  };

  const handleOpenOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setOrderDetailsOpen(true);
  };

  const handleCloseOrderDetails = () => {
    setOrderDetailsOpen(false);
    setSelectedOrder(null);
  };

  return (
    <Box display="flex">
      <Box flex="2">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={12}
          onLoad={(map) => {
            mapRef.current = map;
          }}
        >
          {directionsResponse && (
            <DirectionsRenderer directions={directionsResponse} />
          )}
        </GoogleMap>
        <Box style={actions}>
          <Typography variant="h6">Seleção de Motorista</Typography>
          <Box display="flex" flexDirection="column" flex="2">
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <FormControl fullWidth margin="normal" style={{ marginRight: '16px' }}>
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
            </Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" marginTop="16px">
              <Typography variant="body2">Total Peso: {calculateTotalWeightAndValue(orderedOrders).totalWeight.toFixed(2)} kg</Typography>
              <Typography variant="body2">Total Valor: R$ {calculateTotalWeightAndValue(orderedOrders).totalValue.toFixed(2)}</Typography>
              <Typography variant="body2">Valor do Frete: R$ {freightValue.toFixed(2)}</Typography>
              {distance && <Typography>Distância Total: {distance}</Typography>}
            </Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" marginTop="16px">
              <Button
                variant="contained"
                color="primary"
                onClick={handleGenerateRoute}
                style={{ marginRight: '8px' }}
              >
                Gerar Rota
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={onClose}
              >
                Fechar
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
      <Box flex="1.5" style={panelStyle}>
        <Paper elevation={3} style={{ padding: '10px' }}>
          <Typography variant="h6">Pedidos</Typography>
          <Box style={listContainerStyle}>
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="orders">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} style={{ marginTop: '8px', overflowY: 'auto', maxHeight: '100%' }}>
                    {orderedOrders.map((order, index) => (
                      <Draggable key={order.id.toString()} draggableId={order.id.toString()} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              ...provided.draggableProps.style,
                              margin: '8px 0',
                              backgroundColor: snapshot.isDragging ? '#e0e0e0' : 'white',
                              padding: '4px',
                            }}
                          >
                            <Paper style={{ padding: '4px', marginBottom: '4px', width: '100%' }}>
                              <ListItemText
                                primary={`Pedido ${index + 1} - Nº ${order.numero} - ${order.cliente}`}
                                secondary={`CEP: ${order.cep}`}
                              />
                              <IconButton edge="end" aria-label="details" onClick={() => handleOpenOrderDetails(order)}>
                                <InfoIcon />
                              </IconButton>
                              <IconButton edge="end" aria-label="delete" onClick={() => setOrderedOrders(orderedOrders.filter(o => o.id !== order.id))}>
                                <DeleteIcon />
                              </IconButton>
                            </Paper>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </Box>
        </Paper>
      </Box>
      <OrderDetailsDialog
        open={orderDetailsOpen}
        onClose={handleCloseOrderDetails}
        order={selectedOrder}
      />
    </Box>
  );
};

export default GoogleMapsComponent;
