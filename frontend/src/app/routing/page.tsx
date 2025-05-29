// src/app/routing/page.tsx
'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Typography, Container, Button, Paper, Grid, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Checkbox, FormControl, InputLabel, Select, MenuItem,
  Box, CircularProgress, Card, CardContent, List, ListItem, ListItemText, TextField,
  Stepper, Step, StepLabel, Alert, IconButton, Tooltip, Dialog, DialogTitle, DialogContent,
  DialogActions, ListItemIcon, Divider, Chip, Fade, Slide, Badge, Avatar,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import MapIcon from '@mui/icons-material/Map';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import AirportShuttleIcon from '@mui/icons-material/AirportShuttle';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import InfoIcon from '@mui/icons-material/Info';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AssignmentIcon from '@mui/icons-material/Assignment';
import RouteIcon from '@mui/icons-material/Route';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ScaleIcon from '@mui/icons-material/Scale';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

import withAuth from '../hoc/withAuth';
import {
  fetchOrders, fetchDrivers, fetchVehicles, fetchDirections, fetchCategories,
} from '../../services/auxiliaryService';
import { addDelivery } from '../../services/deliveryService';
import { useLoading } from '../context/LoadingContext';
import { useMessage } from '../context/MessageContext';
import { Order, Driver, Vehicle, Direction, Category as VehicleCategory } from '../../types';
import { getStoredToken } from '../../services/authService';

// Styled Components
const ModernCard = styled(Card)(({ theme }) => ({
  borderRadius: '20px',
  background: theme.palette.mode === 'dark' 
    ? 'rgba(15, 23, 42, 0.8)' 
    : 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  border: theme.palette.mode === 'dark'
    ? '1px solid rgba(148, 163, 184, 0.2)'
    : '1px solid rgba(30, 41, 59, 0.1)',
  boxShadow: theme.palette.mode === 'dark'
    ? '0 8px 32px rgba(0, 0, 0, 0.3)'
    : '0 8px 32px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 12px 40px rgba(0, 0, 0, 0.4)'
      : '0 12px 40px rgba(0, 0, 0, 0.15)',
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  padding: '12px 24px',
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.875rem',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-1px)',
  },
}));

const GradientButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  padding: '14px 32px',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  fontWeight: 600,
  textTransform: 'none',
  border: 'none',
  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    background: 'linear-gradient(135deg, #5a67d8 0%, #6a4c93 100%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
  },
  '&:disabled': {
    background: 'rgba(148, 163, 184, 0.3)',
    color: 'rgba(248, 250, 252, 0.5)',
    boxShadow: 'none',
    transform: 'none',
  },
}));

const StatsCard = ({ icon, title, value, subtitle, color = 'primary' }: {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle?: string;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
}) => (
  <ModernCard sx={{ height: '100%', textAlign: 'center' }}>
    <CardContent sx={{ py: 3 }}>
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 64,
          height: 64,
          borderRadius: '16px',
          background: `linear-gradient(135deg, ${
            color === 'primary' ? '#667eea, #764ba2' : 
            color === 'success' ? '#4ade80, #22c55e' :
            color === 'warning' ? '#fbbf24, #f59e0b' :
            color === 'error' ? '#f87171, #ef4444' : '#8b5cf6, #a855f7'
          })`,
          mb: 2,
          boxShadow: `0 4px 12px ${
            color === 'primary' ? 'rgba(102, 126, 234, 0.3)' : 
            color === 'success' ? 'rgba(74, 222, 128, 0.3)' :
            color === 'warning' ? 'rgba(251, 191, 36, 0.3)' :
            color === 'error' ? 'rgba(248, 113, 113, 0.3)' : 'rgba(139, 92, 246, 0.3)'
          }`,
        }}
      >
        {icon}
      </Box>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 0.5 }}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary" fontWeight="medium">
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          {subtitle}
        </Typography>
      )}
    </CardContent>
  </ModernCard>
);

interface FrontendCreateDeliveryPayload {
  motoristaId: string;
  veiculoId: string;
  orders: Array<{ id: string; sorting?: number }>;
  observacao?: string;
}

const steps = ['Seleção de Pedidos', 'Configuração da Rota', 'Confirmação Final'];

const isCepInDirection = (cep: string, direction: Direction): boolean => {
  if (!cep || !direction.rangeInicio || !direction.rangeFim) return false;
  try {
    const cepNum = parseInt(cep.replace(/\D/g, ''), 10);
    const rangeInicioNum = parseInt(direction.rangeInicio.replace(/\D/g, ''), 10);
    const rangeFimNum = parseInt(direction.rangeFim.replace(/\D/g, ''), 10);
    return cepNum >= rangeInicioNum && cepNum <= rangeFimNum;
  } catch (e) {
    console.error("Erro ao parsear CEPs para comparação", e);
    return false;
  }
};

