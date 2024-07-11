import React, { useCallback, useState, useEffect, useRef } from 'react';
import { GoogleMap, DirectionsRenderer } from '@react-google-maps/api';
import axios from 'axios';
import { fetchTenantData } from '../../../services/auxiliaryService';
import { Tenant, Order } from '../../../types';
import { useGoogleMaps } from '../../context/googleMapsContext';
import { Paper, Button, Typography, Box, List, ListItem, ListItemText, IconButton } from '@mui/material';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { Save as SaveIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material'; // Adicione o Delete aqui

const API_KEY = 'AIzaSyCI6j3093lkPtwImKxNXLT101hp96uTbn0';

interface GoogleMapsComponentProps {
  tenantId: number;
  orders: Order[];
  onClose: () => void;
  onGenerateRoute: (orderedOrders: Order[]) => void;
}

const containerStyle = {
  width: '100%',
  height: '400px',
};

const center = {
  lat: -15.7942,
  lng: -47.8822,
};

const geocodeAddress = async (address: string) => {
  try {
    console.log(`Geocoding address: ${address}`); // Log do endereço a ser geocodificado
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
  const [editable, setEditable] = useState<boolean>(false);
  const [orderedOrders, setOrderedOrders] = useState<Order[]>(orders);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const googleMapsContext = useGoogleMaps();

  const fetchTenantAddress = async (token: string) => {
    try {
      const tenantData: Tenant[] = await fetchTenantData(token); // Ajuste para retornar um array de tenants
      console.log('Fetched tenant data:', tenantData); // Log para verificar os dados do tenant
      if (tenantData && tenantData.length > 0 && tenantData[0].address) {
        return tenantData[0].address;
      }
      return null;
    } catch (error) {
      console.error('Error fetching tenant address:', error);
      return null;
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
        optimizeWaypoints: false, // Não permitir a otimização da ordem das paradas
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

          console.log(`Distance: ${(totalDistance / 1000).toFixed(2)} km`);
          console.log(`Duration: ${(totalDuration / 60).toFixed(2)} mins`);
        } else {
          console.error(`Error fetching directions ${result}`);
        }
      }
    );
  }, [orderedOrders, tenantAddress]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchTenantAddress(token).then(address => {
        if (address) {
          console.log(`Tenant address set: ${address}`); // Log do endereço definido
          setTenantAddress(address);
        } else {
          console.error('Tenant address is null or undefined');
        }
      });
    }
  }, []);

  useEffect(() => {
    if (mapRef.current) {
      markersRef.current.forEach(marker => marker.setMap(null)); // Remover marcadores anteriores
      markersRef.current = [];

      // Adicionar marcador para o endereço do tenant
      const addMarker = (position: google.maps.LatLngLiteral, label: string) => {
        const marker = new google.maps.Marker({
          position,
          label,
          map: mapRef.current!,
          icon: {
            url: `https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld=${label}|FF0000|000000`,
            scaledSize: new google.maps.Size(40, 40),
          },
        });
        markersRef.current.push(marker);
      };

      geocodeAddress(tenantAddress!).then((tenantLocation) => {
        if (tenantLocation) {
          addMarker(tenantLocation, '0');
        }

        orderedOrders.forEach((order, index) => {
          addMarker({ lat: order.lat, lng: order.lng }, (index + 1).toString());
        });
      });
    }
    if (tenantAddress) {
      calculateRoute(); // Calcular a rota automaticamente ao carregar o mapa
    }
  }, [orderedOrders, tenantAddress, calculateRoute]);

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(orderedOrders);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setOrderedOrders(items);
  };

  const handleGenerateRoute = () => {
    onGenerateRoute(orderedOrders);
  };

  return (
    <Box>
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
      <Paper elevation={3} style={{ padding: '16px', marginTop: '16px' }}>
        <Typography variant="h6">Informações da Rota</Typography>
        {distance && <Typography>Distância: {distance}</Typography>}
        {duration && <Typography>Duração: {duration}</Typography>}
        <Box display="flex" justifyContent="space-between" alignItems="center" style={{ marginTop: '16px' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={calculateRoute}
            style={{ marginRight: '8px' }}
          >
            Recalcular Rota
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={onClose}
            style={{ marginRight: '8px' }}
          >
            Fechar
          </Button>
          <IconButton
            color="default"
            onClick={() => setEditable(!editable)}
          >
            {editable ? <SaveIcon /> : <EditIcon />}
          </IconButton>
        </Box>
        {editable && (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="orders">
              {(provided) => (
                <List {...provided.droppableProps} ref={provided.innerRef}>
                  {orderedOrders.map((order, index) => (
                    <Draggable key={order.id} draggableId={order.id.toString()} index={index}>
                      {(provided) => (
                        <ListItem
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{ ...provided.draggableProps.style, margin: '8px 0' }}
                        >
                          <ListItemText
                            primary={`Pedido ${index + 1} - ${order.cliente}`}
                            secondary={`CEP: ${order.cep}, Endereço: ${order.endereco}, Cidade: ${order.cidade}`}
                          />
                          <IconButton edge="end" aria-label="delete" onClick={() => {
                            setOrderedOrders(orderedOrders.filter(o => o.id !== order.id));
                          }}>
                            <DeleteIcon />
                          </IconButton>
                        </ListItem>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </List>
              )}
            </Droppable>
          </DragDropContext>
        )}
        <Button
          variant="contained"
          color="primary"
          onClick={handleGenerateRoute}
          style={{ marginTop: '16px' }}
        >
          Gerar Rota
        </Button>
      </Paper>
    </Box>
  );
};

export default GoogleMapsComponent;
