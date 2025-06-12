'use client'
import { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Chip,
  Avatar,
  TextField,
  Button,
  Stack,
} from '@mui/material'
import {
  BarChart as BarChartIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  LocalShipping as DeliveryIcon,
  Assignment as OrderIcon,
  Payment as PaymentIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  Search as SearchIcon,
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'
import type { Statistics, Driver } from '../types/api'
import AppLayout from '../components/layout/AppLayout'
import AuthGuard from '../components/guards/AuthGuard'

export default function EstatisticasPage() {
  const { user } = useAuth()
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [startDate, setStartDate] = useState<string>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  )
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  )
  const [selectedDriver, setSelectedDriver] = useState<string>('')

  useEffect(() => {
    loadDrivers()
    loadStatistics()
  }, [])

  const loadDrivers = async () => {
    try {
      const driversData = await api.getDrivers()
      setDrivers(driversData)
    } catch (err) {
      console.error('Erro ao carregar motoristas:', err)
    }
  }

  const loadStatistics = async () => {
    try {
      setLoading(true)
      setError('')
      const statsData = await api.getStatistics(
        startDate,
        endDate,
        selectedDriver || undefined,
        true
      )
      setStatistics(statsData)
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err)
      setError('Erro ao carregar estatísticas')
    } finally {
      setLoading(false)
    }
  }

  const handleFilter = () => {
    loadStatistics()
  }

  const getDriverName = (driverId: string) => {
    const driver = drivers.find(d => d.id === driverId)
    return driver?.name || 'Motorista não encontrado'
  }

  const formatPeriod = () => {
    const start = new Date(startDate + 'T00:00:00').toLocaleDateString('pt-BR')
    const end = new Date(endDate + 'T00:00:00').toLocaleDateString('pt-BR')
    return `${start} - ${end}`
  }
  
  const setCurrentMonth = () => {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    setStartDate(firstDay.toISOString().split('T')[0])
    setEndDate(now.toISOString().split('T')[0])
  }

  const setLastMonth = () => {
    const now = new Date()
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
    setStartDate(firstDayLastMonth.toISOString().split('T')[0])
    setEndDate(lastDayLastMonth.toISOString().split('T')[0])
  }

  const clearError = () => setError('')

  if (loading && !statistics) {
    return (
      <AppLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      </AppLayout>
    )
  }

  return (
    <AuthGuard requiredRoles={['admin']}>
      <AppLayout>
        <Box sx={{ flexGrow: 1 }}>
          <Box mb={4}>
            <Typography variant="h4" component="h1" gutterBottom>
              Estatísticas & Relatórios
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Análise detalhada de performance e métricas do sistema
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={clearError}>
              {error}
            </Alert>
          )}

          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Filtros</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                <TextField
                  type="date"
                  label="Data Inicial"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  sx={{ flexGrow: 1, minWidth: '150px' }}
                />
                <TextField
                  type="date"
                  label="Data Final"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  sx={{ flexGrow: 1, minWidth: '150px' }}
                />
                <FormControl size="small" sx={{ flexGrow: 1, minWidth: '200px' }}>
                  <InputLabel>Motorista</InputLabel>
                  <Select value={selectedDriver} onChange={(e) => setSelectedDriver(e.target.value)}>
                    <MenuItem value="">Todos os motoristas</MenuItem>
                    {drivers.map((driver) => (
                      <MenuItem key={driver.id} value={driver.id}>{driver.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Box display="flex" gap={1}>
                  <Button size="small" variant="outlined" onClick={setCurrentMonth}>Mês Atual</Button>
                  <Button size="small" variant="outlined" onClick={setLastMonth}>Mês Anterior</Button>
                </Box>
                <Button variant="contained" startIcon={<SearchIcon />} onClick={handleFilter} disabled={loading}>
                  Consultar
                </Button>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Período selecionado: {formatPeriod()}
              </Typography>
            </CardContent>
          </Card>

          {statistics ? (
            <Stack spacing={4}>
              <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' } }}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center">
                      <OrderIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                      <Box>
                        <Typography color="textSecondary" gutterBottom>Pedidos Pendentes</Typography>
                        <Typography variant="h4">{statistics.ordersPending}</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center">
                      <DeliveryIcon sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
                      <Box>
                        <Typography color="textSecondary" gutterBottom>Pedidos em Rota</Typography>
                        <Typography variant="h4">{statistics.ordersInRoute}</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center">
                      <AssessmentIcon sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                      <Box>
                        <Typography color="textSecondary" gutterBottom>Pedidos Finalizados</Typography>
                        <Typography variant="h4">{statistics.ordersFinalized}</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center">
                      <PaymentIcon sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                      <Box>
                        <Typography color="textSecondary" gutterBottom>Fretes a Pagar</Typography>
                        <Typography variant="h4">{statistics.freightsToPay}</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Box>

              <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' } }}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Entregas por Status</Typography>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="body2">Em Rota</Typography>
                        <Chip label={statistics.deliveriesInRoute} color="primary" size="small" />
                      </Box>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2">Finalizadas</Typography>
                        <Chip label={statistics.deliveriesFinalized} color="success" size="small" />
                      </Box>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Resumo Financeiro</Typography>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="body2">Fretes Pagos</Typography>
                        <Chip label={statistics.freightsPaid} color="success" size="small" />
                      </Box>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2">Fretes Pendentes</Typography>
                        <Chip label={statistics.freightsToPay} color="warning" size="small" />
                      </Box>
                    </CardContent>
                  </Card>
              </Box>

              {statistics.notesByRegion?.length > 0 && (
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom><LocationIcon sx={{ mr: 1, verticalAlign: 'middle' }} />Distribuição por Região</Typography>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead><TableRow><TableCell>Região</TableCell><TableCell align="right">Qtd. Pedidos</TableCell><TableCell align="right">%</TableCell></TableRow></TableHead>
                        <TableBody>
                          {statistics.notesByRegion.sort((a, b) => b.count - a.count).slice(0, 10).map((region) => {
                            const total = statistics.notesByRegion.reduce((sum, r) => sum + r.count, 0)
                            const percentage = total > 0 ? (region.count / total * 100).toFixed(1) : '0'
                            return (
                              <TableRow key={region.region}>
                                <TableCell>{region.region}</TableCell>
                                <TableCell align="right">{region.count}</TableCell>
                                <TableCell align="right">{percentage}%</TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              )}

              {statistics.avgOrdersPerDriver?.length > 0 && (
                 <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' } }}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom><TrendingUpIcon sx={{ mr: 1, verticalAlign: 'middle' }} />Média de Pedidos/Motorista</Typography>
                        <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                          {statistics.avgOrdersPerDriver.map((item) => (
                            <Box key={item.driverId} display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                              <Box display="flex" alignItems="center" gap={1}><Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}><PersonIcon fontSize="small" /></Avatar><Typography variant="body2">{getDriverName(item.driverId)}</Typography></Box>
                              <Chip label={`${item.average} pedidos`} size="small" color="primary" />
                            </Box>
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                    {statistics.avgValueNotesPerDriver && (
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom><BarChartIcon sx={{ mr: 1, verticalAlign: 'middle' }} />Valor Médio/Motorista</Typography>
                          <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                            {statistics.avgValueNotesPerDriver.map((item) => (
                              <Box key={item.driverId} display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                <Box display="flex" alignItems="center" gap={1}><Avatar sx={{ width: 32, height: 32, bgcolor: 'success.main' }}><PersonIcon fontSize="small" /></Avatar><Typography variant="body2">{getDriverName(item.driverId)}</Typography></Box>
                                <Chip label={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.average)} size="small" color="success" />
                              </Box>
                            ))}
                          </Box>
                        </CardContent>
                      </Card>
                    )}
                    {statistics.avgWeightPerDriver && (
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom><AssessmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />Peso Médio/Motorista</Typography>
                          <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                            {statistics.avgWeightPerDriver.map((item) => (
                              <Box key={item.driverId} display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                <Box display="flex" alignItems="center" gap={1}><Avatar sx={{ width: 32, height: 32, bgcolor: 'info.main' }}><PersonIcon fontSize="small" /></Avatar><Typography variant="body2">{getDriverName(item.driverId)}</Typography></Box>
                                <Chip label={`${item.average.toFixed(1)} kg`} size="small" color="info" />
                              </Box>
                            ))}
                          </Box>
                        </CardContent>
                      </Card>
                    )}
                </Box>
              )}

              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Resumo do Período</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' } }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Total de Pedidos</Typography>
                      <Typography variant="h6">{statistics.ordersPending + statistics.ordersInRoute + statistics.ordersFinalized}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Taxa de Finalização</Typography>
                      <Typography variant="h6">{((statistics.ordersFinalized / (statistics.ordersPending + statistics.ordersInRoute + statistics.ordersFinalized)) * 100 || 0).toFixed(1)}%</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Entregas Ativas</Typography>
                      <Typography variant="h6">{statistics.deliveriesInRoute}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Regiões Atendidas</Typography>
                      <Typography variant="h6">{statistics.notesByRegion?.length || 0}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Stack>
          ) : (
            <Box textAlign="center" py={8}>
              <AssessmentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Selecione um período e clique em "Consultar" para visualizar as estatísticas
              </Typography>
            </Box>
          )}
        </Box>
      </AppLayout>
    </AuthGuard>
  )
}