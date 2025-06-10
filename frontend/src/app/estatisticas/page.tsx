'use client';

import React, { useState, useMemo } from 'react';
import {
  Typography,
  Grid,
  Box,
  Button,
  Alert,
  LinearProgress,
  Stack,
  Badge,
} from '@mui/material';
import {
  LocalShipping,
  Assignment,
  TrendingUp,
  Speed,
  Error as ErrorIcon,
  PendingActions,
  Navigation,
  MonetizationOn,
  AccessTime,
  Add,
  Refresh,
  RouteOutlined,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import withAuth from '../hoc/withAuth';
import { useCrud } from '../hooks';
import {
  type Order,
  type Delivery,
  type Driver,
  type Payment,
  type DashboardMetrics,
  OrderStatus,
  DeliveryStatus,
  PaymentStatus,
  OrderPriority,
  DELIVERY_STATUS_ARRAYS,
  ORDER_STATUS_ARRAYS,
  PAYMENT_STATUS_ARRAYS,
  StatusHelper,
} from '../../types';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactElement;
  color?: string;
  urgent?: boolean;
  onClick?: () => void;
  badge?: number;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color = '#667eea',
  urgent = false,
  onClick,
  badge,
}) => (
  <Box
    onClick={onClick}
    sx={{
      p: 3,
      borderRadius: 3,
      background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
      color: 'white',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'all 0.3s ease',
      ...(urgent && {
        animation: 'pulse 2s infinite',
        '@keyframes pulse': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(244, 67, 54, 0.7)' },
          '50%': { boxShadow: '0 0 0 20px rgba(244, 67, 54, 0)' },
        }
      }),
      '&:hover': onClick ? {
        transform: 'translateY(-4px)',
        boxShadow: `0 20px 40px ${color}40`,
      } : {},
    }}
  >
    <Box display="flex" alignItems="center" justifyContent="space-between">
      <Box>
        <Typography variant="h3" fontWeight={700} color="inherit">
          {value}
        </Typography>
        <Typography variant="h6" fontWeight={600} color="inherit">
          {title}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }} color="inherit">
          {subtitle}
        </Typography>
      </Box>
      <Box>
        {badge ? (
          <Badge badgeContent={badge} color="warning">
            {React.cloneElement(icon, { sx: { fontSize: 40, opacity: 0.8 } })}
          </Badge>
        ) : (
          React.cloneElement(icon, { sx: { fontSize: 40, opacity: 0.8 } })
        )}
      </Box>
    </Box>
  </Box>
);

