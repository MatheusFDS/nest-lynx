import React, { useCallback, useState, useEffect, useRef } from 'react';
import mapboxgl, { LngLatBounds, GeoJSONSource } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import axios from 'axios';
import { Paper, IconButton, Typography, Box, ListItemText, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Delete as DeleteIcon, Info as InfoIcon, Check as CheckIcon, AutoFixHigh as AutoFixHighIcon, EditRoad as EditRoadIcon, Close as CloseIcon } from '@mui/icons-material';
import OrderDetailsDialog from './OrderDetailsDialog';
import { fetchTenantData, fetchDrivers, fetchVehicles, fetchCategories, fetchDirections } from '../../../services/auxiliaryService';
import { addDelivery } from '../../../services/deliveryService';
import { Tenant, Order, Driver, Vehicle, Category, Direction } from '../../../types';
import update from 'immutability-helper';
import { useTheme } from '../../context/ThemeContext';

mapboxgl.accessToken = 'pk.eyJ1IjoibWF0aGV1c2ZkcyIsImEiOiJjbHlpdHB3dDYwamZuMmtvZnVjdTNzbjI3In0.hVf9wJoZ_7mRM_iy09cdWg';

interface MapboxComponentProps {
  tenantId: number;
  orders: Order[];
  onClose: () => void;
  onGenerateRoute: (orderedOrders: Order[]) => void;
}

const containerStyle = {
  width: '100%',
  height: '100%',
};

const panelStyle = {
  width: '100%',
  padding: '5px',
  fontSize: '0.95em',
};

const listContainerStyle = {
  maxHeight: '300px',
  overflowY: 'auto' as 'auto',
};

