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
  Checkbox,
  Avatar,
  InputAdornment,
  Stack,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Payment as PaymentIcon,
  GroupWork as GroupIcon,
  UnfoldMore as UngroupIcon,
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'
import type { Payment, Driver, CreatePaymentDto, UpdatePaymentDto } from '../types/api'
import AppLayout from '../components/layout/AppLayout'
import AuthGuard from '../components/guards/AuthGuard'

export default function PagamentosPage() {
  const { user } = useAuth()
  const [payments, setPayments] = useState<Payment[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null)
  const [submitting, setSubmitting] = useState(false)
  
  const [amount, setAmount] = useState('')
  const [status, setStatus] = useState('Pendente')
  const [motoristaId, setMotoristaId] = useState('')

  const [selectedPayments, setSelectedPayments] = useState<string[]>([])
  const [grouping, setGrouping] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [paymentsData, driversData] = await Promise.all([
        api.getPayments(),
        api.getDrivers()
      ])
      
      setPayments(paymentsData)
      setDrivers(driversData)
      
    } catch (err) {
      console.error('Erro ao carregar pagamentos:', err)
      setError('Erro ao carregar dados dos pagamentos')
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePayment = async () => {
    if (!amount.trim() || !motoristaId) {
      setError('Valor e motorista são obrigatórios')
      return
    }

    const numericAmount = parseFloat(amount.replace(',', '.'))
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Valor deve ser um número positivo')
      return
    }

    try {
      setSubmitting(true)
      setError('')

      const paymentData: CreatePaymentDto = {
        amount: numericAmount,
        status,
        motoristaId
      }

      await api.createPayment(paymentData)
      setSuccess('Pagamento criado com sucesso!')
      setDialogOpen(false)
      resetForm()
      loadData()

    } catch (err) {
      console.error('Erro ao criar pagamento:', err)
      setError('Erro ao criar pagamento')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdatePayment = async () => {
    if (!editingPayment || !amount.trim()) {
      setError('Valor é obrigatório')
      return
    }

    const numericAmount = parseFloat(amount.replace(',', '.'))
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Valor deve ser um número positivo')
      return
    }

    try {
      setSubmitting(true)
      setError('')

      const updateData: UpdatePaymentDto = {
        amount: numericAmount,
        status
      }

      await api.updatePayment(editingPayment.id, updateData)
      setSuccess('Pagamento atualizado com sucesso!')
      setDialogOpen(false)
      resetForm()
      loadData()

    } catch (err) {
      console.error('Erro ao atualizar pagamento:', err)
      setError('Erro ao atualizar pagamento')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeletePayment = async (paymentId: string) => {
    if (!confirm('Tem certeza que deseja excluir este pagamento?')) return

    try {
      await api.deletePayment(paymentId)
      setSuccess('Pagamento excluído com sucesso!')
      loadData()
    } catch (err) {
      console.error('Erro ao excluir pagamento:', err)
      setError('Erro ao excluir pagamento')
    }
  }

  const handleUpdateStatus = async (paymentId: string, newStatus: string) => {
    try {
      await api.updatePaymentStatus(paymentId, newStatus)
      setSuccess('Status atualizado com sucesso!')
      loadData()
    } catch (err) {
      console.error('Erro ao atualizar status:', err)
      setError('Erro ao atualizar status')
    }
  }

  const handleGroupPayments = async () => {
    if (selectedPayments.length < 2) {
      setError('Selecione pelo menos 2 pagamentos para agrupar')
      return
    }

    try {
      setGrouping(true)
      await api.groupPayments(selectedPayments)
      setSuccess('Pagamentos agrupados com sucesso!')
      setSelectedPayments([])
      loadData()
    } catch (err) {
      console.error('Erro ao agrupar pagamentos:', err)
      setError('Erro ao agrupar pagamentos')
    } finally {
      setGrouping(false)
    }
  }

  const handleUngroupPayment = async (paymentId: string) => {
    if (!confirm('Tem certeza que deseja desagrupar este pagamento?')) return

    try {
      await api.ungroupPayments(paymentId)
      setSuccess('Pagamento desagrupado com sucesso!')
      loadData()
    } catch (err) {
      console.error('Erro ao desagrupar pagamento:', err)
      setError('Erro ao desagrupar pagamento')
    }
  }

  const openCreateDialog = () => {
    setEditingPayment(null)
    resetForm()
    setDialogOpen(true)
  }

  const openEditDialog = (payment: Payment) => {
    setEditingPayment(payment)
    setAmount(payment.amount.toString())
    setStatus(payment.status)
    setMotoristaId(payment.motoristaId)
    setDialogOpen(true)
  }

  const resetForm = () => {
    setAmount('')
    setStatus('Pendente')
    setMotoristaId('')
    setEditingPayment(null)
  }

  const handleSelectPayment = (paymentId: string) => {
    setSelectedPayments(prev => 
      prev.includes(paymentId) 
        ? prev.filter(id => id !== paymentId)
        : [...prev, paymentId]
    )
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const getDriverName = (driverId: string) => {
    const driver = drivers.find(d => d.id === driverId)
    return driver?.name || 'Driver não encontrado'
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
    <AuthGuard requiredRoles={['admin']}>
      <AppLayout>
        <Box sx={{ flexGrow: 1 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Typography variant="h6">
              Lista de Pagamentos ({payments.length})
            </Typography>
            <Box display="flex" gap={2}>
              {selectedPayments.length >= 2 && (
                <Button
                  variant="outlined"
                  startIcon={<GroupIcon />}
                  onClick={handleGroupPayments}
                  disabled={grouping}
                >
                  {grouping ? 'Agrupando...' : `Agrupar (${selectedPayments.length})`}
                </Button>
              )}
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={openCreateDialog}
              >
                Novo Pagamento
              </Button>
            </Box>
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
              {payments.length === 0 ? (
                <Box textAlign="center" py={4}>
                  <PaymentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    Nenhum pagamento encontrado
                  </Typography>
                </Box>
              ) : (
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell padding="checkbox">
                          <Checkbox
                            indeterminate={selectedPayments.length > 0 && selectedPayments.length < payments.filter(p => !p.isGroup && p.status === 'Pendente').length}
                            checked={selectedPayments.length === payments.filter(p => !p.isGroup && p.status === 'Pendente').length && payments.filter(p => !p.isGroup && p.status === 'Pendente').length > 0}
                            onChange={(e) => {
                              const eligiblePayments = payments.filter(p => !p.isGroup && p.status === 'Pendente')
                              setSelectedPayments(e.target.checked ? eligiblePayments.map(p => p.id) : [])
                            }}
                          />
                        </TableCell>
                        <TableCell>Pagamento</TableCell>
                        <TableCell>Motorista</TableCell>
                        <TableCell>Valor</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Tipo</TableCell>
                        <TableCell align="center">Ações</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {payments.map((payment) => (
                        <TableRow key={payment.id} hover>
                          <TableCell padding="checkbox">
                            {!payment.isGroup && payment.status === 'Pendente' && (
                              <Checkbox
                                checked={selectedPayments.includes(payment.id)}
                                onChange={() => handleSelectPayment(payment.id)}
                              />
                            )}
                          </TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              <Avatar sx={{ 
                                bgcolor: payment.isGroup ? 'info.main' : 'primary.main', 
                                mr: 2,
                                width: 32,
                                height: 32
                              }}>
                                {payment.isGroup ? <GroupIcon fontSize="small" /> : <PaymentIcon fontSize="small" />}
                              </Avatar>
                              <div>
                                <Typography variant="caption" color="text.secondary">
                                  {payment.id.slice(0, 8)}...
                                </Typography>
                                {payment.isGroup && (
                                  <Chip 
                                    label="Grupo" 
                                    size="small" 
                                    color="info" 
                                    sx={{ ml: 1 }}
                                  />
                                )}
                              </div>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {getDriverName(payment.motoristaId)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {formatCurrency(payment.amount)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <FormControl size="small" sx={{ minWidth: 120 }}>
                              <Select
                                value={payment.status}
                                onChange={(e) => handleUpdateStatus(payment.id, e.target.value)}
                                disabled={payment.isGroup}
                              >
                                <MenuItem value="Pendente">Pendente</MenuItem>
                                <MenuItem value="Pago">Pago</MenuItem>
                                <MenuItem value="Baixado">Baixado</MenuItem>
                                <MenuItem value="Cancelado">Cancelado</MenuItem>
                              </Select>
                            </FormControl>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={payment.isGroup ? 'Agrupado' : 'Individual'}
                              color={payment.isGroup ? 'info' : 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            {!payment.isGroup && (
                              <Tooltip title="Editar pagamento">
                                <IconButton 
                                  size="small" 
                                  onClick={() => openEditDialog(payment)}
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                            
                            {payment.isGroup && (
                              <Tooltip title="Desagrupar">
                                <IconButton 
                                  size="small" 
                                  color="warning"
                                  onClick={() => handleUngroupPayment(payment.id)}
                                >
                                  <UngroupIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                            
                            <Tooltip title="Excluir pagamento">
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => handleDeletePayment(payment.id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
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
            open={dialogOpen}
            onClose={() => !submitting && setDialogOpen(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>
              {editingPayment ? 'Editar Pagamento' : 'Novo Pagamento'}
            </DialogTitle>
            <DialogContent>
              <Stack spacing={3} sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                  <TextField
                    fullWidth
                    label="Valor"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={submitting}
                    required
                    InputProps={{
                      startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                    }}
                    placeholder="0,00"
                  />
                  <FormControl fullWidth required>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      disabled={submitting}
                    >
                      <MenuItem value="Pendente">Pendente</MenuItem>
                      <MenuItem value="Pago">Pago</MenuItem>
                      <MenuItem value="Baixado">Baixado</MenuItem>
                      <MenuItem value="Cancelado">Cancelado</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <FormControl fullWidth required>
                  <InputLabel>Motorista</InputLabel>
                  <Select
                    value={motoristaId}
                    onChange={(e) => setMotoristaId(e.target.value)}
                    disabled={submitting || !!editingPayment}
                  >
                    {drivers.map((driver) => (
                      <MenuItem key={driver.id} value={driver.id}>
                        {driver.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => setDialogOpen(false)}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button
                onClick={editingPayment ? handleUpdatePayment : handleCreatePayment}
                variant="contained"
                disabled={submitting || !amount.trim() || !motoristaId}
                startIcon={submitting ? <CircularProgress size={20} /> : editingPayment ? <EditIcon /> : <AddIcon />}
              >
                {submitting ? 'Salvando...' : editingPayment ? 'Atualizar' : 'Criar'}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </AppLayout>
    </AuthGuard>
  )
}