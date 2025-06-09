// src/app/routing/page.tsx
'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Typography, Container, Button, Paper, Grid, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Checkbox, FormControl, InputLabel, Select, MenuItem,
  Box, CircularProgress, Card, CardContent, List, ListItem, ListItemText, TextField,
  Stepper, Step, StepLabel, Alert, IconButton, Tooltip, Dialog, DialogTitle, DialogContent,
  DialogActions, ListItemIcon, Divider, Chip, Fade, Slide, Avatar, CardActionArea,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import MapIcon from '@mui/icons-material/Map';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import AirportShuttleIcon from '@mui/icons-material/AirportShuttle';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import InfoIcon from '@mui/icons-material/Info';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AssignmentIcon from '@mui/icons-material/Assignment';
import RouteIcon from '@mui/icons-material/Route';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ScaleIcon from '@mui/icons-material/Scale';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import BusinessIcon from '@mui/icons-material/Business';
import InventoryIcon from '@mui/icons-material/Inventory';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';

import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

import withAuth from '../../hoc/withAuth';
import {
  fetchOrders, fetchDrivers, fetchVehicles, fetchDirections, fetchCategories,
} from '../../../services/auxiliaryService';
import { addDelivery } from '../../../services/deliveryService';
import { useLoading } from '../../context/LoadingContext';
import { useMessage } from '../../context/MessageContext';
import { Order, Driver, Vehicle, Direction, Category as VehicleCategory } from '../../../types';
import { getStoredToken } from '../../../services/authService';

const ORDER_STATUS_SEM_ROTA = 'Sem rota';
const ORDER_STATUS_NAO_ENTREGUE = 'Não entregue';

interface FrontendCreateDeliveryPayload {
  motoristaId: string;
  veiculoId: string;
  orders: Array<{ id: string; sorting?: number | undefined }>;
  observacao?: string;
}

const steps = ['Seleção de Pedidos', 'Configuração da Rota e Sequência', 'Confirmação Final'];

const isCepInDirection = (cep: string, direction: Direction): boolean => {
  if (!cep || !direction.rangeInicio || !direction.rangeFim) return false;
  try {
    const cepNum = parseInt(cep.replace(/\D/g, ''), 10);
    const rangeInicioNum = parseInt(direction.rangeInicio.replace(/\D/g, ''), 10);
    const rangeFimNum = parseInt(direction.rangeFim.replace(/\D/g, ''), 10);
    return cepNum >= rangeInicioNum && cepNum <= rangeFimNum;
  } catch (e) { return false; }
};

interface RegionSummary {
    direction: Direction;
    totalWeight: number;
    totalValue: number;
    orderCount: number;
    ordersInRegion: Order[];
}

