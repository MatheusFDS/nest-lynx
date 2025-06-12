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
  Avatar,
  Stack,
} from '@mui/material'
import Grid from '@mui/material/Grid'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'
import type { Driver, User, CreateDriverDto, UpdateDriverDto } from '../types/api'
import AppLayout from '../components/layout/AppLayout'
import AuthGuard from '../components/guards/AuthGuard'
import RoleGuard from '../components/guards/RoleGuard'

export default function MotoristasPage() {
  const { user } = useAuth()
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [availableUsers, setAvailableUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null)
  const [submitting, setSubmitting] = useState(false)
  
  const [name, setName] = useState('')
  const [license, setLicense] = useState('')
  const [cpf, setCpf] = useState('')
  const [userId, setUserId] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [driversData, usersData] = await Promise.all([
        api.getDrivers(),
        api.getAvailableUsers()
      ])
      
      setDrivers(driversData)
      setAvailableUsers(usersData)
      
    } catch (err) {
      console.error('Erro ao carregar motoristas:', err)
      setError('Erro ao carregar dados dos motoristas')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateDriver = async () => {
    if (!name.trim() || !license.trim() || !cpf.trim()) {
      setError('Nome, CNH e CPF são obrigatórios')
      return
    }

    try {
      setSubmitting(true)
      setError('')

      const driverData: CreateDriverDto = {
        name: name.trim(),
        license: license.trim(),
        cpf: cpf.trim(),
        userId: userId || undefined
      }

      await api.createDriver(driverData)
      setSuccess('Motorista criado com sucesso!')
      setDialogOpen(false)
      resetForm()
      loadData()

    } catch (err) {
      console.error('Erro ao criar motorista:', err)
      setError('Erro ao criar motorista')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateDriver = async () => {
    if (!editingDriver || !name.trim() || !license.trim() || !cpf.trim()) {
      setError('Nome, CNH e CPF são obrigatórios')
      return
    }

    try {
      setSubmitting(true)
      setError('')

      const updateData: UpdateDriverDto = {
        name: name.trim(),
        license: license.trim(),
        cpf: cpf.trim(),
        userId: userId || undefined
      }

      await api.updateDriver(editingDriver.id, updateData)
      setSuccess('Motorista atualizado com sucesso!')
      setDialogOpen(false)
      resetForm()
      loadData()

    } catch (err) {
      console.error('Erro ao atualizar motorista:', err)
      setError('Erro ao atualizar motorista')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteDriver = async (driverId: string, driverName: string) => {
    if (!confirm(`Tem certeza que deseja excluir o motorista "${driverName}"?`)) return

    try {
      await api.deleteDriver(driverId)
      setSuccess('Motorista excluído com sucesso!')
      loadData()
    } catch (err) {
      console.error('Erro ao excluir motorista:', err)
      setError('Erro ao excluir motorista')
    }
  }

  const openCreateDialog = () => {
    setEditingDriver(null)
    resetForm()
    setDialogOpen(true)
  }

  const openEditDialog = (driver: Driver) => {
    setEditingDriver(driver)
    setName(driver.name)
    setLicense(driver.license)
    setCpf(driver.cpf)
    setUserId(driver.userId || '')
    setDialogOpen(true)
  }

  const resetForm = () => {
    setName('')
    setLicense('')
    setCpf('')
    setUserId('')
    setEditingDriver(null)
  }

  const formatCpf = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  const handleCpfChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length <= 11) {
      setCpf(cleaned)
    }
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
              Lista de Motoristas ({drivers.length})
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={openCreateDialog}
            >
              Novo Motorista
            </Button>
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
              {drivers.length === 0 ? (
                <Box textAlign="center" py={4}>
                  <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    Nenhum motorista cadastrado
                  </Typography>
                </Box>
              ) : (
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Motorista</TableCell>
                        <TableCell>CNH</TableCell>
                        <TableCell>CPF</TableCell>
                        <TableCell>Usuário do Sistema</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="center">Ações</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {drivers.map((driver) => (
                        <TableRow key={driver.id} hover>
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                                {driver.name.charAt(0).toUpperCase()}
                              </Avatar>
                              <div>
                                <Typography variant="body2" fontWeight="medium">
                                  {driver.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  ID: {driver.id.slice(0, 8)}...
                                </Typography>
                              </div>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontFamily="monospace">
                              {driver.license}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontFamily="monospace">
                              {formatCpf(driver.cpf)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {driver.User ? (
                              <Box>
                                <Typography variant="body2" fontWeight="medium">
                                  {driver.User.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {driver.User.email}
                                </Typography>
                              </Box>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                Não vinculado
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={driver.User ? 'Ativo' : 'Inativo'}
                              color={driver.User ? 'success' : 'warning'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="Editar motorista">
                              <IconButton 
                                size="small" 
                                onClick={() => openEditDialog(driver)}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Excluir motorista">
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => handleDeleteDriver(driver.id, driver.name)}
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
              {editingDriver ? 'Editar Motorista' : 'Novo Motorista'}
            </DialogTitle>
            <DialogContent>
              <Stack spacing={3} sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="Nome do Motorista"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={submitting}
                  required
                />
                <TextField
                  fullWidth
                  label="CNH"
                  value={license}
                  onChange={(e) => setLicense(e.target.value)}
                  disabled={submitting}
                  required
                  helperText="Número da Carteira de Habilitação"
                />
                <TextField
                  fullWidth
                  label="CPF"
                  value={formatCpf(cpf)}
                  onChange={(e) => handleCpfChange(e.target.value)}
                  disabled={submitting}
                  required
                  helperText="Apenas números"
                />
                <FormControl fullWidth>
                  <InputLabel>Usuário do Sistema (Opcional)</InputLabel>
                  <Select
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    disabled={submitting}
                  >
                    <MenuItem value="">
                      <em>Nenhum usuário</em>
                    </MenuItem>
                    {availableUsers.map((user) => (
                      <MenuItem key={user.id} value={user.id}>
                        {user.name} ({user.email})
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
                onClick={editingDriver ? handleUpdateDriver : handleCreateDriver}
                variant="contained"
                disabled={submitting || !name.trim() || !license.trim() || !cpf.trim()}
                startIcon={submitting ? <CircularProgress size={20} /> : editingDriver ? <EditIcon /> : <AddIcon />}
              >
                {submitting ? 'Salvando...' : editingDriver ? 'Atualizar' : 'Criar'}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </AppLayout>
    </AuthGuard>
  )
}