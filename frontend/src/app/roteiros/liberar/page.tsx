'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  Typography,
  Grid,
  Button,
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Badge,
  Stack,
  Tooltip,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  InputAdornment,
  Switch,
  FormControlLabel,
  Collapse,
} from '@mui/material';
import {
  PendingActions,
  CheckCircle,
  Cancel,
  Visibility,
  LocalShipping,
  Person,
  DirectionsCar,
  MonetizationOn,
  Scale,
  Schedule,
  Block,
  Assessment,
  Refresh,
  FilterList,
  Search,
  Close,
  Timeline,
} from '@mui/icons-material';

import { 
  type Delivery, 
  type DeliveryFilters,
  DeliveryStatus,
  DELIVERY_STATUS_ARRAYS,
  StatusHelper,
} from '../../../types';
import DS from '../../components/ds';
import { useCrud, useFilters } from '../../hooks';
import withAuth from '../../hoc/withAuth';
import { useMessage } from '../../context/MessageContext';
import { useLoading } from '../../context/LoadingContext';

// ========================================
// INTERFACES E TIPOS
// ========================================

interface ReleaseStats {
  total: number;
  toRelease: number;
  pending: number;
  rejected: number;
  released: number;
  totalValue: number;
  avgOrdersPerDelivery: number;
}

interface ReleaseDialogProps {
  open: boolean;
  delivery: Delivery | null;
  onClose: () => void;
  onConfirm: () => void;
}

interface RejectDialogProps {
  open: boolean;
  delivery: Delivery | null;
  reason: string;
  onReasonChange: (reason: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

// ========================================
// COMPONENTES AUXILIARES
// ========================================

const ReleaseDialog: React.FC<ReleaseDialogProps> = ({ 
  open, 
  delivery, 
  onClose, 
  onConfirm 
}) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <CheckCircle color="success" />
      Liberar Roteiro
    </DialogTitle>
    <DialogContent>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Confirma a liberação do roteiro <strong>{delivery?.id.substring(0, 8)}...</strong>?
      </Typography>
      {delivery && (
        <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Motorista</Typography>
              <Typography variant="body2" fontWeight={600}>
                {delivery.Driver?.name || 'Não definido'}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Veículo</Typography>
              <Typography variant="body2" fontWeight={600}>
                {delivery.Vehicle?.model} - {delivery.Vehicle?.plate}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Pedidos</Typography>
              <Typography variant="body2" fontWeight={600}>
                {delivery.orders?.length || 0} pedidos
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Valor Total</Typography>
              <Typography variant="body2" fontWeight={600} color="success.main">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(delivery.totalValor || 0)}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      )}
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancelar</Button>
      <DS.ActionButton dsVariant="primary" onClick={onConfirm}>
        Liberar Roteiro
      </DS.ActionButton>
    </DialogActions>
  </Dialog>
);

const RejectDialog: React.FC<RejectDialogProps> = ({ 
  open, 
  delivery, 
  reason, 
  onReasonChange, 
  onClose, 
  onConfirm 
}) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Cancel color="error" />
      Rejeitar Roteiro
    </DialogTitle>
    <DialogContent>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Rejeitar o roteiro <strong>{delivery?.id.substring(0, 8)}...</strong>
      </Typography>
      <TextField
        fullWidth
        multiline
        rows={3}
        label="Motivo da rejeição"
        value={reason}
        onChange={(e) => onReasonChange(e.target.value)}
        placeholder="Descreva o motivo da rejeição..."
        required
      />
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancelar</Button>
      <DS.ActionButton 
        dsVariant="danger" 
        onClick={onConfirm}
        disabled={!reason.trim()}
      >
        Rejeitar Roteiro
      </DS.ActionButton>
    </DialogActions>
  </Dialog>
);

