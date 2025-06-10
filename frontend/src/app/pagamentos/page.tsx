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
  Alert,
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
  Badge,
  Checkbox,
  Paper,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
} from '@mui/material';
import {
  MonetizationOn,
  AccountBalance,
  CheckCircle,
  PendingActions,
  Group,
  Visibility,
  Payment as PaymentIcon,
  Receipt,
  TrendingUp,
  Refresh,
  FilterList,
  Search,
  Close,
  GetApp,
  GroupWork,
  AccountBalanceWallet,
} from '@mui/icons-material';

import { 
  type Payment, 
  type Delivery,
  type PaymentFilters,
  PaymentStatus,
  PAYMENT_STATUS_ARRAYS,
  StatusHelper,
} from '../../types';
import DS from '../components/ds';
import { useCrud, useFilters } from '../hooks';
import withAuth from '../hoc/withAuth';
import { useMessage } from '../context/MessageContext';
import { useLoading } from '../context/LoadingContext';

// ========================================
// INTERFACES E TIPOS
// ========================================

interface PaymentStats {
  total: number;
  pending: number;
  paid: number;
  grouped: number;
  totalValue: number;
  pendingValue: number;
  paidValue: number;
  avgPaymentValue: number;
}

interface PaymentDetailsDialogProps {
  open: boolean;
  payment: Payment | null;
  onClose: () => void;
}

interface GroupPaymentsDialogProps {
  open: boolean;
  selectedPayments: Payment[];
  onClose: () => void;
  onConfirm: () => void;
}

// ========================================
// COMPONENTES AUXILIARES
// ========================================

const PaymentDetailsDialog: React.FC<PaymentDetailsDialogProps> = ({ 
  open, 
  payment, 
  onClose 
}) => (
  <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
    <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Receipt color="primary" />
        Detalhes do Pagamento
      </Box>
      <DS.IconButton onClick={onClose}>
        <Close />
      </DS.IconButton>
    </DialogTitle>
    <DialogContent>
      {payment && (
        <Box sx={{ pt: 1 }}>
          {/* Informações Gerais */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Informações Gerais</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Status</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <DS.StatusChip status={payment.status} />
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Tipo</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      label={payment.isGroup ? 'Agrupado' : 'Individual'}
                      color={payment.isGroup ? 'secondary' : 'default'}
                      size="small"
                    />
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Data de Criação</Typography>
                  <Typography variant="body2">
                    {new Date(payment.createdAt).toLocaleString('pt-BR')}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Valor</Typography>
                  <Typography variant="h6" color="success.main">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(payment.amount || payment.value || 0)}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Motorista */}
          {payment.Driver && (
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Motorista</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <DS.Avatar dsVariant="gradient">
                    {payment.Driver.name.charAt(0)}
                  </DS.Avatar>
                  <Box>
                    <Typography variant="body1" fontWeight={600}>
                      {payment.Driver.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      CPF: {payment.Driver.cpf}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Entregas Relacionadas */}
          {payment.paymentDeliveries && payment.paymentDeliveries.length > 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Entregas Relacionadas ({payment.paymentDeliveries.length})
                </Typography>
                <List dense>
                  {payment.paymentDeliveries.map((pd, index) => {
                    const delivery = pd.delivery;
                    if (!delivery) return null;
                    
                    return (
                      <React.Fragment key={delivery.id}>
                        <ListItem>
                          <ListItemText
                            primary={`Entrega ${delivery.id.substring(0, 8)}...`}
                            secondary={
                              <Box>
                                <Typography variant="caption" component="span">
                                  Motorista: {delivery.Driver?.name || 'N/A'}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                                  <Chip 
                                    size="small" 
                                    label={delivery.status} 
                                    variant="outlined"
                                  />
                                  <Chip 
                                    size="small" 
                                    label={new Intl.NumberFormat('pt-BR', {
                                      style: 'currency',
                                      currency: 'BRL',
                                    }).format(delivery.totalValor || 0)}
                                    color="success"
                                    variant="outlined"
                                  />
                                </Box>
                              </Box>
                            }
                          />
                        </ListItem>
                        {index < payment.paymentDeliveries!.length - 1 && <Divider />}
                      </React.Fragment>
                    );
                  })}
                </List>
              </CardContent>
            </Card>
          )}

          {/* Descrição */}
          {payment.description && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Descrição</Typography>
                <Typography variant="body2">
                  {payment.description}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Box>
      )}
    </DialogContent>
  </Dialog>
);

const GroupPaymentsDialog: React.FC<GroupPaymentsDialogProps> = ({ 
  open, 
  selectedPayments, 
  onClose, 
  onConfirm 
}) => {
  const totalValue = selectedPayments.reduce((sum, p) => sum + (p.amount || p.value || 0), 0);
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <GroupWork color="primary" />
        Agrupar Pagamentos
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Confirma o agrupamento de <strong>{selectedPayments.length} pagamentos</strong>?
        </Typography>
        
        <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1, mb: 2 }}>
          <Typography variant="h6" color="success.main" textAlign="center">
            Valor Total: {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(totalValue)}
          </Typography>
        </Box>

        <Alert severity="info" sx={{ mb: 2 }}>
          Os pagamentos serão agrupados em um único registro para facilitar o processamento.
        </Alert>

        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Motorista</TableCell>
                <TableCell align="right">Valor</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    {payment.Driver?.name || 'N/A'}
                  </TableCell>
                  <TableCell align="right">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(payment.amount || payment.value || 0)}
                  </TableCell>
                  <TableCell>
                    <Chip size="small" label={payment.status} variant="outlined" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <DS.ActionButton dsVariant="primary" onClick={onConfirm}>
          Confirmar Agrupamento
        </DS.ActionButton>
      </DialogActions>
    </Dialog>
  );
};

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