const geocodeAddress = async (address: string) => {
  try {
    const response = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json`, {
      params: {
        access_token: mapboxgl.accessToken,
      },
    });
    const { data } = response;
    if (data.features && data.features.length > 0) {
      const { center } = data.features[0];
      return { lat: center[1], lng: center[0] };
    } else {
      console.error('Geocoding error:', data.message);
      return null;
    }
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

const ItemTypes = {
  ORDER: 'order',
};

const OrderItem: React.FC<{ order: Order; index: number; moveOrder: (dragIndex: number, hoverIndex: number) => void; removeOrder: (index: number) => void; openOrderDetails: (order: Order) => void; }> = ({ order, index, moveOrder, removeOrder, openOrderDetails }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [, drop] = useDrop({
    accept: ItemTypes.ORDER,
    hover(item: { index: number }, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      moveOrder(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.ORDER,
    item: { type: ItemTypes.ORDER, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <div ref={ref} style={{ opacity: isDragging ? 0 : 1 }}>
      <Paper style={{ padding: '2px', marginBottom: '2px', width: '100%' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <ListItemText
            primary={`Pedido ${index + 1} - Nº ${order.numero} - ${order.cliente}`}
            secondary={`CEP: ${order.cep}`}
            primaryTypographyProps={{ variant: 'body2', style: { fontSize: '0.7em' } }}
            secondaryTypographyProps={{ variant: 'caption', style: { fontSize: '0.6em' } }}
          />
          <Box display="flex" alignItems="center">
            <IconButton edge="end" aria-label="details" onClick={() => openOrderDetails(order)} size="small">
              <InfoIcon fontSize="small" />
            </IconButton>
            <IconButton edge="end" aria-label="delete" onClick={() => removeOrder(index)} size="small">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </Paper>
    </div>
  );
};

const MapboxComponent: React.FC<MapboxComponentProps> = ({ tenantId, orders, onClose, onGenerateRoute }) => {
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
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

  const { isDarkMode } = useTheme();
  const mapContainer = useRef<HTMLDivElement>(null);

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

  const calculateRoute = useCallback(async (useOptimizedRoute: boolean) => {
    if (orderedOrders.length < 1 || !tenantAddress) return;

    const tenantLocation = await geocodeAddress(tenantAddress);
    if (!tenantLocation) return;

    const waypoints = orderedOrders.map(order => `${order.lng},${order.lat}`).join(';');

    const url = useOptimizedRoute
      ? `https://api.mapbox.com/optimized-trips/v1/mapbox/driving/${tenantLocation.lng},${tenantLocation.lat};${waypoints};${tenantLocation.lng},${tenantLocation.lat}?access_token=${mapboxgl.accessToken}&geometries=geojson&roundtrip=true`
      : `https://api.mapbox.com/directions/v5/mapbox/driving/${tenantLocation.lng},${tenantLocation.lat};${waypoints};${tenantLocation.lng},${tenantLocation.lat}?access_token=${mapboxgl.accessToken}&geometries=geojson`;

    try {
      const response = await axios.get(url);

      const data = response.data;
      const route = useOptimizedRoute ? data.trips[0] : data.routes[0];
      if (route) {
        setDistance((route.distance / 1000).toFixed(2) + ' km');
        setDuration((route.duration / 60).toFixed(2) + ' mins');

        if (useOptimizedRoute && route.waypoints) {
          const optimizedOrderIds = route.waypoints.slice(1, -1).map((wp: any) => wp.waypoint_index);
          const newOrderedOrders = optimizedOrderIds.map((index: number) => orderedOrders[index]);
          setOrderedOrders(newOrderedOrders);
        }

        if (map) {
          const source = map.getSource('route') as GeoJSONSource;
          source.setData(route.geometry);

          const coordinates = route.geometry.coordinates;
          const bounds = coordinates.reduce((bounds: mapboxgl.LngLatBounds, coord: [number, number]) => {
            return bounds.extend(coord);
          }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

          map.fitBounds(bounds, {
            padding: { top: 50, bottom: 50, left: 50, right: 50 },
          });

          if (map.getLayer('route-forward')) {
            map.removeLayer('route-forward');
          }
          if (map.getLayer('route-backward')) {
            map.removeLayer('route-backward');
          }

          map.addLayer({
            id: 'route-forward',
            type: 'line',
            source: 'route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round',
            },
            paint: {
              'line-color': '#0000ff', // Azul para ida
              'line-width': 6,
            },
            filter: ['==', '$type', 'LineString'],
          });
        }
      }
    } catch (error) {
      console.error('Error fetching directions:', error);
    }
  }, [orderedOrders, tenantAddress, map]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (mapContainer.current && !map) {
      const initializeMap = async () => {
        const tenantLocation = await geocodeAddress(tenantAddress!);
        if (!tenantLocation) return;

        const initializedMap = new mapboxgl.Map({
          container: mapContainer.current!,
          style: isDarkMode ? 'mapbox://styles/mapbox/navigation-night-v1' : 'mapbox://styles/mapbox/streets-v11',
          center: [tenantLocation.lng, tenantLocation.lat],
          zoom: 12,
        });

        initializedMap.on('load', () => {
          initializedMap.addSource('route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: [],
              },
            },
          });

          setMap(initializedMap);
        });
      };

      initializeMap();
    }
  }, [tenantAddress, isDarkMode]);

  useEffect(() => {
    if (map) {
      const markers: mapboxgl.Marker[] = [];

      const addMarker = (position: { lat: number; lng: number }, index: number) => {
        const el = document.createElement('div');
        el.className = 'marker';
        el.style.backgroundColor = '#ADD8E6';
        el.style.width = '20px';
        el.style.height = '20px';
        el.style.borderRadius = '50%';
        el.style.display = 'flex';
        el.style.justifyContent = 'center';
        el.style.alignItems = 'center';
        el.style.color = 'black';
        el.style.fontSize = '10px';
        el.innerText = String(index);

        new mapboxgl.Marker(el)
          .setLngLat([position.lng, position.lat])
          .addTo(map);

        markers.push(new mapboxgl.Marker(el).setLngLat([position.lng, position.lat]).addTo(map));
      };

      geocodeAddress(tenantAddress!).then((tenantLocation) => {
        if (tenantLocation) {
          addMarker(tenantLocation, 0);
        }

        orderedOrders.forEach((order, index) => {
          addMarker({ lat: order.lat, lng: order.lng }, index + 1);
        });
      });

      return () => {
        markers.forEach(marker => marker.remove());
      };
    }
  }, [map, orderedOrders, tenantAddress]);

  const moveOrder = (dragIndex: number, hoverIndex: number) => {
    const draggedOrder = orderedOrders[dragIndex];
    setOrderedOrders(
      update(orderedOrders, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, draggedOrder],
        ],
      })
    );
    calculateRoute(false);
  };

  const removeOrder = (index: number) => {
    setOrderedOrders(orderedOrders.filter((_, i) => i !== index));
    calculateRoute(false);
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
    <Box display="flex" height="100%">
      <Box flex="3" display="flex" height="100%">
        <div ref={mapContainer} style={containerStyle}></div>
      </Box>
      <Box flex="1" display="flex" flexDirection="column" style={panelStyle} height="100%">
        <Paper elevation={3} style={{ padding: '5px', marginBottom: '5px', flexGrow: 1 }}>
          <Typography variant="h6" style={{ fontSize: '0.85em' }}>Pedidos</Typography>
          <Box style={listContainerStyle}>
            <DndProvider backend={HTML5Backend}>
              {orderedOrders.map((order, index) => (
                <OrderItem
                  key={order.id}
                  index={index}
                  order={order}
                  moveOrder={moveOrder}
                  removeOrder={removeOrder}
                  openOrderDetails={handleOpenOrderDetails}
                />
              ))}
            </DndProvider>
          </Box>
        </Paper>
        <Box mt="auto">
          <Box display="flex" flexDirection="column" gap={1} mb={1}>
            <Typography variant="h6" gutterBottom style={{ fontSize: '0.85em' }}>Seleção de Motorista</Typography>
            <FormControl fullWidth size="small">
              <InputLabel>Motorista</InputLabel>
              <Select value={selectedDriver} onChange={handleDriverChange}>
                {drivers.map(driver => (
                  <MenuItem key={driver.id} value={driver.id}>
                    {driver.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
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
          <Box display="flex" flexDirection="row" gap={1} mb={1}>
            <Typography variant="body2" style={{ fontSize: '0.75em' }}>Total Peso: {calculateTotalWeightAndValue(orderedOrders).totalWeight.toFixed(2)} kg</Typography>
            <Typography variant="body2" style={{ fontSize: '0.75em' }}>Total Valor: R$ {calculateTotalWeightAndValue(orderedOrders).totalValue.toFixed(2)}</Typography>
            <Typography variant="body2" style={{ fontSize: '0.75em' }}>Valor do Frete: R$ {freightValue.toFixed(2)}</Typography>
            {distance && <Typography variant="body2" style={{ fontSize: '0.75em' }}>Distância Total: {distance}</Typography>}
          </Box>
          <Box display="flex" justifyContent="flex-end" alignItems="center" gap={1}>
            <IconButton
              aria-label="automatic"
              color="primary"
              onClick={() => calculateRoute(true)}
              size="small"
            >
              <AutoFixHighIcon />
            </IconButton>
            <IconButton
              aria-label="manual"
              color="primary"
              onClick={() => calculateRoute(false)}
              size="small"
            >
              <EditRoadIcon />
            </IconButton>
            <IconButton
              aria-label="confirm"
              color="primary"
              onClick={handleGenerateRoute}
              size="small"
            >
              <CheckIcon />
            </IconButton>
            <IconButton
              aria-label="close"
              color="secondary"
              onClick={onClose}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>
      <OrderDetailsDialog
        open={orderDetailsOpen}
        onClose={handleCloseOrderDetails}
        order={selectedOrder}
      />
    </Box>
  );
};

export default MapboxComponent;
