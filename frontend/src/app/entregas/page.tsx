'use client'
// REATORAÇÃO: Adicionado useReducer para um melhor gerenciamento de estado.
import { useEffect, useState, useCallback, useMemo, useReducer } from 'react'

declare global {
  interface Window {
    google?: any;
  }
}
import {
  Box, Typography, Button, Card, CardContent, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, Chip,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, InputLabel, Select, MenuItem, Alert,
  CircularProgress, Tooltip, Stepper, Step, StepLabel, Checkbox,
  List, ListItem, ListItemText, ListItemIcon, ListItemButton,
  Divider, Stack, InputAdornment, Badge, Fab, Avatar
} from '@mui/material'
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  LocalShipping as DeliveryIcon,
  Assignment as OrderIcon,
  MyLocation as MyLocationIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  PlayArrow as PlayIcon,
  Refresh as RefreshIcon,
  Send as SendIcon,
  Close as CloseIcon,
} from '@mui/icons-material'
// CORREÇÃO: `useJsApiLoader` é importado para carregar o Google Maps de forma mais estável que o LoadScript.
import { GoogleMap, useJsApiLoader, Marker, DirectionsService, DirectionsRenderer, InfoWindow } from '@react-google-maps/api'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'
import type {
  Delivery, Driver, Vehicle, Order, CreateDeliveryDto, Direction, Category
} from '../types/api'
import AppLayout from '../components/layout/AppLayout'
import AuthGuard from '../components/guards/AuthGuard'
import RoleGuard from '../components/guards/RoleGuard'

// REATORAÇÃO: O estado complexo do wizard é centralizado aqui.
const wizardInitialState = {
  isOpen: false,
  activeStep: 0,
  creating: false,
  calculating: false,
  selectedOrders: [] as Order[],
  searchTerm: '',
  filterRegion: '',
  startingPoint: '',
  routePoints: [] as MapPoint[],
  directionsResponse: null as google.maps.DirectionsResult | null,
  selectedMarker: null as string | null,
  geocodedOrders: [] as any[],
  selectedDriver: '',
  selectedVehicle: '',
  observacao: '',
  calculatedFreight: 0,
};

type WizardAction =
  | { type: 'OPEN_WIZARD' }
  | { type: 'CLOSE_WIZARD' }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'SET_STATE'; payload: Partial<typeof wizardInitialState> }
  | { type: 'TOGGLE_ORDER'; payload: Order }
  | { type: 'SET_ORDER_SEQUENCE'; payload: Order[] }
  | { type: 'SET_ALL_FILTERED_ORDERS'; payload: Order[] }
  | { type: 'CLEAR_SELECTED_ORDERS' };

function wizardReducer(state: typeof wizardInitialState, action: WizardAction): typeof wizardInitialState {
  switch (action.type) {
    case 'OPEN_WIZARD': return { ...state, isOpen: true };
    case 'CLOSE_WIZARD': return { ...wizardInitialState };
    case 'NEXT_STEP': return { ...state, activeStep: state.activeStep + 1 };
    case 'PREV_STEP': return { ...state, activeStep: state.activeStep - 1 };
    case 'SET_STATE': return { ...state, ...action.payload };
    case 'TOGGLE_ORDER': {
      const isSelected = state.selectedOrders.some(o => o.id === action.payload.id);
      const newSelectedOrders = isSelected
        ? state.selectedOrders.filter(o => o.id !== action.payload.id)
        : [...state.selectedOrders, action.payload];
      return { ...state, selectedOrders: newSelectedOrders };
    }
    case 'SET_ORDER_SEQUENCE': return { ...state, selectedOrders: action.payload };
    case 'SET_ALL_FILTERED_ORDERS': return { ...state, selectedOrders: action.payload };
    case 'CLEAR_SELECTED_ORDERS': return { ...state, selectedOrders: [] };
    default: throw new Error(`Ação não tratada`);
  }
}

const steps = ['Selecionar Pedidos', 'Roteirização', 'Escolher Veículos', 'Confirmar Envio'];
const mapContainerStyle = { width: '100%', height: '100%' };
const mapOptions = { disableDefaultUI: true, zoomControl: true, mapTypeControl: false, streetViewControl: false, fullscreenControl: false };
const centerBrazil = { lat: -14.235, lng: -51.9253 };
const googleMapsLibraries: ('places' | 'geometry')[] = ['places', 'geometry'];