const PaymentsPage: React.FC = () => {
  const { showMessage } = useMessage();
  const { setLoading } = useLoading();

  // Estados dos diálogos
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);

  // Hook CRUD para payments
  const payments = useCrud<Payment>('/payments', { globalLoading: true });

  // Configuração dos filtros
  const filterFunctions = {
    search: (payment: Payment, term: string) => {
      const searchTerm = term.toLowerCase();
      return (
        payment.Driver?.name?.toLowerCase().includes(searchTerm) ||
        payment.description?.toLowerCase().includes(searchTerm) ||
        payment.id.toLowerCase().includes(searchTerm) ||
        payment.status.toLowerCase().includes(searchTerm)
      );
    },
    status: (payment: Payment, status: string) => {
      if (!status) return true;
      return payment.status === status;
    },
    dateRange: (payment: Payment, start: string, end: string) => {
      if (!start || !end) return true;
      const paymentDate = new Date(payment.createdAt);
      return paymentDate >= new Date(start) && paymentDate <= new Date(end);
    },
    custom: {
      pending: (payment: Payment) => payment.status === PaymentStatus.PENDENTE,
      paid: (payment: Payment) => PAYMENT_STATUS_ARRAYS.PAID.includes(payment.status as PaymentStatus),
      grouped: (payment: Payment) => payment.isGroup === true,
      dueToday: (payment: Payment) => StatusHelper.isPaymentDueToday({
        status: payment.status,
        createdAt: payment.createdAt
      }),
    }
  };

  // Hook de filtros
  const { filteredData, filters, actions: filterActions } = useFilters(
    payments.data, 
    filterFunctions
  );

  // Estatísticas calculadas
  const stats: PaymentStats = useMemo(() => {
    const total = payments.data.length;
    const pending = payments.data.filter(p => p.status === PaymentStatus.PENDENTE).length;
    const paid = payments.data.filter(p => PAYMENT_STATUS_ARRAYS.PAID.includes(p.status as PaymentStatus)).length;
    const grouped = payments.data.filter(p => p.isGroup === true).length;
    const totalValue = payments.data.reduce((sum, p) => sum + (p.amount || p.value || 0), 0);
    const pendingValue = payments.data
      .filter(p => p.status === PaymentStatus.PENDENTE)
      .reduce((sum, p) => sum + (p.amount || p.value || 0), 0);
    const paidValue = payments.data
      .filter(p => PAYMENT_STATUS_ARRAYS.PAID.includes(p.status as PaymentStatus))
      .reduce((sum, p) => sum + (p.amount || p.value || 0), 0);
    const avgPaymentValue = total > 0 ? totalValue / total : 0;

    return { 
      total, 
      pending, 
      paid, 
      grouped, 
      totalValue, 
      pendingValue, 
      paidValue, 
      avgPaymentValue 
    };
  }, [payments.data]);

  // ========================================
  // HANDLERS DE AÇÕES
  // ========================================

  const handleDetailsClick = (payment: Payment) => {
    setSelectedPayment(payment);
    setDetailsDialogOpen(true);
  };

  const handleSelectPayment = (paymentId: string) => {
    setSelectedPayments(prev =>
      prev.includes(paymentId)
        ? prev.filter(id => id !== paymentId)
        : [...prev, paymentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedPayments.length === filteredData.length) {
      setSelectedPayments([]);
    } else {
      setSelectedPayments(filteredData.map(p => p.id));
    }
  };

  const handleCloseDialogs = () => {
    setDetailsDialogOpen(false);
    setGroupDialogOpen(false);
    setSelectedPayment(null);
  };

  const handleGroupPayments = () => {
    if (selectedPayments.length < 2) {
      showMessage('Selecione pelo menos 2 pagamentos para agrupar', 'warning');
      return;
    }
    setGroupDialogOpen(true);
  };

  const handleConfirmGroup = useCallback(async () => {
    try {
      setLoading(true);
      // Simular API call - substituir pela chamada real
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Criar um novo pagamento agrupado
      const selectedPaymentData = payments.data.filter(p => selectedPayments.includes(p.id));
      const totalValue = selectedPaymentData.reduce((sum, p) => sum + (p.amount || p.value || 0), 0);
      
      const groupedPayment = {
        amount: totalValue,
        status: PaymentStatus.PENDENTE,
        isGroup: true,
        description: `Pagamento agrupado de ${selectedPaymentData.length} entregas`,
        deliveryIds: selectedPaymentData.flatMap(p => p.deliveryIds || []),
        motoristaId: selectedPaymentData[0].motoristaId,
      };
      
      await payments.create(groupedPayment);
      
      // Remover pagamentos individuais
      await Promise.all(selectedPayments.map(id => payments.delete(id)));
      
      showMessage('Pagamentos agrupados com sucesso!', 'success');
      setSelectedPayments([]);
      handleCloseDialogs();
    } catch (error) {
      showMessage('Erro ao agrupar pagamentos', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedPayments, payments, showMessage, setLoading]);

  const handleUpdatePaymentStatus = useCallback(async (paymentId: string, newStatus: PaymentStatus) => {
    try {
      await payments.update(paymentId, { status: newStatus });
      showMessage(`Pagamento ${newStatus.toLowerCase()} com sucesso!`, 'success');
    } catch (error) {
      showMessage('Erro ao atualizar status do pagamento', 'error');
    }
  }, [payments, showMessage]);

  const handleExport = () => {
    const dataToExport = filteredData.map(payment => ({
      'ID': payment.id,
      'Motorista': payment.Driver?.name || 'N/A',
      'Valor': payment.amount || payment.value || 0,
      'Status': payment.status,
      'Tipo': payment.isGroup ? 'Agrupado' : 'Individual',
      'Data': new Date(payment.createdAt).toLocaleDateString('pt-BR'),
      'Descrição': payment.description || 'N/A',
    }));
    
    const headers = Object.keys(dataToExport[0] || {}).join(',');
    const rows = dataToExport.map(item => 
      Object.values(item).map(val => `"${val}"`).join(',')
    ).join('\n');
    
    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `pagamentos_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    URL.revokeObjectURL(url);
  };

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
      {/* Cards de Estatísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <DS.StatsCard color="info">
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {stats.total}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Total de Pagamentos
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    {formatCurrency(stats.totalValue)}
                  </Typography>
                </Box>
                <AccountBalance sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </DS.StatsCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <DS.StatsCard color="warning">
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {stats.pending}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Pendentes
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    {formatCurrency(stats.pendingValue)}
                  </Typography>
                </Box>
                <Badge badgeContent={stats.pending > 0 ? '!' : 0} color="error">
                  <PendingActions sx={{ fontSize: 40, opacity: 0.8 }} />
                </Badge>
              </Box>
            </CardContent>
          </DS.StatsCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <DS.StatsCard color="success">
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {stats.paid}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Baixados
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    {formatCurrency(stats.paidValue)}
                  </Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </DS.StatsCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <DS.StatsCard color="secondary">
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {stats.grouped}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Agrupados
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    Média: {formatCurrency(stats.avgPaymentValue)}
                  </Typography>
                </Box>
                <Group sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </DS.StatsCard>
        </Grid>
      </Grid>

      {/* Alert para pagamentos pendentes */}
      {stats.pending > 0 && (
        <Alert 
          severity="warning" 
          sx={{ mb: 3, borderRadius: 2 }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={() => filterActions.setCustomFilter('pending', true)}
            >
              VER PENDENTES
            </Button>
          }
        >
          <Typography variant="h6" fontWeight={600}>
            💰 {stats.pending} pagamentos pendentes
          </Typography>
          <Typography>
            Total de {formatCurrency(stats.pendingValue)} aguardando processamento.
          </Typography>
        </Alert>
      )}

      {/* Painel de Filtros */}
      <DS.FilterPanel>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <DS.SearchField
              fullWidth
              placeholder="Buscar por motorista, descrição..."
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

          <Grid item xs={12} md={2}>
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
            <Box display="flex" gap={1}>
              <DS.ActionButton
                variant="outlined"
                startIcon={<Refresh />}
                onClick={payments.refresh}
                disabled={payments.loading}
              >
                Atualizar
              </DS.ActionButton>
              
              <DS.ActionButton
                variant="outlined"
                startIcon={<GetApp />}
                onClick={handleExport}
                disabled={filteredData.length === 0}
              >
                Exportar
              </DS.ActionButton>
            </Box>
          </Grid>

          <Grid item xs={12} md={3}>
            {selectedPayments.length > 0 && (
              <DS.ActionButton
                fullWidth
                dsVariant="primary"
                startIcon={<Group />}
                onClick={handleGroupPayments}
                disabled={selectedPayments.length < 2}
              >
                Agrupar ({selectedPayments.length})
              </DS.ActionButton>
            )}
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => filterActions.setDateRange(e.target.value, filters.dateEnd)}
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => filterActions.setDateRange(filters.dateStart, e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                  />
                </Grid>
            <Grid item xs={12} md={4}>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <FormControlLabel
                  control={
                    <Switch
                      checked={!!filters.customFilters.pending}
                      onChange={(e) =>
                        filterActions.setCustomFilter('pending', e.target.checked || undefined)
                      }
                    />
                  }
                  label="Pendentes"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={!!filters.customFilters.paid}
                      onChange={(e) =>
                        filterActions.setCustomFilter('paid', e.target.checked || undefined)
                      }
                    />
                  }
                  label="Baixados"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={!!filters.customFilters.grouped}
                      onChange={(e) =>
                        filterActions.setCustomFilter('grouped', e.target.checked || undefined)
                      }
                    />
                  }
                  label="Agrupados"
                />
              </Stack>
            </Grid>
          </Grid>
        </Collapse>
      </DS.FilterPanel>

      {/* Barra de Seleção */}
      {filteredData.length > 0 && (
        <Paper sx={{ p: 2, mb: 3, backgroundColor: 'action.hover' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedPayments.length === filteredData.length}
                  indeterminate={selectedPayments.length > 0 && selectedPayments.length < filteredData.length}
                  onChange={handleSelectAll}
                />
              }
              label={`${selectedPayments.length} de ${filteredData.length} selecionados`}
            />
            
            {selectedPayments.length > 0 && (
              <Box display="flex" gap={1}>
                <Typography variant="body2" color="text.secondary">
                  Total selecionado: {formatCurrency(
                    payments.data
                      .filter(p => selectedPayments.includes(p.id))
                      .reduce((sum, p) => sum + (p.amount || p.value || 0), 0)
                  )}
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>
      )}

      {/* Lista de Pagamentos */}
      {filteredData.length > 0 ? (
        <Grid container spacing={2}>
          {filteredData.map((payment) => (
            <Grid item xs={12} key={payment.id}>
              <DS.ItemCard 
                dsVariant="interactive"
                selected={selectedPayments.includes(payment.id)}
                onClick={() => handleSelectPayment(payment.id)}
              >
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6} md={3}>
                      <Box display="flex" alignItems="center" gap={2}>
                        <DS.Avatar dsVariant="gradient">
                          {payment.isGroup ? <Group /> : <PaymentIcon />}
                        </DS.Avatar>
                        <Box>
                          <Typography variant="h6" fontWeight={600} color="success.main">
                            {formatCurrency(payment.amount || payment.value || 0)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(payment.createdAt)}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={6} md={2}>
                      <DS.StatusChip status={payment.status} />
                      {payment.isGroup && (
                        <Chip
                          label="Agrupado"
                          size="small"
                          color="secondary"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {payment.Driver?.name || 'Motorista não definido'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {payment.description || 'Sem descrição'}
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={6} md={2}>
                      <Box textAlign="center">
                        <Typography variant="body2" color="text.secondary">
                          {payment.deliveryIds?.length || payment.paymentDeliveries?.length || 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Entregas
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={6} md={2}>
                      <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                        <Tooltip title="Ver Detalhes">
                          <DS.IconButton
                            variant="default"
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDetailsClick(payment);
                            }}
                          >
                            <Visibility />
                          </DS.IconButton>
                        </Tooltip>
                        
                        {payment.status === PaymentStatus.PENDENTE && (
                          <Tooltip title="Baixar Pagamento">
                            <DS.IconButton
                              variant="success"
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdatePaymentStatus(payment.id, PaymentStatus.BAIXADO);
                              }}
                            >
                              <CheckCircle />
                            </DS.IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </DS.ItemCard>
            </Grid>
          ))}
        </Grid>
      ) : !payments.loading ? (
        <DS.ItemCard>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <MonetizationOn sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Nenhum pagamento encontrado
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ajuste os filtros para encontrar os pagamentos desejados
            </Typography>
          </CardContent>
        </DS.ItemCard>
      ) : null}

      {/* Diálogos */}
      <PaymentDetailsDialog
        open={detailsDialogOpen}
        payment={selectedPayment}
        onClose={handleCloseDialogs}
      />

      <GroupPaymentsDialog
        open={groupDialogOpen}
        selectedPayments={payments.data.filter(p => selectedPayments.includes(p.id))}
        onClose={handleCloseDialogs}
        onConfirm={handleConfirmGroup}
      />
    </DS.Container>
  );
};

export default withAuth(PaymentsPage);