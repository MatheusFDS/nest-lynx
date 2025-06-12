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
  DirectionsCar as CarIcon,
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'
import type { Vehicle, Driver, Category, CreateVehicleDto, UpdateVehicleDto } from '../types/api'
import AppLayout from '../components/layout/AppLayout'
import AuthGuard from '../components/guards/AuthGuard'

export default function VeiculosPage() {
  const { user } = useAuth()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
  const [submitting, setSubmitting] = useState(false)
  
  const [model, setModel] = useState('')
  const [plate, setPlate] = useState('')
  const [driverId, setDriverId] = useState('')
  const [categoryId, setCategoryId] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [vehiclesData, driversData, categoriesData] = await Promise.all([
        api.getVehicles(),
        api.getDrivers(),
        api.getCategories()
      ])
      
      setVehicles(vehiclesData)
      setDrivers(driversData)
      setCategories(categoriesData)
      
    } catch (err) {
      console.error('Erro ao carregar veículos:', err)
      setError('Erro ao carregar dados dos veículos')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateVehicle = async () => {
    if (!model.trim() || !plate.trim() || !driverId || !categoryId) {
      setError('Todos os campos são obrigatórios')
      return
    }

    try {
      setSubmitting(true)
      setError('')

      const vehicleData: CreateVehicleDto = {
        model: model.trim(),
        plate: plate.trim().toUpperCase(),
        driverId,
        categoryId
      }

      await api.createVehicle(vehicleData)
      setSuccess('Veículo criado com sucesso!')
      setDialogOpen(false)
      resetForm()
      loadData()

    } catch (err) {
      console.error('Erro ao criar veículo:', err)
      setError('Erro ao criar veículo')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateVehicle = async () => {
    if (!editingVehicle || !model.trim() || !plate.trim() || !driverId || !categoryId) {
      setError('Todos os campos são obrigatórios')
      return
    }

    try {
      setSubmitting(true)
      setError('')

      const updateData: UpdateVehicleDto = {
        model: model.trim(),
        plate: plate.trim().toUpperCase(),
        driverId,
        categoryId
      }

      await api.updateVehicle(editingVehicle.id, updateData)
      setSuccess('Veículo atualizado com sucesso!')
      setDialogOpen(false)
      resetForm()
      loadData()

    } catch (err) {
      console.error('Erro ao atualizar veículo:', err)
      setError('Erro ao atualizar veículo')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteVehicle = async (vehicleId: string, vehicleModel: string) => {
    if (!confirm(`Tem certeza que deseja excluir o veículo "${vehicleModel}"?`)) return

    try {
      await api.deleteVehicle(vehicleId)
      setSuccess('Veículo excluído com sucesso!')
      loadData()
    } catch (err) {
      console.error('Erro ao excluir veículo:', err)
      setError('Erro ao excluir veículo')
    }
  }

  const openCreateDialog = () => {
    setEditingVehicle(null)
    resetForm()
    setDialogOpen(true)
  }

  const openEditDialog = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle)
    setModel(vehicle.model)
    setPlate(vehicle.plate)
    setDriverId(vehicle.driverId)
    setCategoryId(vehicle.categoryId)
    setDialogOpen(true)
  }

  const resetForm = () => {
    setModel('')
    setPlate('')
    setDriverId('')
    setCategoryId('')
    setEditingVehicle(null)
  }

  const formatPlate = (value: string) => {
    const cleaned = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
    
    if (cleaned.length <= 7) {
      if (cleaned.length >= 4) {
        return cleaned.slice(0, 3) + '-' + cleaned.slice(3)
      }
      return cleaned
    }
    return cleaned.slice(0, 7)
  }

  const handlePlateChange = (value: string) => {
    const formatted = formatPlate(value)
    setPlate(formatted)
  }

  const clearMessages = () => {
    setError('')
    setSuccess('')
  }

  const getDriverName = (driverId: string) => {
    const driver = drivers.find(d => d.id === driverId)
    return driver?.name || 'Driver não encontrado'
  }

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    return category?.name || 'Categoria não encontrada'
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
              Lista de Veículos ({vehicles.length})
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={openCreateDialog}
            >
              Novo Veículo
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
              {vehicles.length === 0 ? (
                <Box textAlign="center" py={4}>
                  <CarIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    Nenhum veículo cadastrado
                  </Typography>
                </Box>
              ) : (
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Veículo</TableCell>
                        <TableCell>Placa</TableCell>
                        <TableCell>Motorista</TableCell>
                        <TableCell>Categoria</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="center">Ações</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {vehicles.map((vehicle) => (
                        <TableRow key={vehicle.id} hover>
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                                <CarIcon />
                              </Avatar>
                              <div>
                                <Typography variant="body2" fontWeight="medium">
                                  {vehicle.model}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  ID: {vehicle.id.slice(0, 8)}...
                                </Typography>
                              </div>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium" fontFamily="monospace">
                              {vehicle.plate}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {getDriverName(vehicle.driverId)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={getCategoryName(vehicle.categoryId)}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label="Ativo"
                              color="success"
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="Editar veículo">
                              <IconButton 
                                size="small" 
                                onClick={() => openEditDialog(vehicle)}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Excluir veículo">
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => handleDeleteVehicle(vehicle.id, vehicle.model)}
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
              {editingVehicle ? 'Editar Veículo' : 'Novo Veículo'}
            </DialogTitle>
            <DialogContent>
              <Stack spacing={3} sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="Modelo do Veículo"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  disabled={submitting}
                  required
                  placeholder="Ex: Ford Transit, Volkswagen Delivery, etc."
                />
                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                  <TextField
                    fullWidth
                    label="Placa"
                    value={plate}
                    onChange={(e) => handlePlateChange(e.target.value)}
                    disabled={submitting}
                    required
                    placeholder="ABC-1234"
                    helperText="Formato: ABC-1234"
                  />
                  <FormControl fullWidth required>
                    <InputLabel>Categoria</InputLabel>
                    <Select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      disabled={submitting}
                    >
                      {categories.map((category) => (
                        <MenuItem key={category.id} value={category.id}>
                          {category.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                <FormControl fullWidth required>
                  <InputLabel>Motorista</InputLabel>
                  <Select
                    value={driverId}
                    onChange={(e) => setDriverId(e.target.value)}
                    disabled={submitting}
                  >
                    {drivers.map((driver) => (
                      <MenuItem key={driver.id} value={driver.id}>
                        {driver.name} (CNH: {driver.license})
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
                onClick={editingVehicle ? handleUpdateVehicle : handleCreateVehicle}
                variant="contained"
                disabled={submitting || !model.trim() || !plate.trim() || !driverId || !categoryId}
                startIcon={submitting ? <CircularProgress size={20} /> : editingVehicle ? <EditIcon /> : <AddIcon />}
              >
                {submitting ? 'Salvando...' : editingVehicle ? 'Atualizar' : 'Criar'}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </AppLayout>
    </AuthGuard>
  )
}