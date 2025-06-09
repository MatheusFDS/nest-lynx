'use client'

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Typography, Container, Grid, Card, CardContent, Box, CircularProgress,
  IconButton, Tooltip, Chip, Avatar, List, ListItem, ListItemText,
  ListItemIcon, Divider, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, Badge
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  LocalShipping, Assignment, AttachMoney,
  Error as ErrorIcon, Schedule,
  Phone, Refresh, Visibility,
  AccountBalance
} from '@mui/icons-material';

// Importando seus tipos e serviços reais
import { Order, Delivery, Driver, Vehicle, Payment, AlertCardProps } from '../../types';
import { getStoredToken } from '../../services/authService';
import { fetchOrders } from '../../services/orderService';
import { fetchDeliveries } from '../../services/deliveryService';
import { fetchDrivers } from '../../services/driverService';
import { fetchVehicles } from '../../services/vehicleService';
import { fetchPayments } from '../../services/paymentService';

// Importando seus contextos
import withAuth from '../hoc/withAuth';
import { useLoading } from '../context/LoadingContext';
import { useMessage } from '../context/MessageContext';

// Styled Components (seguindo seu padrão)
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

const AlertCard = ({ icon, title, count, subtitle, color = 'warning', urgent = false, onClick }: AlertCardProps & { icon: React.ReactElement }) => (
  <ModernCard 
    sx={{ 
      height: '100%', 
      cursor: onClick ? 'pointer' : 'default',
      border: urgent ? `2px solid ${color === 'error' ? '#ef4444' : '#fbbf24'}` : undefined,
      animation: urgent ? 'pulse 2s infinite' : undefined,
      '@keyframes pulse': {
        '0%, 100%': { opacity: 1 },
        '50%': { opacity: 0.8 }
      }
    }}
    onClick={onClick}
  >
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 56,
            height: 56,
            borderRadius: '16px',
            background: `linear-gradient(135deg, ${
              color === 'error' ? '#f87171, #dc2626' : 
              color === 'warning' ? '#fbbf24, #d97706' :
              color === 'success' ? '#4ade80, #16a34a' :
              color === 'info' ? '#60a5fa, #2563eb' : '#8b5cf6, #7c3aed'
            })`,
            boxShadow: `0 4px 12px ${
              color === 'error' ? 'rgba(248, 113, 113, 0.3)' : 
              color === 'warning' ? 'rgba(251, 191, 36, 0.3)' :
              color === 'success' ? 'rgba(74, 222, 128, 0.3)' :
              color === 'info' ? 'rgba(96, 165, 250, 0.3)' : 'rgba(139, 92, 246, 0.3)'
            }`,
          }}
        >
          {React.cloneElement(icon, { sx: { color: 'white', fontSize: 28 } })}
        </Box>
        
        {urgent && (
          <Badge
            badgeContent="!"
            color="error"
            sx={{
              '& .MuiBadge-badge': {
                fontSize: '1rem',
                fontWeight: 'bold',
                minWidth: '24px',
                height: '24px'
              }
            }}
          />
        )}
      </Box>
      
      <Typography variant="h3" fontWeight="bold" sx={{ mb: 1, color: `${color}.main` }}>
        {count}
      </Typography>
      
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 0.5 }}>
        {title}
      </Typography>
      
      <Typography variant="body2" color="text.secondary">
        {subtitle}
      </Typography>
    </CardContent>
  </ModernCard>
);