const RoteirizacaoPage: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
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
  const [filterSelectedDirectionId, setFilterSelectedDirectionId] = useState<string>('');
  const [filterDate, setFilterDate] = useState<string>('');
  const [filterOrderNumber, setFilterOrderNumber] = useState<string>('');
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
      setAllOrders(ordersData || []);
      setDrivers(driversData || []);
      setVehicles(vehiclesData || []);
      setDirections(directionsData || []);
      setVehicleCategories(categoriesData || []);
    } catch (error) { 
      handleApiError(error, "Falha ao carregar dados essenciais."); 
    } finally { 
      setLoading(false); 
    }
  }, [token, setLoading, handleApiError]);

  useEffect(() => { 
    if (token) loadEssentialData(); 
  }, [token, loadEssentialData]);

  const filteredAndPendingOrders = useMemo(() => {
    return allOrders.filter(order => {
      const isPendente = order.status === 'Pendente';
      const matchesOrderNumber = filterOrderNumber ? order.numero.toLowerCase().includes(filterOrderNumber.toLowerCase()) : true;
      const matchesDate = filterDate ? order.data.includes(filterDate) : true;
      const matchesDirection = filterSelectedDirectionId ? !!directions.find(dir => dir.id === filterSelectedDirectionId && isCepInDirection(order.cep, dir)) : true;
      return isPendente && matchesOrderNumber && matchesDate && matchesDirection;
    });
  }, [allOrders, filterOrderNumber, filterDate, filterSelectedDirectionId, directions]);

  const updateSelectedOrdersWithSorting = useCallback((newSelectedOrders: Order[]) => {
    setSelectedOrders(newSelectedOrders.map((o, index) => ({ ...o, sorting: index + 1 })));
  }, []);

  const handleOrderToggle = (orderToToggle: Order) => {
    setSelectedOrders((prevSelected) => {
      const isSelected = prevSelected.some(o => o.id === orderToToggle.id);
      let newArray;
      if (isSelected) {
        newArray = prevSelected.filter(o => o.id !== orderToToggle.id);
      } else {
        newArray = [...prevSelected, orderToToggle];
      }
      return newArray.map((o, index) => ({ ...o, sorting: index + 1 }));
    });
  };

  const handleRemoveOrderFromSelection = (orderIdToRemove: string) => {
    const newSelectedOrders = selectedOrders.filter(order => order.id !== orderIdToRemove);
    updateSelectedOrdersWithSorting(newSelectedOrders);
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination || result.destination.index === result.source.index) {
      return;
    }
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
      if (associatedVehicles.length === 1) {
        setSelectedVehicleId(associatedVehicles[0].id);
      } else {
        if (!associatedVehicles.find(v => v.id === selectedVehicleId) || associatedVehicles.length === 0) {
          setSelectedVehicleId('');
        }
      }
    } else {
      setSelectedDriverObject(null);
      setDriverVehicles([]);
      setSelectedVehicleId('');
    }
  }, [selectedDriverId, drivers, vehicles]);

  useEffect(() => {
    if (selectedVehicleId) {
      const vehicle = vehicles.find(v => v.id === selectedVehicleId);
      setSelectedVehicleObject(vehicle || null);
    } else {
      setSelectedVehicleObject(null);
    }
  }, [selectedVehicleId, vehicles]);

  const estimatedFreightData = useMemo(() => {
    if (!selectedVehicleObject || !selectedVehicleObject.categoryId || selectedOrders.length === 0 || !vehicleCategories.length || !directions.length) {
      return { freightValue: 0, majorRegionDetails: null };
    }
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

  useEffect(() => {
    setMajorRegionForFreight(estimatedFreightData.majorRegionDetails);
  }, [estimatedFreightData.majorRegionDetails]);

  const handleNext = () => {
    if (activeStep === 0 && selectedOrders.length === 0) {
      showMessage('Selecione ao menos um pedido para continuar.', 'warning');
      return;
    }
    if (activeStep === 1 && (!selectedDriverId || !selectedVehicleId)) {
      showMessage('Selecione um motorista e um veículo para continuar.', 'warning');
      return;
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleSubmitRoute = async () => {
    if (!token || !selectedDriverId || !selectedVehicleId || selectedOrders.length === 0) {
      showMessage('Dados incompletos ou sessão inválida.', 'error');
      return;
    }
    setLoading(true);
    const payload: FrontendCreateDeliveryPayload = {
      motoristaId: selectedDriverId,
      veiculoId: selectedVehicleId,
      orders: selectedOrders.map(order => ({ id: order.id, sorting: order.sorting })),
      observacao: observacaoRoteiro.trim() || undefined,
    };
    try {
      const response = await addDelivery(token, payload);
      showMessage(response.message || `Roteiro criado com sucesso!`, 'success');
      setActiveStep(0);
      setSelectedOrders([]);
      setSelectedDriverId('');
      setObservacaoRoteiro('');
      if (token) loadEssentialData();
    } catch (error: unknown) { 
      handleApiError(error, "Falha ao criar roteiro."); 
    } finally { 
      setLoading(false); 
    }
  };

  const displaySummary = useMemo(() => {
    const totalValor = selectedOrders.reduce((sum, order) => sum + (Number(order.valor) || 0), 0);
    const freightValue = estimatedFreightData.freightValue;
    const percentage = totalValor > 0 ? (freightValue / totalValor) * 100 : 0;
    return {
      count: selectedOrders.length,
      totalPesoDisplay: selectedOrders.reduce((sum, order) => sum + (Number(order.peso) || 0), 0).toFixed(2),
      totalValorDisplay: totalValor.toFixed(2),
      estimatedFreightDisplay: freightValue.toFixed(2),
      freightPercentage: percentage.toFixed(2),
      majorRegionName: majorRegionForFreight?.regiao || "N/A",
      majorRegionValue: majorRegionForFreight ? Number(majorRegionForFreight.valorDirecao).toFixed(2) : "N/A",
    };
  }, [selectedOrders, estimatedFreightData, majorRegionForFreight]);

  const openMapForOptimizing = () => {
    if (selectedOrders.length === 0) {
      showMessage("Selecione pedidos para visualizar no mapa.", "info");
      return;
    }
    let gMapsUrl = "https://www.google.com/maps/dir/?api=1&waypoints=";
    if (selectedOrders.length === 1) {
      gMapsUrl += `${encodeURIComponent(selectedOrders[0].endereco + ", " + selectedOrders[0].cidade)}`;
    } else if (selectedOrders.length > 1) {
      const origin = encodeURIComponent(`${selectedOrders[0].endereco}, ${selectedOrders[0].cidade}`);
      const destination = encodeURIComponent(`${selectedOrders[selectedOrders.length - 1].endereco}, ${selectedOrders[selectedOrders.length - 1].cidade}`);
      const waypointsString = selectedOrders.slice(1, -1).map(order => encodeURIComponent(`${order.endereco}, ${order.cidade}`)).join('|');
      gMapsUrl += `${origin}&destination=${destination}${waypointsString ? `&waypoints=${waypointsString}` : ''}`;
    }
    window.open(gMapsUrl, '_blank');
  };

  const handleViewOrderDetails = (order: Order) => setViewingOrderDetails(order);
  const handleCloseOrderDetails = () => setViewingOrderDetails(null);

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Fade in timeout={600}>
            <Box>
              {/* Stats Cards */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <StatsCard
                    icon={<AssignmentIcon sx={{ color: 'white', fontSize: 28 }} />}
                    title="Pedidos Disponíveis"
                    value={filteredAndPendingOrders.length.toString()}
                    color="primary"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatsCard
                    icon={<PlaylistAddCheckIcon sx={{ color: 'white', fontSize: 28 }} />}
                    title="Selecionados"
                    value={selectedOrders.length.toString()}
                    color="success"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatsCard
                    icon={<ScaleIcon sx={{ color: 'white', fontSize: 28 }} />}
                    title="Peso Total"
                    value={displaySummary.totalPesoDisplay}
                    subtitle="Kg"
                    color="warning"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatsCard
                    icon={<MonetizationOnIcon sx={{ color: 'white', fontSize: 28 }} />}
                    title="Valor Total"
                    value={`R$ ${displaySummary.totalValorDisplay}`}
                    color="secondary"
                  />
                </Grid>
              </Grid>

              {/* Filters */}
              <ModernCard sx={{ mb: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <FilterListIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight="bold">
                      Filtros de Busca
                    </Typography>
                  </Box>

                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <InputLabel>Região</InputLabel>
                        <Select
                          value={filterSelectedDirectionId}
                          label="Região"
                          onChange={(e) => setFilterSelectedDirectionId(e.target.value)}
                          sx={{ borderRadius: '12px' }}
                        >
                          <MenuItem value="">
                            <em>Todas as regiões</em>
                          </MenuItem>
                          {directions.map(dir => (
                            <MenuItem key={dir.id} value={dir.id}>
                              {dir.regiao || `Range ${dir.rangeInicio}-${dir.rangeFim}`}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Número do Pedido"
                        value={filterOrderNumber}
                        onChange={(e) => setFilterOrderNumber(e.target.value)}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        InputProps={{
                          startAdornment: <AssignmentIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Data"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        placeholder="DD/MM/YYYY"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        InputProps={{
                          startAdornment: <CalendarTodayIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                        }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </ModernCard>

              {/* Orders Table */}
              <ModernCard>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" fontWeight="bold">
                      Pedidos Pendentes ({filteredAndPendingOrders.length})
                    </Typography>
                    {selectedOrders.length > 0 && (
                      <Chip
                        label={`${selectedOrders.length} selecionados`}
                        color="primary"
                        variant="filled"
                        sx={{ borderRadius: '12px', fontWeight: 600 }}
                      />
                    )}
                  </Box>

                  {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                      <CircularProgress />
                    </Box>
                  ) : filteredAndPendingOrders.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <AssignmentIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary">
                        Nenhum pedido encontrado
                      </Typography>
                    </Box>
                  ) : (
                    <TableContainer
                      component={Paper}
                      sx={{
                        maxHeight: 500,
                        borderRadius: '16px',
                        border: (theme) => `1px solid ${theme.palette.divider}`,
                      }}
                    >
                      <Table stickyHeader>
                        <TableHead>
                          <TableRow>
                            <TableCell padding="checkbox" />
                            <TableCell sx={{ fontWeight: 'bold' }}>Número</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Cliente</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Endereço</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Data</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Peso</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Valor</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Ações</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {filteredAndPendingOrders.map((order) => {
                            const isSelected = selectedOrders.some(o => o.id === order.id);
                            return (
                              <TableRow
                                hover
                                key={order.id}
                                selected={isSelected}
                                sx={{
                                  cursor: 'pointer',
                                  '&:hover': {
                                    backgroundColor: 'action.hover',
                                  },
                                }}
                              >
                                <TableCell padding="checkbox" onClick={() => handleOrderToggle(order)}>
                                  <Checkbox
                                    color="primary"
                                    checked={isSelected}
                                  />
                                </TableCell>
                                <TableCell onClick={() => handleOrderToggle(order)}>
                                  <Typography variant="body2" fontWeight="medium">
                                    {order.numero}
                                  </Typography>
                                </TableCell>
                                <TableCell onClick={() => handleOrderToggle(order)}>
                                  <Typography variant="body2">
                                    {order.cliente}
                                  </Typography>
                                </TableCell>
                                <TableCell onClick={() => handleOrderToggle(order)}>
                                  <Typography variant="body2" color="text.secondary">
                                    {`${order.endereco || ''}, ${order.cidade || ''}`}
                                  </Typography>
                                </TableCell>
                                <TableCell onClick={() => handleOrderToggle(order)}>
                                  <Typography variant="body2">
                                    {order.data}
                                  </Typography>
                                </TableCell>
                                <TableCell align="right" onClick={() => handleOrderToggle(order)}>
                                  <Typography variant="body2" fontWeight="medium">
                                    {Number(order.peso || 0).toFixed(2)} kg
                                  </Typography>
                                </TableCell>
                                <TableCell align="right" onClick={() => handleOrderToggle(order)}>
                                  <Typography variant="body2" fontWeight="medium" color="success.main">
                                    R$ {Number(order.valor || 0).toFixed(2)}
                                  </Typography>
                                </TableCell>
                                <TableCell align="center">
                                  <Tooltip title="Ver Detalhes">
                                    <IconButton
                                      size="small"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleViewOrderDetails(order);
                                      }}
                                      sx={{
                                        borderRadius: '8px',
                                        '&:hover': {
                                          backgroundColor: 'primary.main',
                                          color: 'white',
                                        },
                                      }}
                                    >
                                      <InfoIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </CardContent>
              </ModernCard>
            </Box>
          </Fade>
        );

      case 1:
        return (
          <Slide direction="left" in timeout={600}>
            <Grid container spacing={4}>
              {/* Configuration Panel */}
              <Grid item xs={12} lg={5}>
                <ModernCard>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <AirportShuttleIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="h6" fontWeight="bold">
                        Configuração da Entrega
                      </Typography>
                    </Box>

                    <FormControl fullWidth sx={{ mb: 3 }}>
                      <InputLabel>Motorista</InputLabel>
                      <Select
                        value={selectedDriverId}
                        label="Motorista"
                        onChange={(e) => setSelectedDriverId(e.target.value)}
                        sx={{ borderRadius: '12px' }}
                      >
                        <MenuItem value="">
                          <em>Selecione um motorista...</em>
                        </MenuItem>
                        {drivers.map((driver) => (
                          <MenuItem key={driver.id} value={driver.id}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: '0.75rem' }}>
                                {driver.name.charAt(0)}
                              </Avatar>
                              {driver.name}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl fullWidth sx={{ mb: 3 }}>
                      <InputLabel>Veículo</InputLabel>
                      <Select
                        value={selectedVehicleId}
                        label="Veículo"
                        onChange={(e) => setSelectedVehicleId(e.target.value)}
                        disabled={!selectedDriverId || driverVehicles.length === 0}
                        sx={{ borderRadius: '12px' }}
                      >
                        <MenuItem value="">
                          <em>
                            {!selectedDriverId
                              ? "Selecione um motorista primeiro"
                              : driverVehicles.length === 0
                              ? "Nenhum veículo disponível"
                              : "Selecione um veículo..."}
                          </em>
                        </MenuItem>
                        {driverVehicles.map((vehicle) => (
                          <MenuItem key={vehicle.id} value={vehicle.id}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <LocalShippingIcon sx={{ mr: 1, fontSize: 18 }} />
                              {vehicle.model} - {vehicle.plate}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <TextField
                      label="Observações do Roteiro"
                      multiline
                      rows={3}
                      value={observacaoRoteiro}
                      onChange={(e) => setObservacaoRoteiro(e.target.value)}
                      fullWidth
                      placeholder="Adicione observações importantes..."
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    />

                    {selectedDriverObject && selectedVehicleObject && (
                      <Box sx={{ mt: 3 }}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                          Resumo da Configuração
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                          <Chip
                            icon={<PersonIcon />}
                            label={selectedDriverObject.name}
                            color="primary"
                            variant="outlined"
                            sx={{ borderRadius: '12px' }}
                          />
                          <Chip
                            icon={<LocalShippingIcon />}
                            label={`${selectedVehicleObject.model} - ${selectedVehicleObject.plate}`}
                            color="secondary"
                            variant="outlined"
                            sx={{ borderRadius: '12px' }}
                          />
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                </ModernCard>
              </Grid>

              {/* Route Ordering */}
              <Grid item xs={12} lg={7}>
                <ModernCard>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <RouteIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="h6" fontWeight="bold">
                          Sequência de Entregas ({selectedOrders.length})
                        </Typography>
                      </Box>
                      <Box>
                        <Tooltip title="Visualizar no Google Maps">
                          <IconButton
                            onClick={openMapForOptimizing}
                            disabled={selectedOrders.length < 1}
                            sx={{
                              bgcolor: 'primary.main',
                              color: 'white',
                              borderRadius: '12px',
                              mr: 1,
                              '&:hover': {
                                bgcolor: 'primary.dark',
                                transform: 'scale(1.05)',
                              },
                              '&:disabled': {
                                bgcolor: 'action.disabledBackground',
                              },
                            }}
                          >
                            <MapIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>

                    <Alert
                      severity="info"
                      sx={{
                        mb: 2,
                        borderRadius: '12px',
                        '& .MuiAlert-message': {
                          display: 'flex',
                          alignItems: 'center',
                        },
                      }}
                    >
                      <DragIndicatorIcon sx={{ mr: 1 }} />
                      Arraste os itens pela alça para reordenar
                    </Alert>

                    <DragDropContext onDragEnd={onDragEnd}>
                      <Droppable droppableId="selectedOrdersDroppableId">
                        {(providedDroppable, snapshotDroppable) => (
                          <List
                            {...providedDroppable.droppableProps}
                            ref={providedDroppable.innerRef}
                            sx={{
                              maxHeight: 400,
                              overflow: 'auto',
                              border: (theme) => `2px dashed ${snapshotDroppable.isDraggingOver ? theme.palette.primary.main : theme.palette.divider}`,
                              borderRadius: '12px',
                              p: 1,
                              minHeight: '200px',
                              bgcolor: snapshotDroppable.isDraggingOver ? 'primary.light' : 'transparent',
                              transition: 'all 0.3s ease',
                            }}
                          >
                            {selectedOrders.map((order, index) => (
                              <Draggable key={order.id} draggableId={order.id} index={index}>
                                {(providedDraggable, snapshotDraggable) => (
                                  <ListItem
                                    ref={providedDraggable.innerRef}
                                    {...providedDraggable.draggableProps}
                                    style={providedDraggable.draggableProps.style}
                                    sx={{
                                      mb: 1,
                                      borderRadius: '12px',
                                      bgcolor: snapshotDraggable.isDragging ? 'primary.light' : 'background.paper',
                                      border: (theme) => `1px solid ${theme.palette.divider}`,
                                      boxShadow: snapshotDraggable.isDragging ? 4 : 1,
                                      transition: 'all 0.3s ease',
                                      display: 'flex',
                                      alignItems: 'center',
                                      userSelect: 'none',
                                    }}
                                  >
                                    <Box
                                      {...providedDraggable.dragHandleProps}
                                      sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        cursor: 'grab',
                                        pr: 2,
                                        color: 'text.secondary',
                                        '&:active': { cursor: 'grabbing' },
                                      }}
                                    >
                                      <DragIndicatorIcon />
                                    </Box>

                                    <Avatar
                                      sx={{
                                        width: 32,
                                        height: 32,
                                        bgcolor: 'primary.main',
                                        fontSize: '0.875rem',
                                        fontWeight: 'bold',
                                        mr: 2,
                                      }}
                                    >
                                      {order.sorting}
                                    </Avatar>

                                    <ListItemText
                                      primary={
                                        <Typography variant="body2" fontWeight="medium">
                                          {order.cliente}
                                        </Typography>
                                      }
                                      secondary={
                                        <Typography variant="caption" color="text.secondary">
                                          {`${order.endereco}, ${order.cidade}`}
                                        </Typography>
                                      }
                                    />

                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Chip
                                        label={`R$ ${Number(order.valor || 0).toFixed(2)}`}
                                        size="small"
                                        color="success"
                                        variant="outlined"
                                        sx={{ borderRadius: '8px' }}
                                      />
                                      <Tooltip title="Remover">
                                        <IconButton
                                          size="small"
                                          onClick={() => handleRemoveOrderFromSelection(order.id)}
                                          sx={{
                                            color: 'error.main',
                                            borderRadius: '8px',
                                            '&:hover': {
                                              bgcolor: 'error.main',
                                              color: 'white',
                                            },
                                          }}
                                        >
                                          <DeleteIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                    </Box>
                                  </ListItem>
                                )}
                              </Draggable>
                            ))}
                            {providedDroppable.placeholder}
                            {selectedOrders.length === 0 && (
                              <Box sx={{ textAlign: 'center', py: 4 }}>
                                <RouteIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                                <Typography variant="h6" color="text.secondary">
                                  Nenhum pedido selecionado
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Volte à etapa anterior para selecionar pedidos
                                </Typography>
                              </Box>
                            )}
                          </List>
                        )}
                      </Droppable>
                    </DragDropContext>
                  </CardContent>
                </ModernCard>
              </Grid>
            </Grid>
          </Slide>
        );

      case 2:
        const categoryOfVehicle = selectedVehicleObject && vehicleCategories.find(cat => cat.id === selectedVehicleObject.categoryId);
        return (
          <Fade in timeout={600}>
            <Box>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  sx={{
                    mb: 1,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Confirmação do Roteiro
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Revise todos os dados antes de finalizar
                </Typography>
              </Box>

              <Grid container spacing={3}>
                {/* Financial Summary */}
                <Grid item xs={12} md={6}>
                  <ModernCard>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <MonetizationOnIcon sx={{ mr: 1, color: 'success.main' }} />
                        <Typography variant="h6" fontWeight="bold">
                          Resumo Financeiro
                        </Typography>
                      </Box>

                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Box sx={{ 
                            textAlign: 'center', 
                            p: 2, 
                            borderRadius: '12px', 
                            bgcolor: 'primary.light',
                            color: 'primary.contrastText'
                          }}>
                            <Typography variant="h4" fontWeight="bold">
                              {displaySummary.count}
                            </Typography>
                            <Typography variant="body2">
                              Pedidos
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ 
                            textAlign: 'center', 
                            p: 2, 
                            borderRadius: '12px', 
                            bgcolor: 'warning.light',
                            color: 'warning.contrastText'
                          }}>
                            <Typography variant="h4" fontWeight="bold">
                              {displaySummary.totalPesoDisplay}
                            </Typography>
                            <Typography variant="body2">
                              Kg Total
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12}>
                          <Divider sx={{ my: 2 }} />
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ 
                            textAlign: 'center', 
                            p: 2, 
                            borderRadius: '12px', 
                            bgcolor: 'success.light',
                            color: 'success.contrastText'
                          }}>
                            <Typography variant="h5" fontWeight="bold">
                              R$ {displaySummary.totalValorDisplay}
                            </Typography>
                            <Typography variant="body2">
                              Valor Total
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ 
                            textAlign: 'center', 
                            p: 2, 
                            borderRadius: '12px', 
                            bgcolor: 'secondary.light',
                            color: 'secondary.contrastText'
                          }}>
                            <Typography variant="h5" fontWeight="bold">
                              R$ {displaySummary.estimatedFreightDisplay}
                            </Typography>
                            <Typography variant="body2">
                              Frete Estimado
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </ModernCard>
                </Grid>

                {/* Assignment Details */}
                <Grid item xs={12} md={6}>
                  <ModernCard>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <AirportShuttleIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="h6" fontWeight="bold">
                          Detalhes da Atribuição
                        </Typography>
                      </Box>

                      <List>
                        <ListItem sx={{ px: 0 }}>
                          <ListItemIcon>
                            <PersonIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Motorista"
                            secondary={selectedDriverObject?.name || 'N/A'}
                          />
                        </ListItem>

                        <ListItem sx={{ px: 0 }}>
                          <ListItemIcon>
                            <LocalShippingIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Veículo"
                            secondary={selectedVehicleObject ? `${selectedVehicleObject.model} - ${selectedVehicleObject.plate}` : 'N/A'}
                          />
                        </ListItem>

                        {categoryOfVehicle && (
                          <ListItem sx={{ px: 0 }}>
                            <ListItemIcon>
                              <LocalShippingIcon color="secondary" />
                            </ListItemIcon>
                            <ListItemText
                              primary="Categoria do Veículo"
                              secondary={`${categoryOfVehicle.name} (R$ ${Number(categoryOfVehicle.valor || 0).toFixed(2)})`}
                            />
                          </ListItem>
                        )}

                        {majorRegionForFreight && (
                          <ListItem sx={{ px: 0 }}>
                            <ListItemIcon>
                              <LocationOnIcon color="warning" />
                            </ListItemIcon>
                            <ListItemText
                              primary="Região Principal"
                              secondary={`${majorRegionForFreight.regiao} (R$ ${Number(majorRegionForFreight.valorDirecao).toFixed(2)})`}
                            />
                          </ListItem>
                        )}

                        {observacaoRoteiro && (
                          <ListItem sx={{ px: 0 }}>
                            <ListItemIcon>
                              <InfoIcon color="info" />
                            </ListItemIcon>
                            <ListItemText
                              primary="Observações"
                              secondary={observacaoRoteiro}
                            />
                          </ListItem>
                        )}
                      </List>
                    </CardContent>
                  </ModernCard>
                </Grid>

                {/* Final Sequence */}
                <Grid item xs={12}>
                  <ModernCard>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <RouteIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="h6" fontWeight="bold">
                          Sequência Final de Entregas
                        </Typography>
                      </Box>

                      <TableContainer
                        component={Paper}
                        sx={{
                          maxHeight: 300,
                          borderRadius: '12px',
                          border: (theme) => `1px solid ${theme.palette.divider}`,
                        }}
                      >
                        <Table size="small" stickyHeader>
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 'bold' }}>Seq.</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>Cliente</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>Endereço</TableCell>
                              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Valor</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedOrders.map((order, index) => (
                              <TableRow
                                key={order.id}
                                sx={{
                                  '&:nth-of-type(odd)': {
                                    bgcolor: 'action.hover',
                                  },
                                }}
                              >
                                <TableCell>
                                  <Avatar
                                    sx={{
                                      width: 24,
                                      height: 24,
                                      bgcolor: index === 0 ? 'success.main' : 
                                               index === selectedOrders.length - 1 ? 'error.main' : 'primary.main',
                                      fontSize: '0.75rem',
                                      fontWeight: 'bold',
                                    }}
                                  >
                                    {order.sorting}
                                  </Avatar>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2" fontWeight="medium">
                                    {order.cliente}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2" color="text.secondary">
                                    {`${order.endereco}, ${order.cidade}`}
                                  </Typography>
                                </TableCell>
                                <TableCell align="right">
                                  <Typography variant="body2" fontWeight="medium" color="success.main">
                                    R$ {Number(order.valor || 0).toFixed(2)}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </ModernCard>
                </Grid>
              </Grid>
            </Box>
          </Fade>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography
          variant="h3"
          fontWeight="bold"
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1,
          }}
        >
          Criar Novo Roteiro
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Configure entregas de forma inteligente e eficiente
        </Typography>
      </Box>

      {/* Main Content */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: '24px',
          background: (theme) => theme.palette.mode === 'dark'
            ? 'rgba(15, 23, 42, 0.8)'
            : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: (theme) => theme.palette.mode === 'dark'
            ? '1px solid rgba(148, 163, 184, 0.2)'
            : '1px solid rgba(30, 41, 59, 0.1)',
          p: { xs: 3, md: 4 },
        }}
      >
        {/* Stepper */}
        <Stepper
          activeStep={activeStep}
          alternativeLabel
          sx={{ mb: 4 }}
        >
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel
                optional={index === 2 ? <Typography variant="caption">Última Etapa</Typography> : null}
                sx={{
                  '& .MuiStepLabel-label': {
                    fontWeight: 'medium',
                    fontSize: '0.875rem',
                  },
                }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step Content */}
        <Box sx={{ minHeight: '600px' }}>
          {isLoading && activeStep === 0 && !allOrders.length ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress size={60} />
            </Box>
          ) : (
            renderStepContent()
          )}
        </Box>

        {/* Navigation */}
        <Box sx={{
          display: 'flex',
          flexDirection: 'row',
          pt: 3,
          mt: 3,
          borderTop: (theme) => `1px solid ${theme.palette.divider}`,
        }}>
          <StyledButton
            color="inherit"
            disabled={activeStep === 0 || isLoading}
            onClick={handleBack}
            sx={{ mr: 1 }}
          >
            Voltar
          </StyledButton>

          <Box sx={{ flex: '1 1 auto' }} />

          {activeStep === steps.length - 1 ? (
            <GradientButton
              onClick={handleSubmitRoute}
              disabled={isLoading || !selectedDriverId || !selectedVehicleId || selectedOrders.length === 0}
              startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <CheckCircleOutlineIcon />}
            >
              {isLoading ? 'Criando Roteiro...' : 'Finalizar Roteiro'}
            </GradientButton>
          ) : (
            <GradientButton
              onClick={handleNext}
              disabled={
                isLoading ||
                (activeStep === 0 && selectedOrders.length === 0) ||
                (activeStep === 1 && (!selectedDriverId || !selectedVehicleId || selectedOrders.length === 0))
              }
            >
              Próximo
            </GradientButton>
          )}
        </Box>
      </Paper>

      {/* Order Details Modal */}
      <Dialog
        open={!!viewingOrderDetails}
        onClose={handleCloseOrderDetails}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            background: (theme) => theme.palette.mode === 'dark'
              ? 'rgba(15, 23, 42, 0.95)'
              : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: (theme) => theme.palette.mode === 'dark'
              ? '1px solid rgba(148, 163, 184, 0.2)'
              : '1px solid rgba(30, 41, 59, 0.1)',
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight="bold">
            Detalhes do Pedido: {viewingOrderDetails?.numero}
          </Typography>
          <IconButton onClick={handleCloseOrderDetails} sx={{ borderRadius: '8px' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {viewingOrderDetails && (
            <List dense>
              <ListItem><ListItemText primary="Cliente" secondary={viewingOrderDetails.cliente} /></ListItem>
              <ListItem><ListItemText primary="CPF/CNPJ" secondary={viewingOrderDetails.cpfCnpj} /></ListItem>
              <ListItem><ListItemText primary="Data Emissão" secondary={viewingOrderDetails.data} /></ListItem>
              <ListItem><ListItemText primary="Endereço" secondary={viewingOrderDetails.endereco} /></ListItem>
              <ListItem><ListItemText primary="Bairro" secondary={viewingOrderDetails.bairro} /></ListItem>
              <ListItem><ListItemText primary="Cidade - UF" secondary={`${viewingOrderDetails.cidade} - ${viewingOrderDetails.uf}`} /></ListItem>
              <ListItem><ListItemText primary="CEP" secondary={viewingOrderDetails.cep} /></ListItem>
              <ListItem><ListItemText primary="Telefone" secondary={viewingOrderDetails.telefone} /></ListItem>
              <ListItem><ListItemText primary="Email" secondary={viewingOrderDetails.email} /></ListItem>
              <ListItem><ListItemText primary="Contato no Local" secondary={viewingOrderDetails.nomeContato} /></ListItem>
              <Divider sx={{ my: 1 }} component="li" />
              <ListItem><ListItemText primary="Peso" secondary={`${Number(viewingOrderDetails.peso || 0).toFixed(2)} Kg`} /></ListItem>
              <ListItem><ListItemText primary="Volume (Qtd)" secondary={viewingOrderDetails.volume || 'N/A'} /></ListItem>
              <ListItem><ListItemText primary="Valor da Nota" secondary={`R$ ${Number(viewingOrderDetails.valor || 0).toFixed(2)}`} /></ListItem>
              <Divider sx={{ my: 1 }} component="li" />
              <ListItem><ListItemText primary="Status Atual" secondary={viewingOrderDetails.status} /></ListItem>
              <ListItem><ListItemText primary="Prazo Entrega" secondary={viewingOrderDetails.prazo || 'N/A'} /></ListItem>
              <ListItem><ListItemText primary="Prioridade" secondary={viewingOrderDetails.prioridade || 'N/A'} /></ListItem>
              {viewingOrderDetails.instrucoesEntrega && (
                <ListItem><ListItemText primary="Instruções de Entrega" secondary={viewingOrderDetails.instrucoesEntrega} /></ListItem>
              )}
            </List>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <StyledButton onClick={handleCloseOrderDetails} variant="contained">
            Fechar
          </StyledButton>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default withAuth(RoteirizacaoPage);