interface MapPoint {
  id: string;
  lat: number;
  lng: number;
  title: string;
  type: 'start' | 'delivery';
  orderId?: string;
  address?: string;
}

// Componente separado para o mapa que só carrega quando temos a API key
interface MapContainerProps {
  apiKey: string;
  wizardState: typeof wizardInitialState;
  dispatchWizard: React.Dispatch<WizardAction>;
  directionsCallback: (response: google.maps.DirectionsResult | null, status: google.maps.DirectionsStatus) => void;
  directionsOptions: any;
}

function MapContainer({ apiKey, wizardState, dispatchWizard, directionsCallback, directionsOptions }: MapContainerProps) {
  const { isLoaded: isMapLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
    libraries: googleMapsLibraries,
    language: 'pt-BR',
  });

  if (!isMapLoaded) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Carregando mapa...</Typography>
      </Box>
    );
  }

  return (
    <GoogleMap mapContainerStyle={mapContainerStyle} options={mapOptions} center={centerBrazil} zoom={4}>
      {wizardState.routePoints.map((point, index) => (
        <Marker 
          key={point.id} 
          position={{ lat: point.lat, lng: point.lng }} 
          label={point.type === 'start' ? 'P' : (index).toString()} 
          title={point.title} 
          onClick={() => dispatchWizard({ type: 'SET_STATE', payload: { selectedMarker: point.id } })} 
        />
      ))}
      {wizardState.selectedMarker && (() => { 
        const point = wizardState.routePoints.find(p => p.id === wizardState.selectedMarker); 
        return point ? (
          <InfoWindow 
            position={{lat: point.lat, lng: point.lng}} 
            onCloseClick={() => dispatchWizard({ type: 'SET_STATE', payload: { selectedMarker: null } })}
          >
            <div><strong>{point.title}</strong></div>
          </InfoWindow>
        ) : null; 
      })()}
      {directionsOptions && !wizardState.directionsResponse && (
        <DirectionsService options={directionsOptions} callback={directionsCallback} />
      )}
      {wizardState.directionsResponse && (
        <DirectionsRenderer options={{ directions: wizardState.directionsResponse, suppressMarkers: true }} />
      )}
    </GoogleMap>
  );
}