const DeliveryDetailsDialog: React.FC<{
  open: boolean;
  delivery: Delivery | null;
  onClose: () => void;
}> = ({ open, delivery, onClose }) => (
  <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
    <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Timeline color="primary" />
        Detalhes do Roteiro
      </Box>
      <DS.IconButton onClick={onClose}>
        <Close />
      </DS.IconButton>
    </DialogTitle>
    <DialogContent>
      {delivery && (
        <Box sx={{ pt: 1 }}>
          {/* Informações Gerais */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Informações Gerais</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Status</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <DS.StatusChip status={delivery.status} />
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Data de Início</Typography>
                  <Typography variant="body2">
                    {delivery.dataInicio 
                      ? new Date(delivery.dataInicio).toLocaleString('pt-BR')
                      : 'Não definida'
                    }
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Motorista</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {delivery.Driver?.name || 'Não definido'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Veículo</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {delivery.Vehicle?.model} - {delivery.Vehicle?.plate}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Resumo Financeiro */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Resumo Financeiro</Typography>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary">Valor Total</Typography>
                  <Typography variant="h6" color="success.main">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(delivery.totalValor || 0)}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary">Peso Total</Typography>
                  <Typography variant="h6" color="info.main">
                    {delivery.totalPeso || 0} kg
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary">Frete</Typography>
                  <Typography variant="h6" color="primary.main">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(delivery.valorFrete || 0)}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Lista de Pedidos */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Pedidos ({delivery.orders?.length || 0})
              </Typography>
              <List dense>
                {delivery.orders?.map((order, index) => (
                  <React.Fragment key={order.id}>
                    <ListItem>
                      <ListItemText
                        primary={`#${order.numero} - ${order.cliente}`}
                        secondary={
                          <Box>
                            <Typography variant="caption" component="span">
                              {order.endereco}, {order.cidade} - {order.uf}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                              <Chip 
                                size="small" 
                                label={order.status} 
                                variant="outlined"
                              />
                              <Chip 
                                size="small" 
                                label={new Intl.NumberFormat('pt-BR', {
                                  style: 'currency',
                                  currency: 'BRL',
                                }).format(order.valor)}
                                color="success"
                                variant="outlined"
                              />
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < (delivery.orders?.length || 0) - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Box>
      )}
    </DialogContent>
  </Dialog>
);

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

const ReleasePage: React.FC = () => {
  const { showMessage } = useMessage();
  const { setLoading } = useLoading();

  // Estados dos diálogos
  const [releaseDialogOpen, setReleaseDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);

  // Hook CRUD para deliveries
  const deliveries = useCrud<Delivery>('/delivery', { globalLoading: true });

  // Configuração dos filtros
  const filterFunctions = {
    search: (delivery: Delivery, term: string) => {
      const searchTerm = term.toLowerCase();
      return (
        delivery.Driver?.name?.toLowerCase().includes(searchTerm) ||
        delivery.Vehicle?.model?.toLowerCase().includes(searchTerm) ||
        delivery.Vehicle?.plate?.toLowerCase().includes(searchTerm) ||
        delivery.id.toLowerCase().includes(searchTerm) ||
        delivery.orders?.some(order => 
          order.numero.toLowerCase().includes(searchTerm) ||
          order.cliente.toLowerCase().includes(searchTerm)
        ) || false
      );
    },
    status: (delivery: Delivery, status: string) => {
      if (!status) return true;
      return delivery.status === status;
    },
    dateRange: (delivery: Delivery, start: string, end: string) => {
      if (!start || !end || !delivery.dataInicio) return true;
      const deliveryDate = new Date(delivery.dataInicio);
      return deliveryDate >= new Date(start) && deliveryDate <= new Date(end);
    },
    custom: {
      toRelease: (delivery: Delivery) => delivery.status === DeliveryStatus.A_LIBERAR,
      pending: (delivery: Delivery) => delivery.status === DeliveryStatus.INICIADO,
      rejected: (delivery: Delivery) => delivery.status === DeliveryStatus.REJEITADO,
      released: (delivery: Delivery) => delivery.status === DeliveryStatus.FINALIZADO,
    }
  };

  // Hook de filtros
  const { filteredData, filters, actions: filterActions } = useFilters(
    deliveries.data, 
    filterFunctions
  );

  // Estatísticas calculadas
  const stats: ReleaseStats = useMemo(() => {
    const total = deliveries.data.length;
    const toRelease = deliveries.data.filter(d => d.status === DeliveryStatus.A_LIBERAR).length;
    const pending = deliveries.data.filter(d => d.status === DeliveryStatus.INICIADO).length;
    const rejected = deliveries.data.filter(d => d.status === DeliveryStatus.REJEITADO).length;
    const released = deliveries.data.filter(d => d.status === DeliveryStatus.FINALIZADO).length;
    const totalValue = deliveries.data.reduce((sum, d) => sum + (d.totalValor || 0), 0);
    const avgOrdersPerDelivery = total > 0 
      ? deliveries.data.reduce((sum, d) => sum + (d.orders?.length || 0), 0) / total 
      : 0;

    return { 
      total, 
      toRelease, 
      pending, 
      rejected, 
      released, 
      totalValue, 
      avgOrdersPerDelivery 
    };
  }, [deliveries.data]);

  // ========================================
  // HANDLERS DE AÇÕES
  // ========================================

  const handleReleaseClick = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setReleaseDialogOpen(true);
  };

  const handleRejectClick = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setRejectDialogOpen(true);
  };

  const handleDetailsClick = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setDetailsDialogOpen(true);
  };

  const handleCloseDialogs = () => {
    setReleaseDialogOpen(false);
    setRejectDialogOpen(false);
    setDetailsDialogOpen(false);
    setSelectedDelivery(null);
    setRejectReason('');
  };

  const handleConfirmRelease = useCallback(async () => {
    if (!selectedDelivery) return;

    try {
      setLoading(true);
      // Simular API call - substituir pela chamada real
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await deliveries.update(selectedDelivery.id, { 
        status: DeliveryStatus.INICIADO,
        dataLiberacao: new Date().toISOString()
      });
      
      showMessage('Roteiro liberado com sucesso!', 'success');
      handleCloseDialogs();
    } catch (error) {
      showMessage('Erro ao liberar roteiro', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedDelivery, deliveries, showMessage, setLoading]);

  const handleConfirmReject = useCallback(async () => {
    if (!selectedDelivery || !rejectReason.trim()) return;

    try {
      setLoading(true);
      // Simular API call - substituir pela chamada real
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await deliveries.update(selectedDelivery.id, { 
        status: DeliveryStatus.REJEITADO,
        motivo: rejectReason
      });
      
      showMessage('Roteiro rejeitado com sucesso!', 'success');
      handleCloseDialogs();
    } catch (error) {
      showMessage('Erro ao rejeitar roteiro', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedDelivery, rejectReason, deliveries, showMessage, setLoading]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('pt-BR');
  };

  // ========================================
  // RENDER
  // ========================================

  return (
    <DS.Container variant="page">
      {/* Header */}
      <DS.Box spacing="md">
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
          Liberação de Roteiros
        </Typography>
        
        <Typography variant="body1" color="text.secondary">
          Gerencie a liberação e aprovação dos roteiros de entrega
        </Typography>
      </DS.Box>

      {/* Cards de Estatísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <DS.StatsCard color="info">
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {stats.total}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Total de Roteiros
                  </Typography>
                </Box>
                <Assessment sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </DS.StatsCard>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <DS.StatsCard color="warning">
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {stats.toRelease}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    A Liberar
                  </Typography>
                </Box>
                <Badge badgeContent={stats.toRelease > 0 ? '!' : 0} color="error">
                  <PendingActions sx={{ fontSize: 40, opacity: 0.8 }} />
                </Badge>
              </Box>
            </CardContent>
          </DS.StatsCard>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <DS.StatsCard color="info">
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {stats.pending}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Em Andamento
                  </Typography>
                </Box>
                <LocalShipping sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </DS.StatsCard>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <DS.StatsCard color="success">
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {stats.released}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Finalizados
                  </Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </DS.StatsCard>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <DS.StatsCard color="error">
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {stats.rejected}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Rejeitados
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    {formatCurrency(stats.totalValue)}
                  </Typography>
                </Box>
                <Block sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </DS.StatsCard>
        </Grid>
      </Grid>

      {/* Alert para roteiros pendentes */}
      {stats.toRelease > 0 && (
        <Alert 
          severity="warning" 
          sx={{ mb: 3, borderRadius: 2 }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={() => filterActions.setCustomFilter('toRelease', true)}
            >
              VER ROTEIROS
            </Button>
          }
        >
          <Typography variant="h6" fontWeight={600}>
            ⚠️ {stats.toRelease} roteiros aguardando liberação
          </Typography>
          <Typography>
            Existem roteiros que precisam de aprovação para iniciar as entregas.
          </Typography>
        </Alert>
      )}

      {/* Painel de Filtros */}
      <DS.FilterPanel>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <DS.SearchField
              fullWidth
              placeholder="Buscar por motorista, veículo, pedidos..."
              value={filters.searchTerm}
              onChange={(e) => filterActions.setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
                endAdornment: filters.searchTerm && (
                  <InputAdornment position="end">
                    <DS.IconButton
                      size="small"
                      onClick={() => filterActions.setSearchTerm('')}
                    >
                      <Close />
                    </DS.IconButton>
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
              {filterActions.hasActiveFilters && (
                <Chip
                  size="small"
                  label="Ativo"
                  color="primary"
                  sx={{ ml: 1 }}
                />
              )}
            </Button>
          </Grid>

          <Grid item xs={12} md={3}>
            <DS.ActionButton
              fullWidth
              dsVariant="refresh"
              startIcon={<Refresh />}
              onClick={deliveries.refresh}
              disabled={deliveries.loading}
            >
              Atualizar
            </DS.ActionButton>
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
                value={filters.dateStart}
                onChange={(e) => filterActions.setDateRange(e.target.value, filters.dateEnd)}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Data Fim"
                type="datetime-local"
                value={filters.dateEnd}
                onChange={(e) => filterActions.setDateRange(filters.dateStart, e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <FormControlLabel
                  control={
                    <Switch
                      checked={!!filters.customFilters.toRelease}
                      onChange={(e) =>
                        filterActions.setCustomFilter('toRelease', e.target.checked || undefined)
                      }
                    />
                  }
                  label="A Liberar"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={!!filters.customFilters.pending}
                      onChange={(e) =>
                        filterActions.setCustomFilter('pending', e.target.checked || undefined)
                      }
                    />
                  }
                  label="Em Andamento"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={!!filters.customFilters.rejected}
                      onChange={(e) =>
                        filterActions.setCustomFilter('rejected', e.target.checked || undefined)
                      }
                    />
                  }
                  label="Rejeitados"
                />
              </Stack>
            </Grid>
          </Grid>
        </Collapse>
      </DS.FilterPanel>

      {/* Lista de Roteiros */}
      {filteredData.length > 0 ? (
        <Grid container spacing={2}>
          {filteredData.map((delivery) => (
            <Grid item xs={12} key={delivery.id}>
              <DS.ItemCard dsVariant="hover">
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6} md={2}>
                      <Box display="flex" alignItems="center" gap={2}>
                        <DS.Avatar dsVariant="gradient">
                          <LocalShipping />
                        </DS.Avatar>
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
                      <Box>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <Person fontSize="small" color="action" />
                          <Typography variant="body2" fontWeight={600} noWrap>
                            {delivery.Driver?.name || 'Sem motorista'}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                          <DirectionsCar fontSize="small" color="action" />
                          <Typography variant="caption" color="text.secondary" noWrap>
                            {delivery.Vehicle?.model} - {delivery.Vehicle?.plate}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={6} md={2}>
                      <DS.StatusChip status={delivery.status} />
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

                    <Grid item xs={12} sm={6} md={2}>
                      <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                        <Tooltip title="Ver Detalhes">
                          <DS.IconButton
                            variant="default"
                            size="small"
                            onClick={() => handleDetailsClick(delivery)}
                          >
                            <Visibility />
                          </DS.IconButton>
                        </Tooltip>
                        
                        {delivery.status === DeliveryStatus.A_LIBERAR && (
                          <>
                            <Tooltip title="Liberar">
                              <DS.IconButton
                                variant="success"
                                size="small"
                                onClick={() => handleReleaseClick(delivery)}
                              >
                                <CheckCircle />
                              </DS.IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Rejeitar">
                              <DS.IconButton
                                variant="error"
                                size="small"
                                onClick={() => handleRejectClick(delivery)}
                              >
                                <Cancel />
                              </DS.IconButton>
                            </Tooltip>
                          </>
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </DS.ItemCard>
            </Grid>
          ))}
        </Grid>
      ) : !deliveries.loading ? (
        <DS.ItemCard>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <PendingActions sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Nenhum roteiro encontrado
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ajuste os filtros para encontrar os roteiros desejados
            </Typography>
          </CardContent>
        </DS.ItemCard>
      ) : null}

      {/* Diálogos */}
      <ReleaseDialog
        open={releaseDialogOpen}
        delivery={selectedDelivery}
        onClose={handleCloseDialogs}
        onConfirm={handleConfirmRelease}
      />

      <RejectDialog
        open={rejectDialogOpen}
        delivery={selectedDelivery}
        reason={rejectReason}
        onReasonChange={setRejectReason}
        onClose={handleCloseDialogs}
        onConfirm={handleConfirmReject}
      />

      <DeliveryDetailsDialog
        open={detailsDialogOpen}
        delivery={selectedDelivery}
        onClose={handleCloseDialogs}
      />
    </DS.Container>
  );
};

export default withAuth(ReleasePage, { requiredRole: 'admin' });