// Componente principal do Dashboard Operacional
const OperationalDashboard = () => {
  const [token, setToken] = useState<string | null>(null);
  const [selectedView, setSelectedView] = useState<'pending' | 'inRoute' | 'problems' | 'payments'>('pending');

  // Estados para dados reais
  const [operationalData, setOperationalData] = useState<{
    orders: Order[];
    deliveries: Delivery[];
    drivers: Driver[];
    vehicles: Vehicle[];
    payments: Payment[];
  }>({
    orders: [],
    deliveries: [],
    drivers: [],
    vehicles: [],
    payments: []
  });

  // Usando seus contextos
  const { isLoading, setLoading } = useLoading();
  const { showMessage } = useMessage();

  // Handler de erro usando seu padrão
  const handleApiError = useCallback((error: unknown, defaultMessage: string) => {
    console.error(defaultMessage, error);
    const errorMessage = error instanceof Error ? error.message : defaultMessage;
    showMessage(errorMessage, 'error');
  }, [showMessage]);

  // Inicialização do token
  useEffect(() => {
    const t = getStoredToken();
    if (t) {
      setToken(t);
    } else {
      showMessage('Token não encontrado. Faça login novamente.', 'error');
    }
  }, [showMessage]);

  // Função para carregar dados operacionais
  const loadOperationalData = useCallback(async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const [orders, deliveries, drivers, vehicles, payments] = await Promise.all([
        fetchOrders(token),
        fetchDeliveries(token),
        fetchDrivers(token),
        fetchVehicles(token),
        fetchPayments(token)
      ]);

      setOperationalData({
        orders: orders || [],
        deliveries: deliveries || [],
        drivers: drivers || [],
        vehicles: vehicles || [],
        payments: payments || []
      });

    } catch (error) {
      handleApiError(error, 'Falha ao carregar dados operacionais.');
    } finally {
      setLoading(false);
    }
  }, [token, setLoading, handleApiError]);

  // Carregar dados na inicialização
  useEffect(() => {
    if (token) {
      loadOperationalData();
    }
  }, [token, loadOperationalData]);

  // Função para verificar se uma entrega está atrasada
  const isDeliveryDelayed = useCallback((delivery: Delivery) => {
    if (!delivery.dataInicio) return false;
    const startDate = new Date(delivery.dataInicio);
    const now = new Date();
    const hoursDiff = (now.getTime() - startDate.getTime()) / (1000 * 60 * 60);
    return hoursDiff > 8; // Considera atrasada após 8 horas
  }, []);

  // Função para verificar se passaram X dias
  const isDaysPassed = useCallback((date: string | Date, days: number) => {
    const targetDate = new Date(date);
    const now = new Date();
    const daysDiff = (now.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff > days;
  }, []);

  // Dados operacionais calculados
  const operationalMetrics = useMemo(() => {
    const { orders, deliveries, payments, drivers } = operationalData;

    // Pedidos pendentes (críticos para operação)
    const pedidosPendentes = orders.filter(o => o.status === 'Pendente');
    
    // Entregas em rota (ativas no momento)
    const entregasEmRota = deliveries.filter(d => d.status === 'Em Rota');
    
    // Entregas com problemas (atrasadas, rejeitadas, etc.)
    const entregasComProblemas = deliveries.filter(d => 
      d.status === 'Rejeitada' || 
      (d.status === 'Em Rota' && isDeliveryDelayed(d)) ||
      d.status === 'Pendente Liberação' && d.createdAt && isDaysPassed(d.createdAt, 2)
    );
    
    // Pagamentos pendentes
    const pagamentosPendentes = payments.filter(p => p.status === 'Pendente');
    const valorPagamentosPendentes = pagamentosPendentes.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    
    // Total a pagar para motoristas este mês
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const pagamentosMes = payments.filter(p => {
      const paymentDate = new Date(p.createdAt);
      return paymentDate.getMonth() === currentMonth && 
             paymentDate.getFullYear() === currentYear;
    });
    const totalPagarMes = pagamentosMes.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    return {
      pedidosPendentes,
      entregasEmRota,
      entregasComProblemas,
      pagamentosPendentes,
      valorPagamentosPendentes,
      totalPagarMes,
      // Urgências
      pedidosUrgentes: pedidosPendentes.filter(p => p.prioridade === 'Alta' || isDaysPassed(p.data, 3)),
      entregasAtrasadas: entregasEmRota.filter(d => isDeliveryDelayed(d))
    };
  }, [operationalData, isDeliveryDelayed, isDaysPassed]);

  const refreshData = () => {
    loadOperationalData();
  };

  // Renderizar lista detalhada baseada na view selecionada
  const renderDetailedView = () => {
    switch (selectedView) {
      case 'pending':
        return (
          <ModernCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">
                  Pedidos Pendentes ({operationalMetrics.pedidosPendentes.length})
                </Typography>
                <Chip 
                  label={`${operationalMetrics.pedidosUrgentes.length} Urgentes`}
                  color="error"
                  size="small"
                  sx={{ borderRadius: '12px' }}
                />
              </Box>
              
              <TableContainer component={Paper} sx={{ maxHeight: 400, borderRadius: '12px' }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Número</TableCell>
                      <TableCell>Cliente</TableCell>
                      <TableCell>Cidade</TableCell>
                      <TableCell>Data</TableCell>
                      <TableCell align="right">Valor</TableCell>
                      <TableCell align="center">Prioridade</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {operationalMetrics.pedidosPendentes.slice(0, 10).map((order) => (
                      <TableRow 
                        key={order.id}
                        sx={{ 
                          '&:hover': { bgcolor: 'action.hover' },
                          bgcolor: operationalMetrics.pedidosUrgentes.includes(order) ? 'error.light' : 'inherit'
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {order.numero}
                          </Typography>
                        </TableCell>
                        <TableCell>{order.cliente}</TableCell>
                        <TableCell>{order.cidade}</TableCell>
                        <TableCell>
                          <Typography variant="body2" color={isDaysPassed(order.data, 3) ? 'error.main' : 'text.primary'}>
                            {new Date(order.data).toLocaleDateString('pt-BR')}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="medium" color="success.main">
                            R$ {Number(order.valor || 0).toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          {order.prioridade === 'Alta' && (
                            <Chip label="Alta" color="error" size="small" />
                          )}
                          {isDaysPassed(order.data, 3) && (
                            <Chip label="Atrasado" color="warning" size="small" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </ModernCard>
        );

      case 'inRoute':
        return (
          <ModernCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">
                  Entregas em Rota ({operationalMetrics.entregasEmRota.length})
                </Typography>
                <Chip 
                  label={`${operationalMetrics.entregasAtrasadas.length} Atrasadas`}
                  color="warning"
                  size="small"
                  sx={{ borderRadius: '12px' }}
                />
              </Box>
              
              <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                {operationalMetrics.entregasEmRota.map((delivery) => {
                  const driver = operationalData.drivers.find(d => d.id === delivery.motoristaId);
                  const isDelayed = isDeliveryDelayed(delivery);
                  
                  return (
                    <ListItem 
                      key={delivery.id}
                      sx={{ 
                        mb: 1, 
                        bgcolor: isDelayed ? 'warning.light' : 'background.paper',
                        borderRadius: '12px',
                        border: '1px solid',
                        borderColor: isDelayed ? 'warning.main' : 'divider'
                      }}
                    >
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: isDelayed ? 'warning.main' : 'primary.main' }}>
                          <LocalShipping />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={`${driver?.name || 'Motorista N/A'} - ${delivery.orders.length} pedidos`}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Iniciado: {new Date(delivery.dataInicio).toLocaleString('pt-BR')}
                            </Typography>
                            <Typography variant="body2" color="success.main">
                              Valor: R$ {Number(delivery.totalValor || 0).toFixed(2)}
                            </Typography>
                          </Box>
                        }
                      />
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {isDelayed && (
                          <Chip label="Atrasada" color="warning" size="small" />
                        )}
                        <IconButton size="small" color="primary">
                          <Visibility />
                        </IconButton>
                      </Box>
                    </ListItem>
                  );
                })}
              </List>
            </CardContent>
          </ModernCard>
        );

      case 'problems':
        return (
          <ModernCard>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                Entregas com Problemas ({operationalMetrics.entregasComProblemas.length})
              </Typography>
              
              <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                {operationalMetrics.entregasComProblemas.map((delivery) => {
                  const driver = operationalData.drivers.find(d => d.id === delivery.motoristaId);
                  
                  return (
                    <ListItem 
                      key={delivery.id}
                      sx={{ 
                        mb: 1, 
                        bgcolor: 'error.light',
                        borderRadius: '12px',
                        border: '1px solid',
                        borderColor: 'error.main'
                      }}
                    >
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: 'error.main' }}>
                          <ErrorIcon />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={`${driver?.name || 'Motorista N/A'} - Status: ${delivery.status}`}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {delivery.orders.length} pedidos - R$ {Number(delivery.totalValor || 0).toFixed(2)}
                            </Typography>
                            {delivery.motivo && (
                              <Typography variant="body2" color="error.main">
                                Motivo: {delivery.motivo}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                      <IconButton size="small" color="primary">
                        <Phone />
                      </IconButton>
                    </ListItem>
                  );
                })}
              </List>
            </CardContent>
          </ModernCard>
        );

      case 'payments':
        return (
          <ModernCard>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                Pagamentos Pendentes ({operationalMetrics.pagamentosPendentes.length})
              </Typography>
              
              <Box sx={{ mb: 3, p: 2, bgcolor: 'info.light', borderRadius: '12px' }}>
                <Typography variant="h5" fontWeight="bold" color="info.main">
                  Total a Pagar este Mês: R$ {operationalMetrics.totalPagarMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </Typography>
              </Box>
              
              <TableContainer component={Paper} sx={{ maxHeight: 350, borderRadius: '12px' }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Motorista</TableCell>
                      <TableCell align="right">Valor</TableCell>
                      <TableCell>Data</TableCell>
                      <TableCell align="center">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {operationalMetrics.pagamentosPendentes.map((payment) => {
                      const driver = operationalData.drivers.find(d => d.id === payment.motoristaId);
                      
                      return (
                        <TableRow key={payment.id} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                          <TableCell>{driver?.name || 'N/A'}</TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight="medium" color="success.main">
                              R$ {Number(payment.amount || 0).toFixed(2)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {new Date(payment.createdAt).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={payment.status} 
                              color="warning" 
                              size="small" 
                              sx={{ borderRadius: '8px' }}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </ModernCard>
        );

      default:
        return null;
    }
  };

  if (isLoading && !operationalMetrics) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={60} sx={{ mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Carregando dados operacionais...
            </Typography>
          </Box>
        </Box>
      </Container>
    );
  }

  if (!operationalMetrics) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <Box sx={{ textAlign: 'center' }}>
            <Assignment sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              Nenhum Dado Operacional
            </Typography>
            <Button variant="contained" onClick={refreshData} disabled={isLoading}>
              Carregar Dados
            </Button>
          </Box>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
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
            Dashboard Operacional
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Alertas e ações prioritárias
          </Typography>
        </Box>
        
        <Tooltip title={isLoading ? "Carregando..." : "Atualizar dados"}>
          <span>
            <IconButton
              onClick={refreshData}
              disabled={isLoading}
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                borderRadius: '12px',
                '&:hover': { bgcolor: 'primary.dark', transform: 'scale(1.05)' },
                '&:disabled': { bgcolor: 'action.disabledBackground' },
              }}
            >
              <Refresh />
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      {/* Cards de Alertas Principais */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <AlertCard
            icon={<Assignment />}
            title="Pedidos Pendentes"
            count={operationalMetrics.pedidosPendentes.length}
            subtitle={`${operationalMetrics.pedidosUrgentes.length} urgentes`}
            color="warning"
            urgent={operationalMetrics.pedidosUrgentes.length > 0}
            onClick={() => setSelectedView('pending')}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <AlertCard
            icon={<LocalShipping />}
            title="Em Rota"
            count={operationalMetrics.entregasEmRota.length}
            subtitle={`${operationalMetrics.entregasAtrasadas.length} atrasadas`}
            color="info"
            urgent={operationalMetrics.entregasAtrasadas.length > 0}
            onClick={() => setSelectedView('inRoute')}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <AlertCard
            icon={<ErrorIcon />}
            title="Com Problemas"
            count={operationalMetrics.entregasComProblemas.length}
            subtitle="Requerem atenção"
            color="error"
            urgent={operationalMetrics.entregasComProblemas.length > 0}
            onClick={() => setSelectedView('problems')}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <AlertCard
            icon={<AccountBalance />}
            title="Pagamentos"
            count={operationalMetrics.pagamentosPendentes.length}
            subtitle={`R$ ${operationalMetrics.valorPagamentosPendentes.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`}
            color="success"
            onClick={() => setSelectedView('payments')}
          />
        </Grid>
      </Grid>

      {/* Resumo Financeiro Mensal */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <ModernCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AttachMoney sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="h6" fontWeight="bold">
                  Resumo Financeiro do Mês
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: 'success.light', borderRadius: '12px' }}>
                <Typography variant="body1" fontWeight="medium">
                  Total a Pagar Motoristas
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  R$ {operationalMetrics.totalPagarMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </Typography>
              </Box>
            </CardContent>
          </ModernCard>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <ModernCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Schedule sx={{ mr: 1, color: 'info.main' }} />
                <Typography variant="h6" fontWeight="bold">
                  Status Geral
                </Typography>
              </Box>
              
              <List dense>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText 
                    primary="Motoristas Ativos"
                    secondary={`${operationalData.drivers.length} cadastrados`}
                  />
                  <Typography variant="h6" fontWeight="bold">
                    {operationalData.drivers.length}
                  </Typography>
                </ListItem>
                <Divider />
                <ListItem sx={{ px: 0 }}>
                  <ListItemText 
                    primary="Veículos Disponíveis"
                    secondary="Frota total"
                  />
                  <Typography variant="h6" fontWeight="bold">
                    {operationalData.vehicles.length}
                  </Typography>
                </ListItem>
              </List>
            </CardContent>
          </ModernCard>
        </Grid>
      </Grid>

      {/* View Detalhada */}
      <Box sx={{ mb: 4 }}>
        {renderDetailedView()}
      </Box>
    </Container>
  );
};

export default withAuth(OperationalDashboard);