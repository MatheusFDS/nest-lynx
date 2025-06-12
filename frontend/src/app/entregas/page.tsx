'use client'
import { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Tooltip,
  Autocomplete,
  Stack,
} from '@mui/material'
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  LocalShipping as DeliveryIcon,
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'
import type { Delivery, Driver, Vehicle, Order, CreateDeliveryDto } from '../types/api'
import AppLayout from '../components/layout/AppLayout'
import AuthGuard from '../components/guards/AuthGuard'
import RoleGuard from '../components/guards/RoleGuard'

export default function EntregasPage() {
  const { user } = useAuth()
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [availableOrders, setAvailableOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [selectedDriver, setSelectedDriver] = useState('')
  const [selectedVehicle, setSelectedVehicle] = useState('')
  const [selectedOrders, setSelectedOrders] = useState<Order[]>([])
  const [observacao, setObservacao] = useState('')

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejecting, setRejecting] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [deliveryToReject, setDeliveryToReject] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [deliveriesData, driversData, vehiclesData, ordersData] = await Promise.all([
        api.getDeliveries(),
        api.getDrivers(),
        api.getVehicles(),
        api.getOrders()
      ])
      
      setDeliveries(deliveriesData)
      setDrivers(driversData)
      setVehicles(vehiclesData)
      
      const availableOrdersData = ordersData.filter(order => order.status === 'SEM_ROTA')
      setAvailableOrders(availableOrdersData)
      
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
      setError('Erro ao carregar dados das entregas')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const statusColors: { [key: string]: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' } = {
      'A_LIBERAR': 'warning',
      'INICIADO': 'primary',
      'FINALIZADO': 'success',
      'REJEITADO': 'error',
    }
    return statusColors[status] || 'default'
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const handleCreateDelivery = async () => {
    if (!selectedDriver || !selectedVehicle || selectedOrders.length === 0) {
      setError('Preencha todos os campos obrigatórios')
      return
    }

    try {
      setCreating(true)
      setError('')

      const deliveryData: CreateDeliveryDto = {
        motoristaId: selectedDriver,
        veiculoId: selectedVehicle,
        orders: selectedOrders.map((order, index) => ({
          id: order.id,
          sorting: index + 1
        })),
        observacao: observacao || undefined
      }

      await api.createDelivery(deliveryData)
      setSuccess('Roteiro criado com sucesso!')
      setCreateDialogOpen(false)
      resetCreateForm()
      loadData()

    } catch (err) {
      console.error('Erro ao criar roteiro:', err)
      setError('Erro ao criar roteiro')
    } finally {
      setCreating(false)
    }
  }

  const handleApproveDelivery = async (deliveryId: string) => {
    try {
      await api.liberarRoteiro(deliveryId)
      setSuccess('Roteiro liberado com sucesso!')
      loadData()
    } catch (err) {
      console.error('Erro ao liberar roteiro:', err)
      setError('Erro ao liberar roteiro')
    }
  }

  const handleRejectDelivery = async () => {
    if (!deliveryToReject || !rejectReason.trim()) {
      setError('Motivo da rejeição é obrigatório')
      return
    }

    try {
      setRejecting(true)
      await api.rejeitarRoteiro(deliveryToReject, rejectReason)
      setSuccess('Roteiro rejeitado com sucesso!')
      setRejectDialogOpen(false)
      setRejectReason('')
      setDeliveryToReject(null)
      loadData()
    } catch (err) {
      console.error('Erro ao rejeitar roteiro:', err)
      setError('Erro ao rejeitar roteiro')
    } finally {
      setRejecting(false)
    }
  }

  const handleDeleteDelivery = async (deliveryId: string) => {
    if (!confirm('Tem certeza que deseja excluir este roteiro?')) return

    try {
      await api.deleteDelivery(deliveryId)
      setSuccess('Roteiro excluído com sucesso!')
      loadData()
    } catch (err) {
      console.error('Erro ao excluir roteiro:', err)
      setError('Erro ao excluir roteiro')
    }
  }

  const resetCreateForm = () => {
    setSelectedDriver('')
    setSelectedVehicle('')
    setSelectedOrders([])
    setObservacao('')
  }

  const openRejectDialog = (deliveryId: string) => {
    setDeliveryToReject(deliveryId)
    setRejectDialogOpen(true)
  }

  const clearMessages = () => {
    setError('')
    setSuccess('')
  }

  if (loading) {
    return (
      <AppLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      </AppLayout>
    )
  }

  return (
    <AuthGuard requiredRoles={['admin', 'user']}>
      <AppLayout>
        <Box sx={{ flexGrow: 1 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Typography variant="h6">
              Lista de Roteiros ({deliveries.length})
            </Typography>
            <RoleGuard allowedRoles={['admin']}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setCreateDialogOpen(true)}
              >
                Novo Roteiro
              </Button>
            </RoleGuard>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={clearMessages}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 3 }} onClose={clearMessages}>
              {success}
            </Alert>
          )}

          <Card>
            <CardContent>
              {deliveries.length === 0 ? (
                <Box textAlign="center" py={4}>
                  <DeliveryIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    Nenhum roteiro encontrado
                  </Typography>
                </Box>
              ) : (
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Motorista</TableCell>
                        <TableCell>Veículo</TableCell>
                        <TableCell>Data Início</TableCell>
                        <TableCell>Pedidos</TableCell>
                        <TableCell>Valor Total</TableCell>
                        <TableCell>Frete</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="center">Ações</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {deliveries.map((delivery) => (
                        <TableRow key={delivery.id} hover>
                          <TableCell>
                            <Typography variant="body2" fontFamily="monospace">
                              {delivery.id.slice(0, 8)}...
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {delivery.Driver?.name || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {delivery.Vehicle ? `${delivery.Vehicle.model} (${delivery.Vehicle.plate})` : 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {formatDate(delivery.dataInicio)}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {delivery.orders?.length || 0}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {formatCurrency(delivery.totalValor)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatCurrency(delivery.valorFrete)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={delivery.status.replace('_', ' ')}
                              color={getStatusColor(delivery.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="Ver detalhes">
                              <IconButton size="small">
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                            
                            <RoleGuard allowedRoles={['admin']}>
                              {delivery.status === 'A_LIBERAR' && (
                                <>
                                  <Tooltip title="Liberar roteiro">
                                    <IconButton 
                                      size="small" 
                                      color="success"
                                      onClick={() => handleApproveDelivery(delivery.id)}
                                    >
                                      <ApproveIcon />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Rejeitar roteiro">
                                    <IconButton 
                                      size="small" 
                                      color="error"
                                      onClick={() => openRejectDialog(delivery.id)}
                                    >
                                      <RejectIcon />
                                    </IconButton>
                                  </Tooltip>
                                </>
                              )}
                              
                              {(delivery.status === 'A_LIBERAR' || delivery.status === 'REJEITADO') && (
                                <Tooltip title="Excluir roteiro">
                                  <IconButton 
                                    size="small" 
                                    color="error"
                                    onClick={() => handleDeleteDelivery(delivery.id)}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </RoleGuard>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>

          <Dialog
            open={createDialogOpen}
            onClose={() => !creating && setCreateDialogOpen(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>Criar Novo Roteiro</DialogTitle>
            <DialogContent>
              <Stack spacing={3} sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                  <FormControl fullWidth>
                    <InputLabel>Motorista</InputLabel>
                    <Select
                      value={selectedDriver}
                      onChange={(e) => setSelectedDriver(e.target.value)}
                      disabled={creating}
                    >
                      {drivers.map((driver) => (
                        <MenuItem key={driver.id} value={driver.id}>
                          {driver.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth>
                    <InputLabel>Veículo</InputLabel>
                    <Select
                      value={selectedVehicle}
                      onChange={(e) => setSelectedVehicle(e.target.value)}
                      disabled={creating}
                    >
                      {vehicles.map((vehicle) => (
                        <MenuItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.model} ({vehicle.plate})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                <Autocomplete
                  multiple
                  options={availableOrders}
                  getOptionLabel={(option) => `${option.numero} - ${option.cliente} (${option.cidade})`}
                  value={selectedOrders}
                  onChange={(event, newValue) => setSelectedOrders(newValue)}
                  disabled={creating}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Pedidos"
                      placeholder="Selecione os pedidos para este roteiro"
                    />
                  )}
                />
                <TextField
                  fullWidth
                  label="Observações"
                  multiline
                  rows={3}
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                  disabled={creating}
                />
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => setCreateDialogOpen(false)}
                disabled={creating}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateDelivery}
                variant="contained"
                disabled={creating || !selectedDriver || !selectedVehicle || selectedOrders.length === 0}
                startIcon={creating ? <CircularProgress size={20} /> : <AddIcon />}
              >
                {creating ? 'Criando...' : 'Criar Roteiro'}
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog
            open={rejectDialogOpen}
            onClose={() => !rejecting && setRejectDialogOpen(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>Rejeitar Roteiro</DialogTitle>
            <DialogContent>
              <TextField
                fullWidth
                label="Motivo da Rejeição"
                multiline
                rows={4}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                disabled={rejecting}
                sx={{ mt: 2 }}
                required
              />
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => setRejectDialogOpen(false)}
                disabled={rejecting}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleRejectDelivery}
                variant="contained"
                color="error"
                disabled={rejecting || !rejectReason.trim()}
                startIcon={rejecting ? <CircularProgress size={20} /> : <RejectIcon />}
              >
                {rejecting ? 'Rejeitando...' : 'Rejeitar'}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </AppLayout>
    </AuthGuard>
  )
}