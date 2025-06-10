'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
  CardActions,
  Avatar,
  Divider,
  Stack,
  TextField,
  InputAdornment,
  Collapse,
  Switch,
  FormControlLabel,
  Badge,
  LinearProgress,
  Slide,
  Zoom,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
} from '@mui/material';
import {
  Search,
  FilterList,
  Add,
  DirectionsCar,
  Person,
  LocalShipping,
  Schedule,
  CheckCircle,
  Cancel,
  Visibility,
  Close,
  RouteOutlined,
  TrendingUp,
  Assessment,
  Navigation,
  PlayArrow,
  Stop,
  Pause,
  RefreshRounded,
  Timeline,
  LocationOn,
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import Link from 'next/link';

import { fetchDeliveries } from '../../services/deliveryService';
import { Delivery, Approval, Order as AppOrder, Driver, Vehicle, Category } from '../../types';
import { useLoading } from '../context/LoadingContext';
import { useMessage } from '../context/MessageContext';
import { getStoredToken } from '../../services/authService';
import withAuth from '../hoc/withAuth';

// Styled Components
const StyledContainer = styled(Container)(({ theme }) => ({
  padding: theme.spacing(3),
  maxWidth: '1400px',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1),
  },
}));

const StatsCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: 'white',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
}));

const FilterPanel = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  background: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(10px)',
  borderRadius: theme.spacing(2),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
}));

const DeliveryCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  transition: 'all 0.3s ease',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
    borderColor: theme.palette.primary.main,
  },
}));

const StatusChip = styled(Chip)<{ status: string }>(({ theme, status }) => ({
  fontWeight: 600,
  borderRadius: theme.spacing(1),
  ...(status === 'Finalizado' && {
    backgroundColor: alpha(theme.palette.success.main, 0.1),
    color: theme.palette.success.main,
    border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
  }),
  ...(status === 'A liberar' && {
    backgroundColor: alpha(theme.palette.warning.main, 0.1),
    color: theme.palette.warning.main,
    border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
  }),
  ...(status === 'Pendente' && {
    backgroundColor: alpha(theme.palette.grey[500], 0.1),
    color: theme.palette.grey[700],
    border: `1px solid ${alpha(theme.palette.grey[500], 0.3)}`,
  }),
  ...((status === 'Iniciado' || status === 'Em rota') && {
    backgroundColor: alpha(theme.palette.info.main, 0.1),
    color: theme.palette.info.main,
    border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
  }),
  ...((status === 'Rejeitado' || status === 'Cancelado') && {
    backgroundColor: alpha(theme.palette.error.main, 0.1),
    color: theme.palette.error.main,
    border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
  }),
}));

const SearchField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(3),
    backgroundColor: alpha(theme.palette.background.paper, 0.8),
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: theme.palette.background.paper,
    },
    '&.Mui-focused': {
      backgroundColor: theme.palette.background.paper,
      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
    },
  },
}));

interface DeliveryStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  totalValue: number;
  avgOrdersPerRoute: number;
}