const RoteirizacaoPage: React.FC = () => {
  const theme = useTheme();
  const [token, setToken] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [allAvailableOrders, setAllAvailableOrders] = useState<Order[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<Order[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [selectedDriverObject, setSelectedDriverObject] = useState<Driver | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [driverVehicles, setDriverVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [selectedVehicleObject, setSelectedVehicleObject] = useState<Vehicle | null>(null);
  const [observacaoRoteiro, setObservacaoRoteiro] = useState<string>('');
  const [directions, setDirections] = useState<Direction[]>([]);
  const [vehicleCategories, setVehicleCategories] = useState<VehicleCategory[]>([]);
  
  const [filterRegionTable, setFilterRegionTable] = useState<string>('');
  const [filterDateTable, setFilterDateTable] = useState<string>('');
  const [filterOrderNumberTable, setFilterOrderNumberTable] = useState<string>('');
  
  const [viewingOrderDetails, setViewingOrderDetails] = useState<Order | null>(null);
  const [majorRegionForFreight, setMajorRegionForFreight] = useState<Direction | null>(null);

  const { isLoading, setLoading } = useLoading();
  const { showMessage } = useMessage();

  const handleApiError = useCallback((error: unknown, defaultMessage: string) => {
    console.error(defaultMessage, error);
    const errorMessage = error instanceof Error ? error.message : defaultMessage;
    showMessage(errorMessage, 'error');
  }, [showMessage]);

  useEffect(() => {
    const t = getStoredToken();
    if (t) setToken(t); else showMessage('Token não encontrado.', 'error');
  }, [showMessage]);

  const loadEssentialData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [ordersData, driversData, vehiclesData, directionsData, categoriesData] = await Promise.all([
        fetchOrders(token), fetchDrivers(token), fetchVehicles(token), fetchDirections(token), fetchCategories(token),
      ]);
      setAllAvailableOrders(
        (ordersData || []).filter((o: { status: string; }) => o.status === ORDER_STATUS_SEM_ROTA || o.status === ORDER_STATUS_NAO_ENTREGUE)
      );
      setDrivers(driversData || []);
      setVehicles(vehiclesData || []);
      setDirections(directionsData || []);
      setVehicleCategories(categoriesData || []);
    } catch (error) { handleApiError(error, "Falha ao carregar dados essenciais."); } 
    finally { setLoading(false); }
  }, [token, setLoading, handleApiError]);

  useEffect(() => { if (token) loadEssentialData(); }, [token, loadEssentialData]);

  const regionSummaries = useMemo((): RegionSummary[] => {
    if (!directions.length || !allAvailableOrders.length) return [];
    return directions.map(dir => {
        const ordersInThisRegion = allAvailableOrders.filter(order => isCepInDirection(order.cep, dir));
        const totalWeight = ordersInThisRegion.reduce((sum, o) => sum + (Number(o.peso) || 0), 0);
        const totalValue = ordersInThisRegion.reduce((sum, o) => sum + (Number(o.valor) || 0), 0);
        return {
            direction: dir, totalWeight, totalValue,
            orderCount: ordersInThisRegion.length,
            ordersInRegion: ordersInThisRegion,
        };
    }).filter(summary => summary.orderCount > 0);
  }, [allAvailableOrders, directions]);

  const tableDisplayOrders = useMemo(() => {
    return allAvailableOrders.filter(order => {
      const matchesOrderNumber = filterOrderNumberTable ? order.numero.toLowerCase().includes(filterOrderNumberTable.toLowerCase()) : true;
      const matchesDate = filterDateTable ? order.data.includes(filterDateTable) : true;
      const matchesRegion = filterRegionTable ? !!directions.find(dir => dir.id === filterRegionTable && isCepInDirection(order.cep, dir)) : true;
      return matchesOrderNumber && matchesDate && matchesRegion;
    });
  }, [allAvailableOrders, filterOrderNumberTable, filterDateTable, filterRegionTable, directions]);

  const updateSelectedOrdersWithSorting = useCallback((newSelectedOrders: Order[]) => {
    setSelectedOrders(newSelectedOrders.map((o, index) => ({ ...o, sorting: index + 1 })));
  }, []);
  
  const handleRegionCardClick = (ordersToSelectFromRegion: Order[]) => {
    setSelectedOrders(prevSelected => {
        const currentSelectedIds = new Set(prevSelected.map(o => o.id));
        const newOrdersToAdd = ordersToSelectFromRegion.filter(ro => !currentSelectedIds.has(ro.id));
        if (newOrdersToAdd.length === 0) {
            showMessage('Todos os pedidos desta região já estão na seleção.', 'info');
            return prevSelected;
        }
        const updatedSelection = [...prevSelected, ...newOrdersToAdd];
        const sortedSelection = updatedSelection.map((o, index) => ({ ...o, sorting: index + 1 }));
        showMessage(`${newOrdersToAdd.length} pedido(s) da região ${ordersToSelectFromRegion[0] ? (directions.find(d => isCepInDirection(ordersToSelectFromRegion[0].cep, d))?.regiao || '') : ''} adicionado(s).`, 'success');
        return sortedSelection;
    });
  };

  const handleOrderToggle = (orderToToggle: Order) => {
    setSelectedOrders((prevSelected) => {
      const isSelected = prevSelected.some(o => o.id === orderToToggle.id);
      let newArray;
      if (isSelected) newArray = prevSelected.filter(o => o.id !== orderToToggle.id);
      else newArray = [...prevSelected, orderToToggle];
      return newArray.map((o, index) => ({ ...o, sorting: index + 1 }));
    });
  };

  const handleSelectAllFiltered = () => {
    const currentFilteredInTableIds = new Set(tableDisplayOrders.map(o => o.id));
    const currentSelectedIds = new Set(selectedOrders.map(o => o.id));
    const allCurrentlyDisplayedInTableAreSelected = tableDisplayOrders.length > 0 && tableDisplayOrders.every(o => currentSelectedIds.has(o.id));

    if (allCurrentlyDisplayedInTableAreSelected) {
        const newSelection = selectedOrders.filter(so => !currentFilteredInTableIds.has(so.id));
        updateSelectedOrdersWithSorting(newSelection);
    } else {
        const ordersToAddFromTable = tableDisplayOrders.filter(fo => !currentSelectedIds.has(fo.id));
        const newSelection = [...selectedOrders, ...ordersToAddFromTable];
        updateSelectedOrdersWithSorting(newSelection);
    }
  };

  const handleRemoveOrderFromSelection = (orderIdToRemove: string) => {
    updateSelectedOrdersWithSorting(selectedOrders.filter(order => order.id !== orderIdToRemove));
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination || result.destination.index === result.source.index) return;
    const items = Array.from(selectedOrders);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    updateSelectedOrdersWithSorting(items);
  };

  useEffect(() => {
    if (selectedDriverId) {
      const driver = drivers.find(d => d.id === selectedDriverId);
      setSelectedDriverObject(driver || null);
      const associatedVehicles = vehicles.filter(v => v.driverId === selectedDriverId);
      setDriverVehicles(associatedVehicles);
      if (associatedVehicles.length === 1) setSelectedVehicleId(associatedVehicles[0].id);
      else if (!associatedVehicles.find(v => v.id === selectedVehicleId) || associatedVehicles.length === 0) setSelectedVehicleId('');
    } else {
      setSelectedDriverObject(null); setDriverVehicles([]); setSelectedVehicleId('');
    }
  }, [selectedDriverId, drivers, vehicles, selectedVehicleId]);

  useEffect(() => {setSelectedVehicleObject(vehicles.find(v => v.id === selectedVehicleId) || null);}, [selectedVehicleId, vehicles]);

  const estimatedFreightData = useMemo(() => {
    if (!selectedVehicleObject?.categoryId || selectedOrders.length === 0 || !vehicleCategories.length || !directions.length) return { freightValue: 0, majorRegionDetails: null };
    const category = vehicleCategories.find(cat => cat.id === selectedVehicleObject.categoryId);
    const valorCategoria = category ? Number(category.valor) || 0 : 0;
    let maxDirectionValue = 0;
    let currentMajorRegion: Direction | null = null;
    for (const order of selectedOrders) {
      const matchingDirection = directions.find(dir => isCepInDirection(order.cep, dir));
      if (matchingDirection && Number(matchingDirection.valorDirecao) > maxDirectionValue) {
        maxDirectionValue = Number(matchingDirection.valorDirecao);
        currentMajorRegion = matchingDirection;
      }
    }
    return { freightValue: maxDirectionValue + valorCategoria, majorRegionDetails: currentMajorRegion };
  }, [selectedOrders, selectedVehicleObject, vehicleCategories, directions]);

  useEffect(() => { setMajorRegionForFreight(estimatedFreightData.majorRegionDetails);}, [estimatedFreightData.majorRegionDetails]);

  const handleNext = () => {
    if (activeStep === 0 && selectedOrders.length === 0) { showMessage('Selecione ao menos um pedido para continuar.', 'warning'); return; }
    if (activeStep === 1 && (!selectedDriverId || !selectedVehicleId)) { showMessage('Selecione um motorista e um veículo para continuar.', 'warning'); return; }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleSubmitRoute = async () => {
    if (!token || !selectedDriverId || !selectedVehicleId || selectedOrders.length === 0) { showMessage('Dados incompletos ou sessão inválida.', 'error'); return; }
    setLoading(true);
    const payload: FrontendCreateDeliveryPayload = {
      motoristaId: selectedDriverId,
      veiculoId: selectedVehicleId,
      orders: selectedOrders.map(order => ({ id: order.id, sorting: order.sorting === null ? undefined : order.sorting })),
      observacao: observacaoRoteiro.trim() || undefined,
    };
    try {
      const response = await addDelivery(token, payload);
      showMessage(response.message || `Roteiro criado com sucesso!`, 'success');
      setActiveStep(0); setSelectedOrders([]); setSelectedDriverId(''); setObservacaoRoteiro('');
      if (token) loadEssentialData();
    } catch (error: unknown) { handleApiError(error, "Falha ao criar roteiro."); } 
    finally { setLoading(false); }
  };

  const displaySummarySelectedOrders = useMemo(() => {
    const totalValor = selectedOrders.reduce((sum, order) => sum + (Number(order.valor) || 0), 0);
    const freightValue = estimatedFreightData.freightValue;
    return {
      count: selectedOrders.length,
      totalPesoDisplay: selectedOrders.reduce((sum, order) => sum + (Number(order.peso) || 0), 0).toFixed(2),
      totalValorDisplay: totalValor.toFixed(2),
      estimatedFreightDisplay: freightValue.toFixed(2),
      freightPercentage: (totalValor > 0 ? (freightValue / totalValor) * 100 : 0).toFixed(2),
      majorRegionName: majorRegionForFreight?.regiao || "N/A",
      majorRegionValue: majorRegionForFreight ? Number(majorRegionForFreight.valorDirecao).toFixed(2) : "N/A",
    };
  }, [selectedOrders, estimatedFreightData, majorRegionForFreight]);

  const openMapForOptimizing = () => { /* ... (sem alterações) ... */ };
  const handleViewOrderDetails = (order: Order) => setViewingOrderDetails(order);
  const handleCloseOrderDetails = () => setViewingOrderDetails(null);

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Fade in timeout={600}>
            <Box>
              <Typography variant="h6" gutterBottom fontWeight="medium" sx={{mb:2, display: 'flex', alignItems: 'center'}}>
                <LocationOnIcon sx={{mr:1, color: theme.palette.text.secondary}}/> Seleção Rápida por Região
              </Typography>
              {isLoading && !regionSummaries.length && !allAvailableOrders.length ? (
                 <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
              ) : regionSummaries.length === 0 ? (
                <Alert severity="info" sx={{borderRadius: 2}}>Nenhuma região com pedidos elegíveis ('Sem Rota' ou 'Não Entregue') encontrada.</Alert>
              ) : (
                <Grid container spacing={2}>
                  {regionSummaries.map(({ direction, totalWeight, totalValue, orderCount, ordersInRegion }) => (
                    <Grid item xs={12} sm={6} md={4} lg={2.4} key={direction.id}>
                      <Paper 
                        elevation={2}
                        sx={{
                          borderRadius: 3,
                          border: `1px solid ${theme.palette.divider}`,
                          transition: 'all 0.3s ease',
                          height: '100%',
                          cursor: 'pointer',
                          '&:hover': {
                            borderColor: theme.palette.primary.main,
                            boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.15)}`,
                            transform: 'translateY(-4px)',
                          },
                        }}
                        onClick={() => handleRegionCardClick(ordersInRegion)}
                      >
                        <Box sx={{ p: 2 }}>
                          <Box sx={{display: 'flex', alignItems: 'center', mb: 1}}>
                            <BusinessIcon sx={{fontSize: '1.2rem', mr: 1, color: theme.palette.primary.main}}/>
                            <Typography variant="subtitle2" component="div" fontWeight="bold" noWrap title={direction.regiao}>
                              {direction.regiao || `Range ${direction.rangeInicio}-${direction.rangeFim}`}
                            </Typography>
                          </Box>
                          <Divider sx={{my: 1}}/>
                          <Box>
                            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', my: 0.5}}>
                              <Typography variant="caption" color="text.secondary">Pedidos:</Typography>
                              <Chip icon={<InventoryIcon sx={{fontSize:14}}/>} label={orderCount} size="small" sx={{fontWeight:600, height: 22, fontSize: '0.7rem', bgcolor: alpha(theme.palette.background.paper, 0.8)}} />
                            </Box>
                            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', my: 0.5}}>
                              <Typography variant="caption" color="text.secondary">Peso:</Typography>
                              <Chip icon={<ScaleIcon sx={{fontSize:14}}/>} label={`${totalWeight.toFixed(1)}Kg`} size="small" sx={{fontWeight:600, height: 22, fontSize: '0.7rem', bgcolor: alpha(theme.palette.warning.light, 0.2), color: theme.palette.warning.dark}}/>
                            </Box>
                            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', my: 0.5}}>
                              <Typography variant="caption" color="text.secondary">Valor:</Typography>
                              <Chip icon={<MonetizationOnIcon sx={{fontSize:14}}/>} label={`R${totalValue.toFixed(0)}`} size="small" sx={{fontWeight:600, height: 22, fontSize: '0.7rem', bgcolor: alpha(theme.palette.success.light, 0.2), color: theme.palette.success.dark}}/>
                            </Box>
                          </Box>
                          <Box sx={{ p:1, mt: 2, textAlign: 'center', backgroundColor: alpha(theme.palette.primary.light, 0.1), borderRadius: 2, border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`}}>
                            <Typography variant="caption" color="primary.main" fontWeight="medium" sx={{display:'flex', alignItems:'center', justifyContent:'center', fontSize: '0.75rem'}}>
                              <AddShoppingCartIcon sx={{fontSize:16, mr:0.5}}/> Adicionar à Rota
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              )}
              
              <Divider sx={{my:4}}><Chip label="Seleção Detalhada de Pedidos" size="small" sx={{ bgcolor: theme.palette.action.hover }}/></Divider>

              <Paper elevation={1} sx={{mb:3, borderRadius: 3, border: `1px solid ${theme.palette.divider}`}}>
                <Box sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <FilterListIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                      <Typography variant="h6" fontWeight="medium">Filtros da Tabela de Pedidos</Typography>
                  </Box>
                  <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}><FormControl fullWidth size="small"><InputLabel>Região (Tabela)</InputLabel><Select value={filterRegionTable} label="Região (Tabela)" onChange={(e) => setFilterRegionTable(e.target.value)}><MenuItem value=""><em>Todas</em></MenuItem>{directions.map(dir => ( <MenuItem key={dir.id} value={dir.id}>{dir.regiao || `Range ${dir.rangeInicio}-${dir.rangeFim}`}</MenuItem> ))}</Select></FormControl></Grid>
                      <Grid item xs={12} sm={4}><TextField fullWidth size="small" label="Número do Pedido (Tabela)" value={filterOrderNumberTable} onChange={(e) => setFilterOrderNumberTable(e.target.value)} /></Grid>
                      <Grid item xs={12} sm={4}><TextField fullWidth size="small" label="Data (Tabela)" value={filterDateTable} onChange={(e) => setFilterDateTable(e.target.value)} placeholder="DD/MM/YYYY ou parte" /></Grid>
                  </Grid>
                </Box>
              </Paper>
              
              <Paper elevation={1} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
                <Box sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" fontWeight="medium">Pedidos Disponíveis na Tabela ({tableDisplayOrders.length})</Typography>
                    <Button 
                      size="small" 
                      onClick={handleSelectAllFiltered} 
                      startIcon={<PlaylistAddCheckIcon/>} 
                      disabled={tableDisplayOrders.length === 0}
                      sx={{ 
                        borderRadius: 2, 
                        textTransform: 'none',
                        bgcolor: theme.palette.primary.main,
                        color: theme.palette.primary.contrastText,
                        '&:hover': { bgcolor: theme.palette.primary.dark }
                      }}
                    >
                        {tableDisplayOrders.length > 0 && tableDisplayOrders.every(o => selectedOrders.some(so => so.id === o.id)) ? 'Desmarcar Filtrados' : 'Marcar Todos Filtrados'}
                    </Button>
                  </Box>
                  {isLoading && !allAvailableOrders.length ? ( <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
                  ) : tableDisplayOrders.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <AssignmentIcon sx={{ fontSize: 40, color: theme.palette.text.disabled, mb: 1 }} />
                      <Typography variant="subtitle1" color="text.secondary">Nenhum pedido encontrado com os filtros aplicados.</Typography>
                    </Box>
                  ) : (
                    <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 400, border: `1px solid ${theme.palette.divider}`, borderRadius: 2}}>
                      <Table stickyHeader size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell padding="checkbox"><Checkbox color="primary" indeterminate={selectedOrders.filter(so => tableDisplayOrders.some(tdo => tdo.id === so.id)).length > 0 && selectedOrders.filter(so => tableDisplayOrders.some(tdo => tdo.id === so.id)).length < tableDisplayOrders.length} checked={tableDisplayOrders.length > 0 && tableDisplayOrders.every(o => selectedOrders.some(so => so.id === o.id))} onChange={handleSelectAllFiltered} disabled={tableDisplayOrders.length === 0}/></TableCell>
                            <TableCell>Número</TableCell><TableCell>Cliente</TableCell><TableCell>Endereço</TableCell><TableCell>Status</TableCell>
                            <TableCell align="right">Peso</TableCell><TableCell align="right">Valor</TableCell><TableCell align="center">Info</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {tableDisplayOrders.map((order) => {
                            const isSelected = selectedOrders.some(o => o.id === order.id);
                            return (
                              <TableRow hover key={order.id} selected={isSelected} sx={{ '&:last-child td, &:last-child th': { border: 0 }, cursor:'pointer' }} onClick={() => handleOrderToggle(order)}>
                                <TableCell padding="checkbox"><Checkbox color="primary" checked={isSelected} /></TableCell>
                                <TableCell><Typography variant="body2" fontWeight={500}>{order.numero}</Typography></TableCell>
                                <TableCell><Typography variant="body2">{order.cliente}</Typography></TableCell>
                                <TableCell><Typography variant="caption" color="text.secondary">{`${order.endereco || ''}, ${order.cidade || ''}`}</Typography></TableCell>
                                <TableCell><Chip label={order.status} size="small" variant="outlined" color={order.status === ORDER_STATUS_NAO_ENTREGUE ? "error" : "default"} sx={{fontSize:'0.7rem', height:22}} /></TableCell>
                                <TableCell align="right"><Typography variant="body2">{Number(order.peso || 0).toFixed(2)} kg</Typography></TableCell>
                                <TableCell align="right"><Typography variant="body2" fontWeight="medium" color="success.dark">R$ {Number(order.valor || 0).toFixed(2)}</Typography></TableCell>
                                <TableCell align="center"><Tooltip title="Ver Detalhes"><IconButton size="small" onClick={(e) => { e.stopPropagation(); handleViewOrderDetails(order);}}><InfoIcon fontSize="inherit" /></IconButton></Tooltip></TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Box>
              </Paper>
            </Box>
          </Fade>
        );
      case 1: // Configuração da Rota e Sequência
        return (
          <Slide direction="left" in timeout={600}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Paper elevation={1} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}`, height: 'fit-content' }}>
                  <Box sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}><AirportShuttleIcon sx={{ mr: 1, color: theme.palette.primary.main }} /><Typography variant="h6" fontWeight="medium">Configurar Entrega</Typography></Box>
                    <FormControl fullWidth sx={{ mb: 2 }} size="small"><InputLabel>Motorista</InputLabel><Select value={selectedDriverId} label="Motorista" onChange={(e) => setSelectedDriverId(e.target.value)}><MenuItem value=""><em>Selecione...</em></MenuItem>{drivers.map((driver) => ( <MenuItem key={driver.id} value={driver.id}>{driver.name}</MenuItem> ))}</Select></FormControl>
                    <FormControl fullWidth sx={{ mb: 2 }} size="small"><InputLabel>Veículo</InputLabel><Select value={selectedVehicleId} label="Veículo" onChange={(e) => setSelectedVehicleId(e.target.value)} disabled={!selectedDriverId || driverVehicles.length === 0}><MenuItem value=""><em>{!selectedDriverId ? "Motorista?" : driverVehicles.length === 0 ? "Sem veículos" : "Selecione..."}</em></MenuItem>{driverVehicles.map((vehicle) => ( <MenuItem key={vehicle.id} value={vehicle.id}>{vehicle.model} - {vehicle.plate}</MenuItem> ))}</Select></FormControl>
                    <TextField label="Observações do Roteiro" multiline rows={3} value={observacaoRoteiro} onChange={(e) => setObservacaoRoteiro(e.target.value)} fullWidth placeholder="Adicione observações..." size="small"/>
                    {selectedDriverObject && selectedVehicleObject && (<Box sx={{mt:2}}><Chip icon={<PersonIcon fontSize="small"/>} label={selectedDriverObject.name} size="small" sx={{mr:1, mb:1, bgcolor: alpha(theme.palette.info.light, 0.2), color: theme.palette.info.dark}}/><Chip icon={<LocalShippingIcon fontSize="small"/>} label={`${selectedVehicleObject.model}`} size="small" sx={{mb:1, bgcolor: alpha(theme.palette.secondary.light, 0.2), color: theme.palette.secondary.dark}}/></Box>)}
                  </Box>
                </Paper>
                 {/* TOTALIZADOR DOS PEDIDOS SELECIONADOS */}
                {selectedOrders.length > 0 && (
                    <Paper elevation={1} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}`, mt: 3 }}>
                        <Box sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <PlaylistAddCheckIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                                <Typography variant="h6" fontWeight="medium">Resumo da Carga</Typography>
                            </Box>
                            <Grid container spacing={2} justifyContent="center">
                                <Grid item xs={12} sm={4}><Chip icon={<InventoryIcon/>} label={`${displaySummarySelectedOrders.count} Pedidos`} variant="filled" sx={{width: '100%', bgcolor: alpha(theme.palette.info.light, 0.2), color: theme.palette.info.dark}} /></Grid>
                                <Grid item xs={12} sm={4}><Chip icon={<ScaleIcon/>} label={`${displaySummarySelectedOrders.totalPesoDisplay} Kg`} sx={{width: '100%', bgcolor: alpha(theme.palette.warning.light, 0.2), color: theme.palette.warning.dark}} /></Grid>
                                <Grid item xs={12} sm={4}><Chip icon={<MonetizationOnIcon/>} label={`R$ ${displaySummarySelectedOrders.totalValorDisplay}`} sx={{width: '100%', bgcolor: alpha(theme.palette.success.light, 0.2), color: theme.palette.success.dark}} /></Grid>
                            </Grid>
                        </Box>
                    </Paper>
                )}
              </Grid>
              <Grid item xs={12} md={8}>
                <Paper elevation={1} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
                  <Box sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}><RouteIcon sx={{ mr: 1, color: theme.palette.primary.main }} /><Typography variant="h6" fontWeight="medium">Sequência de Entregas ({selectedOrders.length})</Typography></Box>
                        <Tooltip title="Otimizar Rota (Google Maps)">
                          <IconButton 
                            onClick={openMapForOptimizing} 
                            disabled={selectedOrders.length < 1} 
                            sx={{
                              bgcolor: theme.palette.primary.main, 
                              color: theme.palette.primary.contrastText, 
                              '&:hover': {bgcolor: theme.palette.primary.dark},
                              borderRadius: 2
                            }}
                          >
                            <MapIcon />
                          </IconButton>
                        </Tooltip>
                    </Box>
                    <Alert severity="info" icon={<DragIndicatorIcon />} sx={{ mb: 2, borderRadius: 2 }}>Arraste os itens para reordenar a sequência.</Alert>
                    <DragDropContext onDragEnd={onDragEnd}>
                      <Droppable droppableId="delivery-sequence">
                        {(providedDroppable, snapshotDroppable) => (
                          <List {...providedDroppable.droppableProps} ref={providedDroppable.innerRef}
                            sx={{ 
                              maxHeight: 400, 
                              overflow: 'auto', 
                              border: `2px dashed ${snapshotDroppable.isDraggingOver ? theme.palette.primary.main : theme.palette.divider}`, 
                              p: 1, 
                              minHeight: '200px', 
                              bgcolor: snapshotDroppable.isDraggingOver ? alpha(theme.palette.primary.light, 0.1) : 'transparent', 
                              borderRadius: 2 
                            }}
                          >
                            {selectedOrders.map((order, index) => (
                              <Draggable key={order.id} draggableId={order.id} index={index}>
                                {(providedDraggable, snapshotDraggable) => (
                                  <ListItem component={Paper} variant="outlined" ref={providedDraggable.innerRef} {...providedDraggable.draggableProps}
                                    style={{...providedDraggable.draggableProps.style, userSelect:'none'}}
                                    sx={{ 
                                      mb: 1, 
                                      bgcolor: snapshotDraggable.isDragging ? alpha(theme.palette.primary.light, 0.2) : theme.palette.action.hover, 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      borderRadius: 2, 
                                      py: 1,
                                      border: `1px solid ${theme.palette.divider}`
                                    }}
                                    secondaryAction={ <Tooltip title="Remover da seleção"><IconButton size="small" onClick={() => handleRemoveOrderFromSelection(order.id)} sx={{color: theme.palette.error.main}}><DeleteIcon fontSize="inherit" /></IconButton></Tooltip> }
                                  >
                                    <Box {...providedDraggable.dragHandleProps} sx={{ display: 'flex', alignItems: 'center', cursor: 'grab', p: 1, mr:1, color: theme.palette.text.disabled }}><DragIndicatorIcon fontSize="small"/></Box>
                                    <Avatar sx={{ width: 28, height: 28, bgcolor: theme.palette.primary.main, color: theme.palette.primary.contrastText, fontSize: '0.8rem', fontWeight: 'bold', mr: 2 }}>{order.sorting}</Avatar>
                                    <ListItemText primary={<Typography variant="body2" fontWeight="medium" noWrap>{order.cliente}</Typography>} secondary={<Typography variant="caption" color="text.secondary" noWrap>{`${order.endereco}, ${order.numero} - ${order.cidade}`}</Typography>} />
                                    <Chip label={`R$ ${Number(order.valor || 0).toFixed(0)}`} size="small" sx={{ml:1, fontSize: '0.7rem', height: 22, fontWeight:500, bgcolor: alpha(theme.palette.success.light, 0.2), color: theme.palette.success.dark}}/>
                                  </ListItem>
                                )}
                              </Draggable>
                            ))}
                            {providedDroppable.placeholder}
                            {selectedOrders.length === 0 && ( <Box sx={{ textAlign: 'center', py: 4 }}><RouteIcon sx={{ fontSize: 40, color: theme.palette.text.disabled, mb: 1 }} /><Typography variant="subtitle1" color="text.secondary">Nenhum pedido selecionado</Typography><Typography variant="body2" color="text.secondary">Volte à etapa anterior para adicionar pedidos.</Typography></Box> )}
                          </List>
                        )}
                      </Droppable>
                    </DragDropContext>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Slide>
        );
      case 2: // Confirmação Final
        const categoryOfVehicle = selectedVehicleObject && vehicleCategories.find(cat => cat.id === selectedVehicleObject.categoryId);
        return (
          <Fade in timeout={600}>
            <Box>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h5" fontWeight="bold" sx={{ mb: 1, color: theme.palette.primary.main }}>
                  Confirmação do Roteiro
                </Typography>
                <Typography variant="body1" color="text.secondary">Revise todos os dados antes de finalizar a criação.</Typography>
              </Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={5}>
                  <Paper elevation={1} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
                    <Box sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}><AirportShuttleIcon sx={{ mr: 1, color: theme.palette.primary.main }} /><Typography variant="h6" fontWeight="medium">Atribuição</Typography></Box>
                        <List dense disablePadding>
                            <ListItem divider><ListItemText primary="Motorista:" secondaryTypographyProps={{fontWeight:'bold'}} secondary={selectedDriverObject?.name || 'N/A'} /></ListItem>
                            <ListItem divider><ListItemText primary="Veículo:" secondaryTypographyProps={{fontWeight:'bold'}} secondary={selectedVehicleObject ? `${selectedVehicleObject.model} (${selectedVehicleObject.plate})` : 'N/A'} /></ListItem>
                            {categoryOfVehicle && <ListItem divider><ListItemText primary="Cat. Veículo:" secondary={`${categoryOfVehicle.name} (Base: R$ ${Number(categoryOfVehicle.valor || 0).toFixed(2)})`} /></ListItem>}
                            {majorRegionForFreight && <ListItem divider><ListItemText primary="Região Base (Frete):" secondary={`${majorRegionForFreight.regiao} (R$ ${displaySummarySelectedOrders.majorRegionValue})`} /></ListItem>}
                            {observacaoRoteiro && <ListItem><ListItemText primary="Observações:" secondary={observacaoRoteiro} sx={{'& .MuiListItemText-secondary': {whiteSpace:'pre-wrap', wordBreak:'break-word'}}} /></ListItem>}
                        </List>
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={7}>
                    <Paper elevation={1} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
                        <Box sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}><MonetizationOnIcon sx={{ mr: 1, color: theme.palette.success.main }} /><Typography variant="h6" fontWeight="medium">Resumo Financeiro e Carga</Typography></Box>
                            <List dense disablePadding>
                                <ListItem divider><ListItemText primary="Qtd. Pedidos:" secondary={<Typography component="span" fontWeight="bold">{displaySummarySelectedOrders.count}</Typography>} /></ListItem>
                                <ListItem divider><ListItemText primary="Peso Total:" secondary={<Typography component="span" fontWeight="bold">{displaySummarySelectedOrders.totalPesoDisplay} Kg</Typography>} /></ListItem>
                                <ListItem divider><ListItemText primary="Valor Mercadoria:" secondary={<Typography component="span" fontWeight="bold" color="success.dark">R$ {displaySummarySelectedOrders.totalValorDisplay}</Typography>} /></ListItem>
                                <ListItem divider><ListItemText primary="Frete Estimado:" secondary={<Typography component="span" fontWeight="bold" color="primary.main">R$ {displaySummarySelectedOrders.estimatedFreightDisplay}</Typography>} /></ListItem>
                                <ListItem><ListItemText primary="% Frete:" secondary={<Typography component="span" fontWeight="bold">{displaySummarySelectedOrders.freightPercentage}%</Typography>} /></ListItem>
                            </List>
                        </Box>
                    </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Paper elevation={1} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
                    <Box sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}><RouteIcon sx={{ mr: 1, color: theme.palette.primary.main }} /><Typography variant="h6" fontWeight="medium">Sequência de Entregas ({selectedOrders.length})</Typography></Box>
                        <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 260, borderRadius: 2 }}>
                        <Table size="small" stickyHeader>
                            <TableHead><TableRow><TableCell>Seq.</TableCell><TableCell>Cliente</TableCell><TableCell>Endereço</TableCell><TableCell align="right">Valor</TableCell></TableRow></TableHead>
                            <TableBody>
                            {selectedOrders.map((order, index) => (
                                <TableRow key={order.id} sx={{ '&:nth-of-type(odd)': { bgcolor: theme.palette.action.hover } }}>
                                <TableCell><Chip label={order.sorting} size="small" sx={{fontWeight:'bold', bgcolor: theme.palette.primary.main, color: theme.palette.primary.contrastText}}/></TableCell>
                                <TableCell><Typography variant="body2">{order.cliente}</Typography></TableCell>
                                <TableCell><Typography variant="caption" color="text.secondary">{`${order.endereco}, ${order.cidade}`}</Typography></TableCell>
                                <TableCell align="right"><Typography variant="body2" color="success.dark">R$ {Number(order.valor || 0).toFixed(2)}</Typography></TableCell>
                                </TableRow>
                            ))}
                            </TableBody>
                        </Table>
                        </TableContainer>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          </Fade>
        );
      default: return null;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper 
        elevation={5} 
        sx={{ 
          p: { xs: 3, sm: 4 }, 
          borderRadius: 4,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.05)} 0%, ${theme.palette.background.paper} 100%)`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          boxShadow: `0 10px 40px ${alpha(theme.palette.common.black, 0.1)}`
        }}
      >
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4, pb: 2 }}>
          {steps.map((label) => ( <Step key={label}><StepLabel>{label}</StepLabel></Step> ))}
        </Stepper>

        <Box sx={{ minHeight: '500px', position:'relative' }}>
          {isLoading && (activeStep === 0 && !allAvailableOrders.length && !regionSummaries.length) ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '500px' }}><CircularProgress size={50} /></Box>
          ) : (
            renderStepContent()
          )}
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'row', pt: 3, mt: 3, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Button 
            color="inherit" 
            variant="outlined" 
            disabled={activeStep === 0 || isLoading} 
            onClick={handleBack} 
            sx={{ mr: 2, borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            Voltar
          </Button>
          <Box sx={{ flex: '1 1 auto' }} />
          {activeStep === steps.length - 1 ? (
            <Button 
              onClick={handleSubmitRoute} 
              disabled={isLoading || !selectedDriverId || !selectedVehicleId || selectedOrders.length === 0} 
              startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <CheckCircleOutlineIcon />}
              sx={{
                borderRadius: 3,
                padding: '12px 32px',
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                color: theme.palette.primary.contrastText,
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: `0 4px 15px ${alpha(theme.palette.primary.main, 0.4)}`,
                '&:hover': {
                  background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                  transform: 'translateY(-2px)',
                  boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.5)}`,
                },
                '&:disabled': {
                  background: theme.palette.action.disabledBackground,
                  color: theme.palette.action.disabled
                }
              }}
            >
              {isLoading ? 'Criando...' : 'Finalizar e Criar Roteiro'}
            </Button>
          ) : (
            <Button 
              onClick={handleNext} 
              disabled={ isLoading || (activeStep === 0 && selectedOrders.length === 0) || (activeStep === 1 && (!selectedDriverId || !selectedVehicleId || selectedOrders.length === 0)) }
              sx={{
                borderRadius: 3,
                padding: '12px 32px',
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                color: theme.palette.primary.contrastText,
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: `0 4px 15px ${alpha(theme.palette.primary.main, 0.4)}`,
                '&:hover': {
                  background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                  transform: 'translateY(-2px)',
                  boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.5)}`,
                },
                '&:disabled': {
                  background: theme.palette.action.disabledBackground,
                  color: theme.palette.action.disabled
                }
              }}
            >
              Próximo
            </Button>
          )}
        </Box>
      </Paper>

      <Dialog open={!!viewingOrderDetails} onClose={handleCloseOrderDetails} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="h6" fontWeight="bold">Detalhes do Pedido: {viewingOrderDetails?.numero}</Typography>
          <IconButton onClick={handleCloseOrderDetails}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {viewingOrderDetails && (
            <List dense>
              <ListItem><ListItemText primary="Cliente:" secondary={viewingOrderDetails.cliente} /></ListItem>
              <ListItem><ListItemText primary="Endereço:" secondary={`${viewingOrderDetails.endereco}, ${viewingOrderDetails.bairro}, ${viewingOrderDetails.cidade} - ${viewingOrderDetails.uf}, CEP: ${viewingOrderDetails.cep}`} /></ListItem>
              <ListItem><ListItemText primary="Contato:" secondary={`${viewingOrderDetails.nomeContato} (${viewingOrderDetails.telefone})`} /></ListItem>
              <ListItem><ListItemText primary="Data:" secondary={new Date(viewingOrderDetails.data).toLocaleDateString('pt-BR')} /></ListItem>
              <ListItem><ListItemText primary="Peso:" secondary={`${Number(viewingOrderDetails.peso || 0).toFixed(2)} Kg`} /></ListItem>
              <ListItem><ListItemText primary="Valor:" secondary={`R$ ${Number(viewingOrderDetails.valor || 0).toFixed(2)}`} /></ListItem>
              <ListItem><ListItemText primary="Status Atual:" secondary={viewingOrderDetails.status} /></ListItem>
              {viewingOrderDetails.instrucoesEntrega && <ListItem><ListItemText primary="Instruções:" secondary={viewingOrderDetails.instrucoesEntrega} /></ListItem>}
            </List>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Button 
            onClick={handleCloseOrderDetails} 
            variant="contained" 
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              bgcolor: theme.palette.primary.main,
              '&:hover': { bgcolor: theme.palette.primary.dark }
            }}
          >
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default withAuth(RoteirizacaoPage);