const StatisticsPage: React.FC = () => {
  const router = useRouter();
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const orders = useCrud<Order>('/orders', { globalLoading: true });
  const deliveries = useCrud<Delivery>('/delivery', { globalLoading: true });
  const drivers = useCrud<Driver>('/drivers', { globalLoading: true });
  const payments = useCrud<Payment>('/payments', { globalLoading: true });

  const metrics = useMemo((): DashboardMetrics => {
    const ordersData = orders.data || [];
    const deliveriesData = deliveries.data || [];
    const driversData = drivers.data || [];
    const paymentsData = payments.data || [];

    const pedidosUrgentes = ordersData.filter(order => StatusHelper.isOrderUrgent({
      status: order.status,
      prioridade: order.prioridade,
      data: order.data
    }));

    const entregasAtrasadas = deliveriesData.filter(delivery => 
      StatusHelper.isDeliveryDelayed({
        status: delivery.status,
        dataInicio: delivery.dataInicio
      })
    );

    const roteirosParaLiberar = deliveriesData.filter(d => 
      d.status === DeliveryStatus.A_LIBERAR
    );

    const pagamentosHoje = paymentsData.filter(payment => 
      StatusHelper.isPaymentDueToday({
        status: payment.status,
        createdAt: payment.createdAt
      })
    );

    const entregasAndamento = deliveriesData.filter(d => 
      DELIVERY_STATUS_ARRAYS.IN_PROGRESS.includes(d.status as DeliveryStatus) ||
      d.status === DeliveryStatus.A_LIBERAR
    );

    const pedidosSemRota = ordersData.filter(o => 
      ORDER_STATUS_ARRAYS.NO_ROUTE.includes(o.status as OrderStatus)
    );

    const motoristasAtivos = driversData.filter(driver => 
      StatusHelper.isDriverActive(driver.id, deliveriesData.map(d => ({
        motoristaId: d.motoristaId,
        status: d.status
      })))
    );

    const entregasHoje = deliveriesData.filter(d => 
      d.status === DeliveryStatus.FINALIZADO && 
      StatusHelper.isToday(d.dataFim || d.createdAt)
    );
    const receitaHoje = entregasHoje.reduce((sum, d) => sum + (Number(d.totalValor) || 0), 0);

    const entregasMes = deliveriesData.filter(d => 
      d.status === DeliveryStatus.FINALIZADO && 
      StatusHelper.isThisMonth(d.dataFim || d.createdAt)
    );
    const receitaMes = entregasMes.reduce((sum, d) => sum + (Number(d.totalValor) || 0), 0);

    const pagamentosAFazer = paymentsData
      .filter(p => PAYMENT_STATUS_ARRAYS.PENDING.includes(p.status as PaymentStatus))
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    const entregasFinalizadas = deliveriesData.filter(d => 
      d.status === DeliveryStatus.FINALIZADO
    );
    
    const entregasNoPrazo = entregasFinalizadas.filter(d => {
      if (!d.dataInicio || !d.dataFim) return true;
      const inicioTime = new Date(d.dataInicio).getTime();
      const fimTime = new Date(d.dataFim).getTime();
      const horasEntrega = (fimTime - inicioTime) / (1000 * 60 * 60);
      return horasEntrega <= 8;
    });
    
    const taxaEntregaNoPrazo = entregasFinalizadas.length > 0 
      ? (entregasNoPrazo.length / entregasFinalizadas.length) * 100 
      : 100;

    return {
      pedidosUrgentes,
      entregasAtrasadas,
      roteirosParaLiberar,
      pagamentosHoje,
      entregasAndamento,
      pedidosSemRota,
      motoristasAtivos,
      receitaHoje,
      receitaMes,
      pagamentosAFazer,
      taxaEntregaNoPrazo,
      tempoMedioEntrega: 6.2,
      satisfacaoCliente: 4.8,
    };
  }, [orders.data, deliveries.data, drivers.data, payments.data]);
  
  const handleRefresh = async () => {
    await Promise.all([
      orders.refresh(),
      deliveries.refresh(),
      drivers.refresh(),
      payments.refresh(),
    ]);
    setLastUpdate(new Date());
  };

  const navigateTo = {
    pedidosUrgentes: () => router.push(`/pedidos?filter=urgent&status=${OrderStatus.SEM_ROTA}&priority=${OrderPriority.ALTA}`),
    entregasAtrasadas: () => router.push(`/roteiros?filter=delayed&status=${DeliveryStatus.INICIADO}`),
    roteirosLiberar: () => router.push(`/roteiros/liberar?status=${DeliveryStatus.A_LIBERAR}`),
    pagamentos: () => router.push(`/pagamentos?status=${PaymentStatus.PENDENTE}`),
    criarRoteiro: () => router.push('/roteiros/criar'),
    pedidosSemRota: () => router.push(`/pedidos?filter=no-route&status=${OrderStatus.SEM_ROTA}`),
    entregasAndamento: () => router.push(`/roteiros?filter=in-progress&status=${DeliveryStatus.INICIADO}`),
  };

  const loading = orders.loading || deliveries.loading || drivers.loading || payments.loading;
  
  return (
    <Box sx={{ p: 3, maxWidth: '1400px', mx: 'auto' }}>
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
          <Typography variant="body1" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccessTime fontSize="small" />
            Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
          </Typography>
        </Box>
        
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            startIcon={loading ? <LinearProgress sx={{ width: '20px' }}/> : <Refresh />}
            onClick={handleRefresh}
            disabled={loading}
            sx={{ borderRadius: 2 }}
          >
            {loading ? 'Atualizando...' : 'Atualizar'}
          </Button>
          
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={navigateTo.criarRoteiro}
            sx={{
              borderRadius: 2,
              background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
            }}
          >
            Criar Roteiro
          </Button>
        </Stack>
      </Box>

      {loading && (
        <Box sx={{ mb: 3 }}>
          <LinearProgress />
        </Box>
      )}

      {(metrics.pedidosUrgentes.length > 0 || 
        metrics.entregasAtrasadas.length > 0 || 
        metrics.roteirosParaLiberar.length > 0) && (
        <Alert 
          severity="error" 
          sx={{ mb: 4, borderRadius: 3 }}
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              ATUALIZAR
            </Button>
          }
        >
          <Typography variant="h6" fontWeight={600}>
            ⚠️ ATENÇÃO REQUERIDA AGORA
          </Typography>
          <Typography>
            {metrics.pedidosUrgentes.length} pedidos urgentes • 
            {metrics.entregasAtrasadas.length} entregas atrasadas • 
            {metrics.roteirosParaLiberar.length} roteiros aguardando liberação
          </Typography>
        </Alert>
      )}

      {(metrics.pedidosUrgentes.length > 0 || 
        metrics.entregasAtrasadas.length > 0 || 
        metrics.roteirosParaLiberar.length > 0 ||
        metrics.pagamentosHoje.length > 0) && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {metrics.pedidosUrgentes.length > 0 && (
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard
                title="Pedidos Urgentes"
                value={metrics.pedidosUrgentes.length}
                subtitle="Precisam de rota HOJE"
                icon={<Assignment />}
                color="#f44336"
                urgent
                onClick={navigateTo.pedidosUrgentes}
                badge={1}
              />
            </Grid>
          )}

          {metrics.entregasAtrasadas.length > 0 && (
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard
                title="Entregas Atrasadas"
                value={metrics.entregasAtrasadas.length}
                subtitle="+8h em rota"
                icon={<ErrorIcon />}
                color="#f44336"
                urgent
                onClick={navigateTo.entregasAtrasadas}
              />
            </Grid>
          )}

          {metrics.roteirosParaLiberar.length > 0 && (
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard
                title="Para Liberar"
                value={metrics.roteirosParaLiberar.length}
                subtitle="Aguardam aprovação"
                icon={<PendingActions />}
                color="#ff9800"
                onClick={navigateTo.roteirosLiberar}
              />
            </Grid>
          )}

          {metrics.pagamentosHoje.length > 0 && (
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard
                title="Pagamentos Hoje"
                value={metrics.pagamentosHoje.length}
                subtitle="Vencimento hoje"
                icon={<MonetizationOn />}
                color="#ff9800"
                onClick={navigateTo.pagamentos}
              />
            </Grid>
          )}
        </Grid>
      )}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Em Andamento"
            value={metrics.entregasAndamento.length}
            subtitle="Entregas ativas"
            icon={<LocalShipping />}
            color="#2196f3"
            onClick={navigateTo.entregasAndamento}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Sem Rota"
            value={metrics.pedidosSemRota.length}
            subtitle="Aguardam roteirização"
            icon={<RouteOutlined />}
            color="#ff9800"
            onClick={navigateTo.pedidosSemRota}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Motoristas Ativos"
            value={metrics.motoristasAtivos.length}
            subtitle="Em operação"
            icon={<Navigation />}
            color="#4caf50"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="A Pagar"
            value={formatCurrency(metrics.pagamentosAFazer).replace('R$ ', '')}
            subtitle="Pagamentos pendentes"
            icon={<MonetizationOn />}
            color="#9c27b0"
            onClick={navigateTo.pagamentos}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Box sx={{ p: 3, borderRadius: 3, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUp color="primary" />
              Performance Financeira
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <Box sx={{ p: 2, textAlign: 'center', bgcolor: 'background.default', borderRadius: 2 }}>
                  <Typography variant="h4" fontWeight={700} color="success.main">
                    {formatCurrency(metrics.receitaHoje)}
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    Receita Hoje
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Entregas finalizadas
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Box sx={{ p: 2, textAlign: 'center', bgcolor: 'background.default', borderRadius: 2 }}>
                  <Typography variant="h4" fontWeight={700} color="primary.main">
                    {formatCurrency(metrics.receitaMes)}
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    Receita do Mês
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Acumulado mensal
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Box sx={{ p: 2, textAlign: 'center', bgcolor: 'background.default', borderRadius: 2 }}>
                  <Typography variant="h4" fontWeight={700} color="info.main">
                    {metrics.taxaEntregaNoPrazo.toFixed(1)}%
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    Taxa de Sucesso
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Entregas no prazo
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Box sx={{ p: 3, borderRadius: 3, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Speed color="primary" />
              KPIs Operacionais
            </Typography>
            
            <Stack spacing={2}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Tempo Médio Entrega</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {metrics.tempoMedioEntrega}h
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(metrics.tempoMedioEntrega / 10) * 100} 
                  sx={{ borderRadius: 1 }}
                />
              </Box>
              
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Satisfação Cliente</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {metrics.satisfacaoCliente}/5.0
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(metrics.satisfacaoCliente / 5) * 100} 
                  color="success"
                  sx={{ borderRadius: 1 }}
                />
              </Box>

              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Eficiência Operacional</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {metrics.taxaEntregaNoPrazo.toFixed(0)}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={metrics.taxaEntregaNoPrazo} 
                  color="info"
                  sx={{ borderRadius: 1 }}
                />
              </Box>
            </Stack>
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ p: 3, borderRadius: 3, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
          Ações Rápidas
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Assignment />}
              onClick={navigateTo.pedidosUrgentes}
              sx={{ borderRadius: 2, py: 1.5, textTransform: 'none' }}
            >
              Ver Pedidos Urgentes
              {metrics.pedidosUrgentes.length > 0 && (
                <Badge badgeContent={metrics.pedidosUrgentes.length} color="error" sx={{ ml: 1 }} />
              )}
            </Button>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<RouteOutlined />}
              onClick={navigateTo.criarRoteiro}
              sx={{ borderRadius: 2, py: 1.5, textTransform: 'none' }}
            >
              Criar Novo Roteiro
            </Button>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<PendingActions />}
              onClick={navigateTo.roteirosLiberar}
              sx={{ borderRadius: 2, py: 1.5, textTransform: 'none' }}
            >
              Liberar Roteiros
              {metrics.roteirosParaLiberar.length > 0 && (
                <Badge badgeContent={metrics.roteirosParaLiberar.length} color="warning" sx={{ ml: 1 }} />
              )}
            </Button>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<MonetizationOn />}
              onClick={navigateTo.pagamentos}
              sx={{ borderRadius: 2, py: 1.5, textTransform: 'none' }}
            >
              Processar Pagamentos
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default withAuth(StatisticsPage);