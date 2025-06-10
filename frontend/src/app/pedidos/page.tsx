// src/app/view-orders/page.tsx
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Typography, Container, Paper, Grid, TextField, Button,
  CircularProgress, IconButton, Tooltip, Box,
  Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText, Divider,
  FormControl, InputLabel, Select, MenuItem, Chip,
  Menu, Checkbox, ListItemIcon, Card, CardContent, Avatar, Stack, InputAdornment,
  Switch, FormControlLabel, Badge, LinearProgress, Slide, Zoom, Collapse, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination,
} from '@mui/material';
import {
  FilterList as FilterListIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  FileDownload as FileDownloadIcon,
  ViewColumn as ViewColumnIcon,
  History as HistoryIcon,
  Search,
  Assignment,
  LocalShipping,
  CheckCircle,
  Cancel,
  Schedule,
  MonetizationOn,
  Scale,
  LocationOn,
  Assessment,
  TrendingUp,
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';

import * as XLSX from 'xlsx';
import Papa from 'papaparse';

import withAuth from '../hoc/withAuth';
import { fetchOrders as fetchOrdersFromApi, fetchOrderHistory } from '../../services/orderService';
import { useLoading } from '../context/LoadingContext';
import { useMessage } from '../context/MessageContext';
import { Order } from '../../types';
import { getStoredToken } from '../../services/authService';

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

const OrderCard = styled(Card)(({ theme }) => ({
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
  ...(status === 'Entrega Finalizada' && {
    backgroundColor: alpha(theme.palette.success.main, 0.1),
    color: theme.palette.success.main,
    border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
  }),
  ...(status === 'Pendente' && {
    backgroundColor: alpha(theme.palette.warning.main, 0.1),
    color: theme.palette.warning.main,
    border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
  }),
  ...((status === 'Em rota' || status === 'Entrega Iniciada') && {
    backgroundColor: alpha(theme.palette.info.main, 0.1),
    color: theme.palette.info.main,
    border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
  }),
  ...((status === 'Entrega Retornada' || status === 'Cancelado') && {
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

// Interface para o histórico do pedido
interface OrderHistoryEvent {
  id: string;
  timestamp: string;
  eventType: string;
  description: string;
  user?: string;
  details?: {
    oldStatus?: string;
    newStatus?: string;
    reason?: string;
    proofUrl?: string;
  };
}

interface OrderStats {
  total: number;
  pending: number;
  inRoute: number;
  delivered: number;
  cancelled: number;
  totalValue: number;
  totalWeight: number;
}

const ORDER_STATUSES = ['Pendente', 'Em rota', 'Entrega Iniciada', 'Entrega Finalizada', 'Entrega Retornada', 'Cancelado'];

const ViewOrdersPage: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);

  // Estados de filtro
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterNumero, setFilterNumero] = useState<string>('');
  const [filterCliente, setFilterCliente] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterDataInicio, setFilterDataInicio] = useState<string>('');
  const [filterDataFim, setFilterDataFim] = useState<string>('');
  const [filterOpen, setFilterOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Estados de paginação
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12);

  // Estados do modal
  const [viewingOrderDetails, setViewingOrderDetails] = useState<Order | null>(null);
  const [orderHistory, setOrderHistory] = useState<OrderHistoryEvent[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Estados de colunas (para modo tabela)
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'numero', 'cliente', 'data', 'status', 'valor', 'cidade', 'deliveryDriverName', 'actions'
  ]);
  const [columnMenuAnchorEl, setColumnMenuAnchorEl] = useState<null | HTMLElement>(null);

  const { isLoading, setLoading } = useLoading();
  const { showMessage } = useMessage();

  // Estatísticas calculadas
  const stats: OrderStats = useMemo(() => {
    const total = allOrders.length;
    const pending = allOrders.filter(o => o.status === 'Pendente').length;
    const inRoute = allOrders.filter(o => ['Em rota', 'Entrega Iniciada'].includes(o.status)).length;
    const delivered = allOrders.filter(o => o.status === 'Entrega Finalizada').length;
    const cancelled = allOrders.filter(o => ['Entrega Retornada', 'Cancelado'].includes(o.status)).length;
    const totalValue = allOrders.reduce((sum, o) => sum + (Number(o.valor) || 0), 0);
    const totalWeight = allOrders.reduce((sum, o) => sum + (Number(o.peso) || 0), 0);

    return { total, pending, inRoute, delivered, cancelled, totalValue, totalWeight };
  }, [allOrders]);

  const handleApiError = useCallback((error: unknown, defaultMessage: string) => {
    console.error(defaultMessage, error);
    const errorMessage = error instanceof Error ? error.message : defaultMessage;
    showMessage(errorMessage, 'error');
  }, [showMessage]);

  useEffect(() => {
    const t = getStoredToken();
    if (t) setToken(t); else showMessage('Token não encontrado.', 'error');
  }, [showMessage]);

  const loadOrders = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const ordersData = await fetchOrdersFromApi(token);
      setAllOrders(ordersData || []);
    } catch (error) { 
      handleApiError(error, "Falha ao carregar pedidos."); 
    }
    finally { 
      setLoading(false); 
    }
  }, [token, setLoading, handleApiError]);

  // Filtrar pedidos
  useEffect(() => {
    let filtered = allOrders;

    // Filtro de busca global
    if (searchTerm) {
      filtered = filtered.filter(order =>
        Object.values(order).some(value =>
          value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Filtros específicos
    if (filterNumero) {
      filtered = filtered.filter(order =>
        order.numero.toLowerCase().includes(filterNumero.toLowerCase())
      );
    }

    if (filterCliente) {
      filtered = filtered.filter(order =>
        order.cliente.toLowerCase().includes(filterCliente.toLowerCase())
      );
    }

    if (filterStatus) {
      filtered = filtered.filter(order => order.status === filterStatus);
    }

    // Filtro de data
    if (filterDataInicio || filterDataFim) {
      filtered = filtered.filter(order => {
        if (!order.data) return false;
        try {
          const parts = order.data.split('/');
          const orderDateISO = `${parts[2]}-${parts[1]}-${parts[0]}`;
          let matchesDateRange = true;
          if (filterDataInicio && orderDateISO < filterDataInicio) matchesDateRange = false;
          if (filterDataFim && orderDateISO > filterDataFim) matchesDateRange = false;
          return matchesDateRange;
        } catch (e) {
          console.warn("Data inválida no pedido:", order.data);
          return false;
        }
      });
    }

    setFilteredOrders(filtered);
    setPage(0); // Reset page when filters change
  }, [allOrders, searchTerm, filterNumero, filterCliente, filterStatus, filterDataInicio, filterDataFim]);

  useEffect(() => {
    if (token) {
      loadOrders();
    }
  }, [token, loadOrders]);

  const ordersToDisplay = useMemo(() => {
    return filteredOrders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredOrders, page, rowsPerPage]);

  const handleViewDetails = useCallback((order: Order) => {
    setViewingOrderDetails(order);
    setOrderHistory([]);
  }, []);

  const handleCloseDetailsModal = () => {
    setViewingOrderDetails(null);
    setOrderHistory([]);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterNumero('');
    setFilterCliente('');
    setFilterStatus('');
    setFilterDataInicio('');
    setFilterDataFim('');
    setPage(0);
  };

  const handleExport = (format: 'csv' | 'excel') => {
    if (filteredOrders.length === 0) {
      showMessage('Nenhum pedido para exportar com os filtros atuais.', 'info');
      return;
    }
    setLoading(true);
    try {
      const dataToExport = filteredOrders.map(order => ({
        'Número': order.numero,
        'Cliente': order.cliente,
        'Data': order.data,
        'Status': order.status,
        'Valor_R$': Number(order.valor || 0).toFixed(2),
        'Peso_Kg': Number(order.peso || 0).toFixed(2),
        'Cidade': order.cidade,
        'UF': order.uf,
        'CEP': order.cep,
        'Endereço': order.endereco,
        'Bairro': order.bairro,
        'Telefone': order.telefone,
        'Email': order.email,
        'Contato_Local': order.nomeContato,
        'Instruções': order.instrucoesEntrega,
        'Motorista_Rota': order.Delivery?.Driver?.name || '',
        'ID_Roteiro': order.deliveryId || '',
      }));

      if (format === 'csv') {
        const csv = Papa.unparse(dataToExport);
        const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'pedidos.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showMessage('Exportado para CSV!', 'success');
      } else if (format === 'excel') {
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Pedidos');
        XLSX.writeFile(workbook, 'pedidos.xlsx');
        showMessage('Exportado para Excel!', 'success');
      }
    } catch (error) {
      handleApiError(error, 'Falha ao exportar pedidos.');
    }
    finally {
      setLoading(false);
    }
  };

  const handleFetchOrderHistory = async (orderId: string | undefined) => {
    if (!token || !orderId) {
      showMessage("ID do pedido não encontrado para buscar histórico.", "warning");
      return;
    }
    setIsLoadingHistory(true);
    setOrderHistory([]);
    try {
      const historyData = await fetchOrderHistory(token, orderId);
      setOrderHistory(historyData);
      if (historyData.length === 0) {
        showMessage("Nenhum histórico encontrado para este pedido.", "info");
      } else {
        showMessage(`Histórico carregado: ${historyData.length} eventos.`, "success");
      }
    } catch (error) {
      handleApiError(error, "Falha ao buscar histórico do pedido.");
      setOrderHistory([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Entrega Finalizada': return <CheckCircle />;
      case 'Em rota': case 'Entrega Iniciada': return <LocalShipping />;
      case 'Pendente': return <Schedule />;
      case 'Cancelado': case 'Entrega Retornada': return <Cancel />;
      default: return <Schedule />;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleChangePage = (event: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <StyledContainer>
      {/* Header com Estatísticas */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
          Visualizar Pedidos
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
                      Total de Pedidos
                    </Typography>
                  </Box>
                  <Assignment sx={{ fontSize: 40, opacity: 0.8 }} />
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
                      {stats.inRoute}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Em Rota
                    </Typography>
                  </Box>
                  <LocalShipping sx={{ fontSize: 40, opacity: 0.8 }} />
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
                      {stats.delivered}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Entregues
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                      {formatCurrency(stats.totalValue)}
                    </Typography>
                  </Box>
                  <CheckCircle sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </StatsCard>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <StatsCard sx={{ background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight={700}>
                      {stats.cancelled}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Cancelados/Retornados
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                      {stats.totalWeight.toFixed(0)} kg
                    </Typography>
                  </Box>
                  <Cancel sx={{ fontSize: 40, opacity: 0.8 }} />
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
              placeholder="Buscar por número, cliente, cidade..."
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
                      <CloseIcon />
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
              startIcon={<FilterListIcon />}
              onClick={() => setFilterOpen(!filterOpen)}
              sx={{ height: 48, borderRadius: 3 }}
            >
              Filtros
              {(filterNumero || filterCliente || filterStatus || filterDataInicio || filterDataFim) && (
                <Chip
                  size="small"
                  label="Ativo"
                  color="primary"
                  sx={{ ml: 1, minWidth: 20, height: 20 }}
                />
              )}
            </Button>
          </Grid>

          <Grid item xs={12} md={3}>
            <Box display="flex" gap={1}>
              <FormControlLabel
                control={
                  <Switch
                    checked={viewMode === 'cards'}
                    onChange={(e) => setViewMode(e.target.checked ? 'cards' : 'table')}
                  />
                }
                label="Cards"
                sx={{ fontSize: '0.8rem' }}
              />
              <Button
                variant="contained"
                startIcon={<FileDownloadIcon />}
                onClick={() => handleExport('excel')}
                disabled={isLoading || filteredOrders.length === 0}
                sx={{ borderRadius: 2 }}
              >
                Excel
              </Button>
              <Tooltip title="Atualizar">
                <IconButton
                  onClick={loadOrders}
                  disabled={isLoading}
                  sx={{
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': { backgroundColor: 'primary.dark' },
                  }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>

        {/* Filtros Expandidos */}
        <Collapse in={filterOpen}>
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                label="Número Pedido"
                value={filterNumero}
                onChange={(e) => setFilterNumero(e.target.value)}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Nome Cliente"
                value={filterCliente}
                onChange={(e) => setFilterCliente(e.target.value)}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth variant="outlined" size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  label="Status"
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value=""><em>Todos</em></MenuItem>
                  {ORDER_STATUSES.map(status => (
                    <MenuItem key={status} value={status}>{status}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                label="Data Início"
                type="date"
                value={filterDataInicio}
                onChange={(e) => setFilterDataInicio(e.target.value)}
                InputLabelProps={{ shrink: true }}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                label="Data Fim"
                type="date"
                value={filterDataFim}
                onChange={(e) => setFilterDataFim(e.target.value)}
                InputLabelProps={{ shrink: true }}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={1}>
              <Button
                variant="outlined"
                onClick={handleClearFilters}
                size="medium"
                fullWidth
                sx={{ height: 40 }}
              >
                Limpar
              </Button>
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

      {/* Lista de Pedidos */}
      {filteredOrders.length > 0 ? (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Assignment />
              Pedidos ({filteredOrders.length})
            </Typography>
          </Box>

          {viewMode === 'cards' ? (
            // Modo Cards
            <Grid container spacing={2}>
              {ordersToDisplay.map((order, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={order.id}>
                  <Zoom in={true} style={{ transitionDelay: `${index * 50}ms` }}>
                    <OrderCard onClick={() => handleViewDetails(order)} sx={{ cursor: 'pointer' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="h6" fontWeight={600} noWrap>
                              #{order.numero}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" noWrap>
                              {order.cliente}
                            </Typography>
                          </Box>
                          <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                            {getStatusIcon(order.status)}
                          </Avatar>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <StatusChip
                            status={order.status}
                            label={order.status}
                            size="small"
                            sx={{ mb: 1 }}
                          />
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            {order.data} • {order.cidade}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="h6" fontWeight={600} color="success.main">
                              {formatCurrency(Number(order.valor || 0))}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {Number(order.peso || 0).toFixed(2)} kg
                            </Typography>
                          </Box>
                          <Box>
                            {order.Delivery?.Driver?.name && (
                              <Chip
                                label={order.Delivery.Driver.name}
                                size="small"
                                color="secondary"
                                sx={{ fontSize: '0.7rem' }}
                              />
                            )}
                          </Box>
                        </Box>
                      </CardContent>
                    </OrderCard>
                  </Zoom>
                </Grid>
              ))}
            </Grid>
          ) : (
            // Modo Tabela
            <Paper elevation={1} sx={{ borderRadius: 3 }}>
              <TableContainer>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Número</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Cliente</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Data</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }} align="right">Valor</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Cidade</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Motorista</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }} align="center">Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {isLoading && ordersToDisplay.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} align="center">
                          <CircularProgress sx={{ my: 3 }} />
                        </TableCell>
                      </TableRow>
                    )}
                    {!isLoading && ordersToDisplay.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} align="center">
                          Nenhum pedido encontrado.
                        </TableCell>
                      </TableRow>
                    )}
                    {ordersToDisplay.map((order) => (
                      <TableRow hover key={order.id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {order.numero}
                          </Typography>
                        </TableCell>
                        <TableCell>{order.cliente}</TableCell>
                        <TableCell>{order.data}</TableCell>
                        <TableCell>
                          <StatusChip
                            status={order.status}
                            label={order.status}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="medium" color="success.dark">
                            {formatCurrency(Number(order.valor || 0))}
                          </Typography>
                        </TableCell>
                        <TableCell>{order.cidade}</TableCell>
                        <TableCell>
                          {order.Delivery?.Driver?.name || (order.deliveryId ? 'Em rota' : '-')}
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Ver Detalhes">
                            <IconButton size="small" onClick={() => handleViewDetails(order)}>
                              <InfoIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[12, 25, 50, 100]}
                component="div"
                count={filteredOrders.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Pedidos por página:"
              />
            </Paper>
          )}

          {/* Paginação para modo Cards */}
          {viewMode === 'cards' && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <TablePagination
                rowsPerPageOptions={[12, 24, 48]}
                component="div"
                count={filteredOrders.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Pedidos por página:"
              />
            </Box>
          )}
        </Box>
      ) : !isLoading ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Assignment sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Nenhum pedido encontrado
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ajuste os filtros para encontrar os pedidos desejados
          </Typography>
        </Paper>
      ) : null}

      {/* Modal de Detalhes do Pedido */}
      <Dialog open={!!viewingOrderDetails} onClose={handleCloseDetailsModal} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Detalhes do Pedido: {viewingOrderDetails?.numero}
          <IconButton aria-label="close" onClick={handleCloseDetailsModal}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {viewingOrderDetails && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Informações do Cliente
                </Typography>
                <List dense disablePadding>
                  <ListItem>
                    <ListItemText primary="Cliente:" secondary={viewingOrderDetails.cliente} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="CPF/CNPJ:" secondary={viewingOrderDetails.cpfCnpj} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Telefone:" secondary={viewingOrderDetails.telefone} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Email:" secondary={viewingOrderDetails.email} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Contato no Local:" secondary={viewingOrderDetails.nomeContato} />
                  </ListItem>
                </List>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Endereço de Entrega
                </Typography>
                <List dense disablePadding>
                  <ListItem>
                    <ListItemText primary="Endereço:" secondary={viewingOrderDetails.endereco} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Bairro:" secondary={viewingOrderDetails.bairro} />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Cidade - UF:" 
                      secondary={`${viewingOrderDetails.cidade} - ${viewingOrderDetails.uf}`} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="CEP:" secondary={viewingOrderDetails.cep} />
                  </ListItem>
                </List>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Detalhes da Nota/Pedido
                </Typography>
                <List dense disablePadding>
                  <ListItem>
                    <ListItemText primary="Data Emissão:" secondary={viewingOrderDetails.data} />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Peso:" 
                      secondary={`${Number(viewingOrderDetails.peso || 0).toFixed(2)} Kg`} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Volume (Qtd):" 
                      secondary={viewingOrderDetails.volume || 'N/A'} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Valor da Nota:" 
                      secondary={formatCurrency(Number(viewingOrderDetails.valor || 0))} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Prazo Entrega:" 
                      secondary={viewingOrderDetails.prazo || 'N/A'} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Prioridade:" 
                      secondary={viewingOrderDetails.prioridade || 'N/A'} 
                    />
                  </ListItem>
                </List>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Status e Roteiro
                </Typography>
                <List dense disablePadding>
                  <ListItem>
                    <ListItemText 
                      primary="Status Atual:" 
                      secondary={
                        <StatusChip
                          status={viewingOrderDetails.status}
                          label={viewingOrderDetails.status}
                          size="small"
                        />
                      } 
                    />
                  </ListItem>
                  {viewingOrderDetails.Delivery && (
                    <>
                      <ListItem>
                        <ListItemText 
                          primary="Em Roteiro (ID):" 
                          secondary={viewingOrderDetails.deliveryId} 
                        />
                      </ListItem>
                      {viewingOrderDetails.Delivery.Driver && (
                        <ListItem>
                          <ListItemText 
                            primary="Motorista Designado:" 
                            secondary={viewingOrderDetails.Delivery.Driver.name} 
                          />
                        </ListItem>
                      )}
                    </>
                  )}
                  {viewingOrderDetails.instrucoesEntrega && (
                    <ListItem>
                      <ListItemText 
                        primary="Instruções:" 
                        secondary={viewingOrderDetails.instrucoesEntrega} 
                      />
                    </ListItem>
                  )}
                </List>
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Histórico de Ocorrências
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleFetchOrderHistory(viewingOrderDetails.id)}
                    disabled={isLoadingHistory}
                    startIcon={isLoadingHistory ? <CircularProgress size={16} /> : <HistoryIcon />}
                  >
                    {isLoadingHistory ? "Carregando..." : "Carregar Histórico"}
                  </Button>
                </Box>
                {isLoadingHistory && (
                  <CircularProgress size={24} sx={{ display: 'block', margin: '10px auto' }} />
                )}
                {!isLoadingHistory && orderHistory.length > 0 && (
                  <List dense sx={{ maxHeight: 200, overflow: 'auto', border: '1px solid #eee', borderRadius: 1, p: 1, bgcolor: 'grey.50' }}>
                    {orderHistory.map(event => (
                      <ListItem key={event.id} dense sx={{ borderBottom: '1px dotted #ddd', '&:last-child': { borderBottom: 0 } }}>
                        <ListItemIcon sx={{ minWidth: '30px' }}>
                          <HistoryIcon fontSize="small" color="action" />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="body2">
                              <strong>{event.eventType}:</strong> {event.description}
                            </Typography>
                          }
                          secondary={`${new Date(event.timestamp).toLocaleString()} ${event.user ? `- Por: ${event.user}` : ''}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
                {!isLoadingHistory && orderHistory.length === 0 && viewingOrderDetails && (
                  <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                    {viewingOrderDetails && !isLoadingHistory && orderHistory.length === 0 && !isLoadingHistory 
                      ? "Nenhum histórico encontrado para este pedido." 
                      : 'Clique em "Carregar Histórico" para ver as ocorrências.'
                    }
                  </Typography>
                )}
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetailsModal}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </StyledContainer>
  );
};

export default withAuth(ViewOrdersPage);