export default function EntregasPage() {
  const { user } = useAuth();

  // REATORAÇÃO: Múltiplos `useState` do wizard substituídos por um `useReducer`.
  const [wizardState, dispatchWizard] = useReducer(wizardReducer, wizardInitialState);
  
  // Estados que pertencem à página principal, e não ao wizard.
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [viewDeliveryOpen, setViewDeliveryOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionTargetId, setRejectionTargetId] = useState<string | null>(null);
  
  const [apiKey, setApiKey] = useState<string>('');
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  // REATORAÇÃO: `useMemo` para calcular valores derivados. Evita `useState` e `useEffect` desnecessários.
  const { totalValue, totalWeight, freightPercentage } = useMemo(() => {
    const total = wizardState.selectedOrders.reduce((sum, order) => sum + order.valor, 0);
    const weight = wizardState.selectedOrders.reduce((sum, order) => sum + order.peso, 0);
    const percentage = total > 0 && wizardState.calculatedFreight > 0 ? (wizardState.calculatedFreight / total) * 100 : 0;
    return { totalValue: total, totalWeight: weight, freightPercentage: percentage };
  }, [wizardState.selectedOrders, wizardState.calculatedFreight]);

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const [deliveriesData, driversData, vehiclesData, ordersData, keyResponse] = await Promise.all([
        api.getDeliveries(), api.getDrivers(), api.getVehicles(), api.getOrders(), api.getGoogleMapsApiKey()
      ]);
      setDeliveries(deliveriesData);
      setDrivers(driversData);
      setVehicles(vehiclesData);
      setAvailableOrders(ordersData.filter(order => order.status === 'Sem rota'));
      if (keyResponse.apiKey) {
        setApiKey(keyResponse.apiKey);
      } else {
        setError('Não foi possível carregar a chave da API de mapas.');
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados da página');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const geocodeOrderAddresses = useCallback(async () => {
    if (wizardState.selectedOrders.length === 0) return;
    dispatchWizard({ type: 'SET_STATE', payload: { calculating: true } });
    try {
      const addresses = wizardState.selectedOrders.map(order => `${order.endereco}, ${order.cidade}-${order.uf}, CEP: ${order.cep}`);
      const geocodeResults = await api.geocodeAddresses(addresses);
      const successfulResults = geocodeResults
        .map((result, index) => ({ ...wizardState.selectedOrders[index], ...result }))
        .filter(result => result.success);
      dispatchWizard({ type: 'SET_STATE', payload: { geocodedOrders: successfulResults } });
    } catch (err) {
      console.error('Erro ao geocodificar endereços:', err);
      setError('Erro ao carregar endereços no mapa');
    } finally {
      dispatchWizard({ type: 'SET_STATE', payload: { calculating: false } });
    }
  }, [wizardState.selectedOrders]);

  useEffect(() => {
    if (wizardState.activeStep === 1 && wizardState.geocodedOrders.length !== wizardState.selectedOrders.length) {
      geocodeOrderAddresses();
    }
  }, [wizardState.activeStep, wizardState.selectedOrders.length, wizardState.geocodedOrders.length, geocodeOrderAddresses]);

  useEffect(() => {
    const fetchFreightPreview = async () => {
      if (wizardState.selectedOrders.length > 0 && wizardState.selectedVehicle) {
        try {
          const orderIds = wizardState.selectedOrders.map(o => o.id);
          const response = await api.calculateFreightPreview({ orderIds, vehicleId: wizardState.selectedVehicle });
          dispatchWizard({ type: 'SET_STATE', payload: { calculatedFreight: response.calculatedFreight } });
        } catch (err) {
          dispatchWizard({ type: 'SET_STATE', payload: { calculatedFreight: 0 } });
          setError('Não foi possível estimar o frete.');
        }
      } else if (wizardState.calculatedFreight !== 0) {
        dispatchWizard({ type: 'SET_STATE', payload: { calculatedFreight: 0 } });
      }
    };
    fetchFreightPreview();
  }, [wizardState.selectedOrders, wizardState.selectedVehicle, wizardState.calculatedFreight]);

  const handleNext = () => {
    if (wizardState.activeStep === 0 && wizardState.selectedOrders.length === 0) { setError('Selecione pelo menos um pedido'); return; }
    if (wizardState.activeStep === 1 && !wizardState.startingPoint.trim()) { setError('Digite o ponto de partida'); return; }
    if (wizardState.activeStep === 2 && (!wizardState.selectedDriver || !wizardState.selectedVehicle)) { setError('Selecione motorista e veículo'); return; }
    setError('');
    dispatchWizard({ type: 'NEXT_STEP' });
  };
  
  const handleBack = () => dispatchWizard({ type: 'PREV_STEP' });

  const handleSetStartingPoint = async () => {
    if (!wizardState.startingPoint.trim()) return;
    dispatchWizard({ type: 'SET_STATE', payload: { calculating: true } });
    try {
      const results = await api.geocodeAddresses([wizardState.startingPoint]);
      const startResult = results[0];
      if (startResult && startResult.success) {
        const mapPoint: MapPoint = { id: 'start', lat: startResult.lat, lng: startResult.lng, title: startResult.formatted_address, type: 'start' };
        dispatchWizard({ type: 'SET_STATE', payload: { routePoints: [mapPoint], directionsResponse: null } });
      } else { setError('Não foi possível localizar o endereço de partida.'); }
    } catch (err) { setError('Erro ao definir o ponto de partida.'); } finally { dispatchWizard({ type: 'SET_STATE', payload: { calculating: false } }); }
  };
  
  const handleOrderClickOnMap = (order: any) => {
    if (wizardState.routePoints.length === 0) { setError('Defina o ponto de partida primeiro!'); return; }
    const isAlreadyInRoute = wizardState.routePoints.some(p => p.orderId === order.id);
    let newRoutePoints: MapPoint[];
    if (isAlreadyInRoute) {
      newRoutePoints = wizardState.routePoints.filter(p => p.orderId !== order.id);
    } else {
      const newPoint: MapPoint = { id: order.id, lat: order.lat, lng: order.lng, title: `${order.numero} - ${order.cliente}`, type: 'delivery', orderId: order.id, address: order.formatted_address, };
      newRoutePoints = [...wizardState.routePoints, newPoint];
    }
    dispatchWizard({ type: 'SET_STATE', payload: { routePoints: newRoutePoints, directionsResponse: null } });
  };
  
  const directionsCallback = useCallback((response: google.maps.DirectionsResult | null, status: google.maps.DirectionsStatus) => {
    if (status === 'OK' && response) {
      dispatchWizard({ type: 'SET_STATE', payload: { directionsResponse: response } });
    } else { console.error('Directions request failed due to ' + status); setError('Não foi possível traçar a rota.'); }
  }, []);
  
  const directionsOptions = useMemo(() => {
    if (wizardState.routePoints.length < 2) return null;
    const { routePoints } = wizardState;
    return {
      origin: { lat: routePoints[0].lat, lng: routePoints[0].lng },
      destination: { lat: routePoints[routePoints.length - 1].lat, lng: routePoints[routePoints.length - 1].lng },
      waypoints: routePoints.slice(1, -1).map(p => ({ location: { lat: p.lat, lng: p.lng } })),
      travelMode: 'DRIVING' as google.maps.TravelMode,
    };
  }, [wizardState.routePoints]);

  const handleCreateDelivery = async () => {
    try {
      dispatchWizard({ type: 'SET_STATE', payload: { creating: true } });
      setError('');
      const deliveryData: CreateDeliveryDto = { motoristaId: wizardState.selectedDriver, veiculoId: wizardState.selectedVehicle, orders: wizardState.selectedOrders.map((order, index) => ({ id: order.id, sorting: index + 1 })), observacao: wizardState.observacao || undefined };
      await api.createDelivery(deliveryData);
      setSuccess('Roteiro criado com sucesso!');
      dispatchWizard({ type: 'CLOSE_WIZARD' });
      loadInitialData();
    } catch (err) {
      console.error('Erro ao criar roteiro:', err);
      setError('Erro ao criar roteiro');
    } finally {
      dispatchWizard({ type: 'SET_STATE', payload: { creating: false } });
    }
  };

  const handleApproveDelivery = async (deliveryId: string) => {
    try { await api.liberarRoteiro(deliveryId); setSuccess('Roteiro liberado com sucesso!'); loadInitialData(); }
    catch (err) { console.error('Erro ao liberar roteiro:', err); setError('Erro ao liberar roteiro'); }
  };

  const handleRejectDelivery = async () => {
    if (!rejectionTargetId || !rejectionReason.trim()) { setError('O motivo da rejeição é obrigatório.'); return; }
    try { await api.rejeitarRoteiro(rejectionTargetId, rejectionReason); setSuccess('Roteiro rejeitado com sucesso!'); loadInitialData(); }
    catch (err) { console.error('Erro ao rejeitar roteiro:', err); setError('Erro ao rejeitar roteiro'); }
    finally { setRejectionDialogOpen(false); setRejectionReason(''); setRejectionTargetId(null); }
  };

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  const getStatusColor = (status: string) => ({ 'A liberar': 'warning', 'Iniciado': 'primary', 'Finalizado': 'success', 'Rejeitado': 'error' }[status] || 'default') as any;
  
  const filteredOrders = useMemo(() => availableOrders.filter(order => {
    const searchTermLower = wizardState.searchTerm.toLowerCase();
    const regionLower = wizardState.filterRegion.toLowerCase();
    const matchesSearch = wizardState.searchTerm === '' || order.numero.toLowerCase().includes(searchTermLower) || order.cliente.toLowerCase().includes(searchTermLower);
    const matchesRegion = wizardState.filterRegion === '' || order.cidade.toLowerCase().includes(regionLower) || order.uf.toLowerCase().includes(regionLower);
    return matchesSearch && matchesRegion;
  }), [availableOrders, wizardState.searchTerm, wizardState.filterRegion]);
    
  const RejectionDialog = () => (
    <Dialog open={rejectionDialogOpen} onClose={() => setRejectionDialogOpen(false)} maxWidth="sm" fullWidth>
      <DialogTitle>Rejeitar Roteiro</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Motivo da rejeição"
          fullWidth
          multiline
          rows={4}
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          variant="outlined"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setRejectionDialogOpen(false)}>Cancelar</Button>
        <Button onClick={handleRejectDelivery} color="error" variant="contained">
          Rejeitar
        </Button>
      </DialogActions>
    </Dialog>
  );
  
  const ViewDeliveryDialog = () => (
    <Dialog open={viewDeliveryOpen} onClose={() => setViewDeliveryOpen(false)} maxWidth="md" fullWidth>
      <DialogTitle>Detalhes do Roteiro</DialogTitle>
      <DialogContent>
        {selectedDelivery && (
          <Box>
            <Typography variant="h6" gutterBottom>Informações Gerais</Typography>
            <Typography><strong>ID:</strong> {selectedDelivery.id}</Typography>
            <Typography><strong>Motorista:</strong> {selectedDelivery.Driver?.name || 'N/A'}</Typography>
            <Typography><strong>Veículo:</strong> {selectedDelivery.Vehicle ? `${selectedDelivery.Vehicle.model} (${selectedDelivery.Vehicle.plate})` : 'N/A'}</Typography>
            <Typography><strong>Status:</strong> {selectedDelivery.status}</Typography>
            <Typography><strong>Valor Total:</strong> {formatCurrency(selectedDelivery.totalValor)}</Typography>
            <Typography><strong>Frete:</strong> {formatCurrency(selectedDelivery.valorFrete)}</Typography>
            
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Pedidos</Typography>
            {selectedDelivery.orders && selectedDelivery.orders.length > 0 ? (
              <List>
                {selectedDelivery.orders.map((order, index) => (
                  <ListItem key={order.id}>
                    <ListItemText
                      primary={`${index + 1}. ${order.numero} - ${order.cliente}`}
                      secondary={`${order.endereco}, ${order.cidade}-${order.uf} | ${formatCurrency(order.valor)}`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary">Nenhum pedido encontrado</Typography>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setViewDeliveryOpen(false)}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );

  const renderStepContent = () => {
    switch (wizardState.activeStep) {
      case 0:
        return (
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6" gutterBottom>Selecionar Pedidos</Typography>
              <Stack direction="row" spacing={2} mb={2}>
                <TextField placeholder="Buscar por cliente ou número..." value={wizardState.searchTerm} onChange={(e) => dispatchWizard({ type: 'SET_STATE', payload: { searchTerm: e.target.value } })} size="small" fullWidth InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} />
                <TextField placeholder="Filtrar por região..." value={wizardState.filterRegion} onChange={(e) => dispatchWizard({ type: 'SET_STATE', payload: { filterRegion: e.target.value } })} size="small" sx={{ width: 240 }} InputProps={{ startAdornment: <InputAdornment position="start"><FilterIcon /></InputAdornment> }} />
              </Stack>
              {wizardState.selectedOrders.length > 0 && <Alert severity="info"><strong>{wizardState.selectedOrders.length} pedidos selecionados</strong> ({formatCurrency(totalValue)} / {totalWeight.toFixed(1)}kg)</Alert>}
            </Box>
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              <TableContainer><Table stickyHeader size="small"><TableHead><TableRow>
                <TableCell padding="checkbox"><Checkbox indeterminate={wizardState.selectedOrders.length > 0 && wizardState.selectedOrders.length < filteredOrders.length} checked={filteredOrders.length > 0 && wizardState.selectedOrders.length === filteredOrders.length} onChange={(e) => e.target.checked ? dispatchWizard({ type: 'SET_ALL_FILTERED_ORDERS', payload: filteredOrders }) : dispatchWizard({ type: 'CLEAR_SELECTED_ORDERS' })} /></TableCell>
                <TableCell>Pedido</TableCell><TableCell>Cliente</TableCell><TableCell>Endereço</TableCell><TableCell>Valor</TableCell><TableCell>Peso</TableCell>
              </TableRow></TableHead><TableBody>
                {filteredOrders.map((order) => {
                  const isSelected = wizardState.selectedOrders.some(o => o.id === order.id);
                  return (
                    <TableRow key={order.id} hover selected={isSelected} onClick={() => dispatchWizard({ type: 'TOGGLE_ORDER', payload: order })} sx={{ cursor: 'pointer' }}>
                      <TableCell padding="checkbox"><Checkbox checked={isSelected} /></TableCell>
                      <TableCell><Typography variant="body2" fontWeight="medium">{order.numero}</Typography></TableCell>
                      <TableCell>{order.cliente}</TableCell>
                      <TableCell><Typography variant="body2" color="text.secondary">{`${order.endereco}, ${order.cidade}-${order.uf}`}</Typography></TableCell>
                      <TableCell><Typography variant="body2" fontWeight="medium">{formatCurrency(order.valor)}</Typography></TableCell>
                      <TableCell><Chip label={`${order.peso}kg`} size="small" variant="outlined" /></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody></Table></TableContainer>
            </Box>
          </Box>
        );
      case 1:
        return (
          <Box sx={{ height: '100%', display: 'flex' }}>
            <Box sx={{ width: 350, borderRight: 1, borderColor: 'divider', overflow: 'auto', p: 2 }}>
              <Typography variant="h6" gutterBottom>Roteirização</Typography>
              <TextField fullWidth label="Ponto de Partida" value={wizardState.startingPoint} onChange={(e) => dispatchWizard({ type: 'SET_STATE', payload: { startingPoint: e.target.value } })} size="small" sx={{ mb: 2 }} />
              <Button fullWidth variant="contained" startIcon={<PlayIcon />} onClick={handleSetStartingPoint} disabled={wizardState.calculating || !wizardState.startingPoint.trim()}>{wizardState.calculating ? 'Iniciando...' : 'Iniciar Planejamento'}</Button>
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 3 }}>Pedidos para Roteirizar:</Typography>
              <List dense>
                {wizardState.geocodedOrders.map((order) => {
                  const isInRoute = wizardState.routePoints.some(p => p.orderId === order.id);
                  const routeIndex = wizardState.routePoints.findIndex(p => p.orderId === order.id);
                  return (
                    <ListItemButton key={order.id} selected={isInRoute} onClick={() => handleOrderClickOnMap(order)} disabled={wizardState.routePoints.length === 0}>
                       <ListItemIcon sx={{minWidth: 32}}>
                          <Avatar sx={{ width: 24, height: 24, fontSize: '0.8rem', bgcolor: isInRoute ? 'primary.main' : 'grey.300', color: isInRoute ? 'white' : 'inherit' }}>{isInRoute ? routeIndex : '+'}</Avatar>
                      </ListItemIcon>
                      <ListItemText primary={`${order.numero} - ${order.cliente}`} secondary={order.formatted_address || `${order.endereco}, ${order.cidade}`} />
                    </ListItemButton>
                  );
                })}
              </List>
            </Box>
            <Box sx={{ flex: 1, position: 'relative' }}>
              {apiKey ? (
                <MapContainer 
                  apiKey={apiKey} 
                  wizardState={wizardState} 
                  dispatchWizard={dispatchWizard} 
                  directionsCallback={directionsCallback} 
                  directionsOptions={directionsOptions} 
                />
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <CircularProgress />
                  <Typography sx={{ ml: 2 }}>Carregando configurações do mapa...</Typography>
                </Box>
              )}
            </Box>
          </Box>
        );
      case 2:
        return (
          <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
            <Typography variant="h5" gutterBottom>Escolher Motorista e Veículo</Typography>
            <Stack spacing={3} sx={{ my: 4 }}>
              <FormControl fullWidth required><InputLabel>Motorista</InputLabel>
                <Select value={wizardState.selectedDriver} onChange={(e) => dispatchWizard({ type: 'SET_STATE', payload: { selectedDriver: e.target.value } })}>{drivers.map((driver) => <MenuItem key={driver.id} value={driver.id}>{driver.name} (CNH: {driver.license})</MenuItem>)}</Select>
              </FormControl>
              <FormControl fullWidth required><InputLabel>Veículo</InputLabel>
                <Select value={wizardState.selectedVehicle} onChange={(e) => dispatchWizard({ type: 'SET_STATE', payload: { selectedVehicle: e.target.value } })}>
                  {vehicles.map((vehicle) => <MenuItem key={vehicle.id} value={vehicle.id}>{`${vehicle.model} (${vehicle.plate})`}</MenuItem>)}
                </Select>
              </FormControl>
            </Stack>
            <TextField fullWidth label="Observações (opcional)" multiline rows={3} value={wizardState.observacao} onChange={(e) => dispatchWizard({ type: 'SET_STATE', payload: { observacao: e.target.value } })} />
            {wizardState.selectedOrders.length > 0 && wizardState.selectedVehicle && (
              <Alert severity="info" sx={{mt: 3}}>
                <Typography variant="subtitle2" gutterBottom>Resumo: {wizardState.selectedOrders.length} pedidos • {formatCurrency(totalValue)} • {totalWeight.toFixed(1)}kg</Typography>
                {wizardState.calculatedFreight > 0 && <Typography variant="body2">Frete estimado: {formatCurrency(wizardState.calculatedFreight)} ({freightPercentage.toFixed(1)}% do valor)</Typography>}
              </Alert>
            )}
          </Box>
        );
      case 3:
        const selectedVehicleData = vehicles.find(v => v.id === wizardState.selectedVehicle);
        const selectedDriverData = drivers.find(d => d.id === wizardState.selectedDriver);
        return (
          <Box sx={{ p: 3, maxWidth: 1000, mx: 'auto' }}>
            <Typography variant="h5" gutterBottom>Confirmar e Enviar Roteiro</Typography>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ my: 3 }}>
              <Card sx={{ flex: 1 }}><CardContent><Typography variant="h6" gutterBottom color="primary">Resumo do Roteiro</Typography><Stack spacing={1}><Box display="flex" justifyContent="space-between"><Typography>Pedidos:</Typography><Typography fontWeight="medium">{wizardState.selectedOrders.length}</Typography></Box><Box display="flex" justifyContent="space-between"><Typography>Valor Total:</Typography><Typography fontWeight="medium">{formatCurrency(totalValue)}</Typography></Box><Box display="flex" justifyContent="space-between"><Typography>Motorista:</Typography><Typography fontWeight="medium">{selectedDriverData?.name}</Typography></Box><Box display="flex" justifyContent="space-between"><Typography>Veículo:</Typography><Typography fontWeight="medium">{selectedVehicleData?.model} ({selectedVehicleData?.plate})</Typography></Box></Stack></CardContent></Card>
              <Card sx={{ flex: 1 }}><CardContent><Typography variant="h6" gutterBottom color="success.main">Cálculo do Frete</Typography><Stack spacing={1}><Box display="flex" justifyContent="space-between"><Typography fontWeight="bold">Frete Total:</Typography><Typography variant="h6" fontWeight="bold" color="success.main">{formatCurrency(wizardState.calculatedFreight)}</Typography></Box><Box display="flex" justifyContent="space-between"><Typography>% sobre Valor:</Typography><Typography fontWeight="medium" color={freightPercentage > 15 ? 'warning.main' : 'inherit'}>{freightPercentage.toFixed(1)}%</Typography></Box></Stack></CardContent></Card>
            </Stack>
            <Card variant="outlined"><CardContent><Typography variant="h6" gutterBottom>Sequência de Entregas</Typography><List dense>{wizardState.selectedOrders.map((order, index) => <ListItem key={order.id} divider><ListItemIcon><Chip label={index + 1} size="small" color="primary" /></ListItemIcon><ListItemText primary={`${order.numero} - ${order.cliente}`} secondary={`${order.endereco}, ${order.cidade}-${order.uf}`} /></ListItem>)}</List></CardContent></Card>
          </Box>
        );
      default: return null;
    }
  };

  if (loading) { return <AppLayout><Box display="flex" justifyContent="center" alignItems="center" minHeight="400px"><CircularProgress size={60} /></Box></AppLayout>; }

  return (
    <AuthGuard requiredRoles={['admin', 'user']}>
      <AppLayout>
        <Box sx={{ flexGrow: 1, p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
            <div><Typography variant="h4" component="h1" gutterBottom>Gestão de Roteiros</Typography><Typography color="text.secondary">Crie e gerencie roteiros de entrega inteligentes</Typography></div>
            <RoleGuard allowedRoles={['admin']}><Button variant="contained" startIcon={<AddIcon />} onClick={() => dispatchWizard({ type: 'OPEN_WIZARD' })} size="large">Novo Roteiro</Button></RoleGuard>
          </Stack>

          {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>{success}</Alert>}
          
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Roteiros Ativos ({deliveries.length})</Typography>
              {deliveries.length === 0 ? (
                <Box textAlign="center" py={5}><DeliveryIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} /><Typography color="text.secondary">Nenhum roteiro encontrado</Typography></Box>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table><TableHead><TableRow><TableCell>ID</TableCell><TableCell>Motorista</TableCell><TableCell>Veículo</TableCell><TableCell align="center">Pedidos</TableCell><TableCell>Valor Total</TableCell><TableCell>Frete</TableCell><TableCell>% Frete</TableCell><TableCell>Status</TableCell><TableCell align="center">Ações</TableCell></TableRow></TableHead>
                    <TableBody>
                      {deliveries.map((delivery) => {
                        const fretePercentual = delivery.totalValor > 0 ? (delivery.valorFrete / delivery.totalValor) * 100 : 0;
                        return (
                          <TableRow key={delivery.id} hover>
                            <TableCell><Typography variant="body2" fontFamily="monospace">{delivery.id.slice(0, 8)}</Typography></TableCell>
                            <TableCell><Typography variant="body2">{delivery.Driver?.name || 'N/A'}</Typography></TableCell>
                            <TableCell><Typography variant="body2">{delivery.Vehicle ? `${delivery.Vehicle.model} (${delivery.Vehicle.plate})` : 'N/A'}</Typography></TableCell>
                            <TableCell align="center"><Badge badgeContent={delivery.orders?.length || 0} color="primary"><OrderIcon /></Badge></TableCell>
                            <TableCell><Typography variant="body2" fontWeight="medium">{formatCurrency(delivery.totalValor)}</Typography></TableCell>
                            <TableCell><Typography variant="body2" color="success.main" fontWeight="medium">{formatCurrency(delivery.valorFrete)}</Typography></TableCell>
                            <TableCell><Typography variant="body2" color={fretePercentual > 15 ? 'warning.main' : 'inherit'} fontWeight="medium">{fretePercentual.toFixed(1)}%</Typography></TableCell>
                            <TableCell><Chip label={delivery.status} color={getStatusColor(delivery.status)} size="small" /></TableCell>
                            <TableCell align="center">
                              <Tooltip title="Ver detalhes"><IconButton size="small" onClick={() => { setSelectedDelivery(delivery); setViewDeliveryOpen(true); }}><ViewIcon /></IconButton></Tooltip>
                              {delivery.status === 'A liberar' && (
                                <RoleGuard allowedRoles={['admin']}>
                                  <Tooltip title="Liberar"><IconButton size="small" color="success" onClick={() => handleApproveDelivery(delivery.id)}><ApproveIcon /></IconButton></Tooltip>
                                  <Tooltip title="Rejeitar"><IconButton size="small" color="error" onClick={() => { setRejectionTargetId(delivery.id); setRejectionDialogOpen(true); }}><RejectIcon /></IconButton></Tooltip>
                                </RoleGuard>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>

          <Dialog open={wizardState.isOpen} onClose={() => !wizardState.creating && dispatchWizard({ type: 'CLOSE_WIZARD' })} maxWidth="xl" fullWidth PaperProps={{ sx: { height: '90vh', maxHeight: '90vh', display: 'flex', flexDirection: 'column' } }}>
            <DialogTitle sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">Criar Novo Roteiro</Typography>
                <IconButton onClick={() => !wizardState.creating && dispatchWizard({ type: 'CLOSE_WIZARD' })} disabled={wizardState.creating}><CloseIcon /></IconButton>
              </Stack>
            </DialogTitle>
            <Box sx={{ px: 3, pt: 2, pb: 1 }}><Stepper activeStep={wizardState.activeStep} alternativeLabel>{steps.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}</Stepper></Box>
            <DialogContent sx={{ p: 0, flex: 1, overflow: 'hidden', bgcolor: 'background.default' }}>{renderStepContent()}</DialogContent>
            <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
              <Button onClick={() => !wizardState.creating && dispatchWizard({ type: 'CLOSE_WIZARD' })} disabled={wizardState.creating}>Cancelar</Button>
              <Box sx={{ flexGrow: 1 }} />
              {wizardState.activeStep > 0 && <Button onClick={handleBack} disabled={wizardState.creating}>Voltar</Button>}
              {wizardState.activeStep < steps.length - 1 ? (
                <Button onClick={handleNext} variant="contained">Próximo</Button>
              ) : (
                <Button onClick={handleCreateDelivery} variant="contained" color="success" disabled={wizardState.creating || wizardState.selectedOrders.length === 0 || !wizardState.selectedDriver || !wizardState.selectedVehicle} startIcon={wizardState.creating ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}>
                  {wizardState.creating ? 'Criando...' : 'Criar e Enviar'}
                </Button>
              )}
            </DialogActions>
          </Dialog>
          <RejectionDialog />
          <ViewDeliveryDialog />
        </Box>
      </AppLayout>
    </AuthGuard>
  );
}