const DeliveriesPage: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState<Delivery[]>([]);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);

  // Estados de filtro
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [filterOpen, setFilterOpen] = useState<boolean>(false);
  const [activeFilters, setActiveFilters] = useState({
    pending: true,
    inProgress: true,
    completed: true,
    cancelled: false,
    toRelease: true,
  });

  const { isLoading, setLoading } = useLoading();
  const { showMessage } = useMessage();

  // Estatísticas calculadas
  const stats: DeliveryStats = useMemo(() => {
    const total = deliveries.length;
    const pending = deliveries.filter(d => d.status === 'Pendente').length;
    const inProgress = deliveries.filter(d => ['Iniciado', 'Em rota'].includes(d.status)).length;
    const completed = deliveries.filter(d => d.status === 'Finalizado').length;
    const cancelled = deliveries.filter(d => ['Rejeitado', 'Cancelado'].includes(d.status)).length;
    const totalValue = deliveries.reduce((sum, d) => sum + (d.totalValor || 0), 0);
    const avgOrdersPerRoute = total > 0 ? deliveries.reduce((sum, d) => sum + (d.orders?.length || 0), 0) / total : 0;

    return { total, pending, inProgress, completed, cancelled, totalValue, avgOrdersPerRoute };
  }, [deliveries]);

  const handleApiError = useCallback((error: unknown, defaultMessage: string) => {
    console.error(defaultMessage, error);
    const errorMessage = error instanceof Error ? error.message : defaultMessage;
    showMessage(errorMessage, 'error');
  }, [showMessage]);

  const loadDeliveries = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await fetchDeliveries(token);
      const validData = Array.isArray(data) ? data.filter(item => item != null) : [];
      setDeliveries(validData);
    } catch (error) {
      handleApiError(error, 'Falha ao buscar roteiros.');
    } finally {
      setLoading(false);
    }
  }, [token, setLoading, handleApiError]);

  // Filtrar deliveries
  useEffect(() => {
    let filtered = deliveries;

    // Filtro de busca
    if (searchTerm) {
      filtered = filtered.filter((delivery) =>
        Object.values(delivery).some((value) =>
          value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        delivery.Driver?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        delivery.Vehicle?.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        delivery.Vehicle?.plate?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro de data
    if (startDate && endDate) {
      filtered = filtered.filter((delivery) => {
        if (!delivery.dataInicio) return false;
        const deliveryDate = new Date(delivery.dataInicio);
        return deliveryDate >= new Date(startDate) && deliveryDate <= new Date(endDate);
      });
    }

    // Filtros de status
    const hasStatusFilters = Object.values(activeFilters).some(Boolean);
    if (hasStatusFilters) {
      filtered = filtered.filter((delivery) => {
        return (
          (activeFilters.pending && delivery.status === 'Pendente') ||
          (activeFilters.inProgress && ['Iniciado', 'Em rota'].includes(delivery.status)) ||
          (activeFilters.completed && delivery.status === 'Finalizado') ||
          (activeFilters.cancelled && ['Rejeitado', 'Cancelado'].includes(delivery.status)) ||
          (activeFilters.toRelease && delivery.status === 'A liberar')
        );
      });
    } else {
      filtered = [];
    }

    setFilteredDeliveries(filtered);
  }, [deliveries, searchTerm, startDate, endDate, activeFilters]);

  useEffect(() => {
    const t = getStoredToken();
    if (t) {
      setToken(t);
    } else {
      showMessage('Token não encontrado. Faça login novamente.', 'error');
    }
  }, [showMessage]);

  useEffect(() => {
    if (token) {
      loadDeliveries();
    }
  }, [token, loadDeliveries]);

  const handleViewDetails = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedDelivery(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Finalizado': return <CheckCircle />;
      case 'Iniciado': case 'Em rota': return <PlayArrow />;
      case 'Pendente': return <Schedule />;
      case 'A liberar': return <Pause />;
      case 'Cancelado': case 'Rejeitado': return <Cancel />;
      default: return <Schedule />;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  return (
    <StyledContainer>
      {/* Header com Estatísticas */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
          Gestão de Roteiros
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatsCard>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight={700}>
                      {stats.total}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Total de Roteiros
                    </Typography>
                  </Box>
                  <RouteOutlined sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </StatsCard>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <StatsCard sx={{ background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight={700}>
                      {stats.pending}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Pendentes
                    </Typography>
                  </Box>
                  <Schedule sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </StatsCard>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <StatsCard sx={{ background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight={700}>
                      {stats.inProgress}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Em Andamento
                    </Typography>
                  </Box>
                  <Navigation sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </StatsCard>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <StatsCard sx={{ background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight={700}>
                      {stats.completed}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Finalizados
                    </Typography>
                  </Box>
                  <CheckCircle sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </StatsCard>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <StatsCard sx={{ background: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight={700}>
                      {stats.avgOrdersPerRoute.toFixed(0)}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Média Pedidos/Rota
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                      {formatCurrency(stats.totalValue)}
                    </Typography>
                  </Box>
                  <Assessment sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </StatsCard>
          </Grid>
        </Grid>
      </Box>

      {/* Barra de Busca e Filtros */}
      <FilterPanel sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <SearchField
              fullWidth
              placeholder="Buscar por motorista, veículo, placa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="action" />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchTerm('')}>
                      <Close />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterList />}
              onClick={() => setFilterOpen(!filterOpen)}
              sx={{ height: 48, borderRadius: 3 }}
            >
              Filtros
              {Object.values(activeFilters).some(Boolean) && (
                <Chip
                  size="small"
                  label={Object.values(activeFilters).filter(Boolean).length}
                  color="primary"
                  sx={{ ml: 1, minWidth: 20, height: 20 }}
                />
              )}
            </Button>
          </Grid>

          <Grid item xs={12} md={3}>
            <Box display="flex" gap={1}>
              <Tooltip title="Atualizar">
                <IconButton
                  onClick={loadDeliveries}
                  disabled={isLoading}
                  sx={{
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': { backgroundColor: 'primary.dark' },
                  }}
                >
                  <RefreshRounded />
                </IconButton>
              </Tooltip>
              <Link href="/roteiros/criar" passHref style={{ textDecoration: 'none', flexGrow: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  sx={{ borderRadius: 2, width: '100%' }}
                >
                  Novo Roteiro
                </Button>
              </Link>
            </Box>
          </Grid>
        </Grid>

        {/* Filtros Expandidos */}
        <Collapse in={filterOpen}>
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Data Início"
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Data Fim"
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <FormControlLabel
                  control={
                    <Switch
                      checked={activeFilters.pending}
                      onChange={(e) =>
                        setActiveFilters(prev => ({ ...prev, pending: e.target.checked }))
                      }
                    />
                  }
                  label="Pendentes"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={activeFilters.inProgress}
                      onChange={(e) =>
                        setActiveFilters(prev => ({ ...prev, inProgress: e.target.checked }))
                      }
                    />
                  }
                  label="Em Andamento"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={activeFilters.completed}
                      onChange={(e) =>
                        setActiveFilters(prev => ({ ...prev, completed: e.target.checked }))
                      }
                    />
                  }
                  label="Finalizados"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={activeFilters.toRelease}
                      onChange={(e) =>
                        setActiveFilters(prev => ({ ...prev, toRelease: e.target.checked }))
                      }
                    />
                  }
                  label="A Liberar"
                />
              </Stack>
            </Grid>
          </Grid>
        </Collapse>
      </FilterPanel>

      {/* Loading */}
      {isLoading && (
        <Box sx={{ mb: 3 }}>
          <LinearProgress />
        </Box>
      )}

      {/* Lista de Roteiros */}
      {filteredDeliveries.length > 0 ? (
        <Box>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Timeline />
            Roteiros ({filteredDeliveries.length})
          </Typography>
          
          {filteredDeliveries.map((delivery, index) => (
            <Zoom key={delivery.id} in={true} style={{ transitionDelay: `${index * 50}ms` }}>
              <DeliveryCard>
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6} md={3}>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {getStatusIcon(delivery.status)}
                        </Avatar>
                        <Box>
                          <Typography variant="h6" fontWeight={600}>
                            {delivery.id.substring(0, 8)}...
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {delivery.dataInicio ? formatDate(delivery.dataInicio) : 'Sem data'}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={6} md={2}>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Person fontSize="small" color="action" />
                        <Typography variant="body2" fontWeight={600}>
                          {delivery.Driver?.name || 'Sem motorista'}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <DirectionsCar fontSize="small" color="action" />
                        <Typography variant="caption" color="text.secondary">
                          {delivery.Vehicle?.model || 'Sem veículo'} - {delivery.Vehicle?.plate || 'Sem placa'}
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={6} md={2}>
                      <StatusChip
                        status={delivery.status}
                        label={delivery.status}
                        size="small"
                      />
                    </Grid>

                    <Grid item xs={12} sm={6} md={2}>
                      <Box textAlign="center">
                        <Typography variant="h6" fontWeight={600} color="primary.main">
                          {delivery.orders?.length || 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Pedidos
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={6} md={2}>
                      <Box textAlign="center">
                        <Typography variant="h6" fontWeight={600} color="success.main">
                          {formatCurrency(delivery.totalValor || 0)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Valor Total
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={6} md={1}>
                      <Box display="flex" justifyContent="center">
                        <Tooltip title="Ver Detalhes">
                          <IconButton
                            onClick={() => handleViewDetails(delivery)}
                            sx={{
                              backgroundColor: 'primary.main',
                              color: 'white',
                              '&:hover': { backgroundColor: 'primary.dark' },
                            }}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </DeliveryCard>
            </Zoom>
          ))}
        </Box>
      ) : !isLoading ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <LocalShipping sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Nenhum roteiro encontrado
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ajuste os filtros para encontrar os roteiros desejados
          </Typography>
        </Paper>
      ) : null}

      {/* Modal de Detalhes */}
      {selectedDelivery && (
        <Dialog open={detailModalOpen} onClose={handleCloseDetailModal} maxWidth="lg" fullWidth>
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
            <Typography variant="h5" fontWeight={600}>
              Detalhes do Roteiro: {selectedDelivery.id.substring(0, 8)}...
            </Typography>
            <IconButton onClick={handleCloseDetailModal}>
              <Close />
            </IconButton>
          </DialogTitle>
          
          <DialogContent dividers>
            <Grid container spacing={3}>
              {/* Informações do Motorista e Veículo */}
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Person /> Motorista
                  </Typography>
                  <Typography><strong>Nome:</strong> {selectedDelivery.Driver?.name || 'N/A'}</Typography>
                  <Typography variant="body2" color="text.secondary">CNH: {selectedDelivery.Driver?.license || 'N/A'}</Typography>
                  <Typography variant="body2" color="text.secondary">CPF: {selectedDelivery.Driver?.cpf || 'N/A'}</Typography>
                </Paper>

                <Paper sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DirectionsCar /> Veículo
                  </Typography>
                  <Typography><strong>Modelo:</strong> {selectedDelivery.Vehicle?.model || 'N/A'}</Typography>
                  <Typography><strong>Placa:</strong> {selectedDelivery.Vehicle?.plate || 'N/A'}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Categoria: {selectedDelivery.Vehicle?.Category?.name || 'N/A'}
                    {selectedDelivery.Vehicle?.Category?.valor && ` (${formatCurrency(selectedDelivery.Vehicle.Category.valor)})`}
                  </Typography>
                </Paper>

                <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Assessment /> Resumo do Roteiro
                  </Typography>
                  <List dense>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText primary="Status" secondary={selectedDelivery.status} />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText 
                        primary="Data de Início" 
                        secondary={selectedDelivery.dataInicio ? formatDate(selectedDelivery.dataInicio) : 'N/A'} 
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText 
                        primary="Data de Fim" 
                        secondary={selectedDelivery.dataFim ? formatDate(selectedDelivery.dataFim) : 'N/A'} 
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText 
                        primary="Valor do Frete" 
                        secondary={formatCurrency(selectedDelivery.valorFrete || 0)}
                        secondaryTypographyProps={{ fontWeight: 'bold', color: 'primary.main' }}
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText 
                        primary="Peso Total" 
                        secondary={`${Number(selectedDelivery.totalPeso || 0).toFixed(2)} Kg`} 
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText 
                        primary="Valor Total" 
                        secondary={formatCurrency(selectedDelivery.totalValor || 0)} 
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>

              {/* Pedidos e Histórico */}
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 2, mb: 2 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOn /> Pedidos no Roteiro ({selectedDelivery.orders?.length || 0})
                  </Typography>
                  <TableContainer sx={{ maxHeight: 300 }}>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>Seq.</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Número</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Cliente</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Endereço</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(selectedDelivery.orders || [])
                          .slice()
                          .sort((a: AppOrder, b: AppOrder) => (a.sorting || 0) - (b.sorting || 0))
                          .map((order: AppOrder, index: number) => (
                            <TableRow key={order.id} hover>
                              <TableCell>{order.sorting || index + 1}</TableCell>
                              <TableCell>{order.numero}</TableCell>
                              <TableCell>{order.cliente}</TableCell>
                              <TableCell>{order.endereco}, {order.cidade}</TableCell>
                              <TableCell>
                                <Chip label={order.status} size="small" />
                              </TableCell>
                            </TableRow>
                          ))}
                        {(!selectedDelivery.orders || selectedDelivery.orders.length === 0) && (
                          <TableRow>
                            <TableCell colSpan={5} align="center">
                              Nenhum pedido neste roteiro.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>

                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Timeline /> Histórico de Liberações
                  </Typography>
                  {selectedDelivery.approvals && selectedDelivery.approvals.length > 0 ? (
                    <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
                      {selectedDelivery.approvals.map((approval: Approval) => (
                        <ListItem key={approval.id} divider sx={{ '&:last-child': { borderBottom: 0 } }}>
                          <ListItemText
                            primary={
                              <Typography
                                variant="body2"
                                color={
                                  approval.action === 'approved' || approval.action === 'APPROVED'
                                    ? 'success.main'
                                    : 'error.main'
                                }
                                fontWeight={600}
                              >
                                {approval.action === 'approved' || approval.action === 'APPROVED'
                                  ? 'APROVADO'
                                  : approval.action === 'rejected' || approval.action === 'REJECTED'
                                  ? 'REJEITADO'
                                  : String(approval.action).toUpperCase()}{' '}
                                por {approval.User?.name || approval.userName || 'Usuário desconhecido'}
                              </Typography>
                            }
                            secondary={
                              <Typography variant="caption">
                                Em: {new Date(approval.createdAt).toLocaleString('pt-BR')}
                                {approval.motivo && ` - Motivo: ${approval.motivo}`}
                              </Typography>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      Nenhuma liberação/rejeição registrada.
                    </Typography>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </DialogContent>
          
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleCloseDetailModal} variant="outlined">
              Fechar
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </StyledContainer>
  );
};

export default withAuth(DeliveriesPage);