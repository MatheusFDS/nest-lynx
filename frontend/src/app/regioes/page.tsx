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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Tooltip,
  Avatar,
  InputAdornment,
  Chip,
  Stack,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Map as MapIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'
import type { Direction, CreateDirectionDto, UpdateDirectionDto } from '../types/api'
import AppLayout from '../components/layout/AppLayout'
import AuthGuard from '../components/guards/AuthGuard'

export default function RegioesPage() {
  const { user } = useAuth()
  const [directions, setDirections] = useState<Direction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingDirection, setEditingDirection] = useState<Direction | null>(null)
  const [submitting, setSubmitting] = useState(false)
  
  const [regiao, setRegiao] = useState('')
  const [rangeInicio, setRangeInicio] = useState('')
  const [rangeFim, setRangeFim] = useState('')
  const [valorDirecao, setValorDirecao] = useState('')

  useEffect(() => {
    loadDirections()
  }, [])

  const loadDirections = async () => {
    try {
      setLoading(true)
      setError('')
      const directionsData = await api.getDirections()
      setDirections(directionsData)
    } catch (err) {
      console.error('Erro ao carregar regiões:', err)
      setError('Erro ao carregar regiões')
      setDirections([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateDirection = async () => {
    if (!regiao.trim() || !rangeInicio.trim() || !rangeFim.trim() || !valorDirecao.trim()) {
      setError('Todos os campos são obrigatórios')
      return
    }

    const numericValue = parseFloat(valorDirecao.replace(',', '.'))
    if (isNaN(numericValue) || numericValue < 0) {
      setError('Valor deve ser um número positivo')
      return
    }

    if (rangeInicio.length !== 8 || rangeFim.length !== 8) {
      setError('CEP deve ter 8 dígitos (apenas números)')
      return
    }

    try {
      setSubmitting(true)
      setError('')

      const directionData: CreateDirectionDto = {
        regiao: regiao.trim(),
        rangeInicio: rangeInicio.trim(),
        rangeFim: rangeFim.trim(),
        valorDirecao: numericValue
      }

      await api.createDirection(directionData)
      setSuccess('Região criada com sucesso!')
      setDialogOpen(false)
      resetForm()
      loadDirections()

    } catch (err) {
      console.error('Erro ao criar região:', err)
      setError('Erro ao criar região')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateDirection = async () => {
    if (!editingDirection || !regiao.trim() || !rangeInicio.trim() || !rangeFim.trim() || !valorDirecao.trim()) {
      setError('Todos os campos são obrigatórios')
      return
    }

    const numericValue = parseFloat(valorDirecao.replace(',', '.'))
    if (isNaN(numericValue) || numericValue < 0) {
      setError('Valor deve ser um número positivo')
      return
    }

    try {
      setSubmitting(true)
      setError('')

      const updateData: UpdateDirectionDto = {
        regiao: regiao.trim(),
        rangeInicio: rangeInicio.trim(),
        rangeFim: rangeFim.trim(),
        valorDirecao: numericValue
      }

      await api.updateDirection(editingDirection.id, updateData)
      setSuccess('Região atualizada com sucesso!')
      setDialogOpen(false)
      resetForm()
      loadDirections()

    } catch (err) {
      console.error('Erro ao atualizar região:', err)
      setError('Erro ao atualizar região')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteDirection = async (directionId: string, regionName: string) => {
    if (!confirm(`Tem certeza que deseja excluir a região "${regionName}"?`)) return

    try {
      await api.deleteDirection(directionId)
      setSuccess('Região excluída com sucesso!')
      loadDirections()
    } catch (err) {
      console.error('Erro ao excluir região:', err)
      setError('Erro ao excluir região')
    }
  }

  const openCreateDialog = () => {
    setEditingDirection(null)
    resetForm()
    setDialogOpen(true)
  }

  const openEditDialog = (direction: Direction) => {
    setEditingDirection(direction)
    setRegiao(direction.regiao)
    setRangeInicio(direction.rangeInicio)
    setRangeFim(direction.rangeFim)
    setValorDirecao(direction.valorDirecao.toString())
    setDialogOpen(true)
  }

  const resetForm = () => {
    setRegiao('')
    setRangeInicio('')
    setRangeFim('')
    setValorDirecao('')
    setEditingDirection(null)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatCEP = (cep: string) => {
    return cep.replace(/(\d{5})(\d{3})/, '$1-$2')
  }

  const handleCEPChange = (value: string, setter: (value: string) => void) => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length <= 8) {
      setter(cleaned)
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
              Lista de Regiões ({directions.length})
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={openCreateDialog}
              size="large"
            >
              Nova Região
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
              {directions.length === 0 ? (
                <Box textAlign="center" py={4}>
                  <MapIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    Nenhuma região cadastrada
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={openCreateDialog}
                    sx={{ mt: 2 }}
                  >
                    Criar Primeira Região
                  </Button>
                </Box>
              ) : (
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Região</TableCell>
                        <TableCell>Faixa de CEP</TableCell>
                        <TableCell>Valor Direcionamento</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="center">Ações</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {directions.map((direction) => (
                        <TableRow key={direction.id} hover>
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 32, height: 32 }}>
                                <LocationIcon fontSize="small" />
                              </Avatar>
                              <div>
                                <Typography variant="body2" fontWeight="medium">
                                  {direction.regiao}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  ID: {direction.id.slice(0, 8)}...
                                </Typography>
                              </div>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontFamily="monospace">
                              {formatCEP(direction.rangeInicio)} - {formatCEP(direction.rangeFim)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {formatCurrency(direction.valorDirecao)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label="Ativo"
                              color="success"
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="Editar região">
                              <IconButton 
                                size="small" 
                                onClick={() => openEditDialog(direction)}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Excluir região">
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => handleDeleteDirection(direction.id, direction.regiao)}
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
              {editingDirection ? 'Editar Região' : 'Nova Região'}
            </DialogTitle>
            <DialogContent>
              <Stack spacing={3} sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="Nome da Região"
                  value={regiao}
                  onChange={(e) => setRegiao(e.target.value)}
                  disabled={submitting}
                  required
                  placeholder="Ex: Centro, Zona Sul, Região Metropolitana"
                  autoFocus
                />
                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                  <TextField
                    fullWidth
                    label="CEP Inicial"
                    value={formatCEP(rangeInicio)}
                    onChange={(e) => handleCEPChange(e.target.value, setRangeInicio)}
                    disabled={submitting}
                    required
                    placeholder="01000-000"
                    helperText="CEP inicial da faixa"
                  />
                  <TextField
                    fullWidth
                    label="CEP Final"
                    value={formatCEP(rangeFim)}
                    onChange={(e) => handleCEPChange(e.target.value, setRangeFim)}
                    disabled={submitting}
                    required
                    placeholder="01999-999"
                    helperText="CEP final da faixa"
                  />
                </Box>
                <TextField
                  fullWidth
                  label="Valor de Direcionamento"
                  value={valorDirecao}
                  onChange={(e) => setValorDirecao(e.target.value)}
                  disabled={submitting}
                  required
                  type="number"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                  }}
                  placeholder="0.00"
                  helperText="Valor adicional para cálculo de frete nesta região"
                />
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
                onClick={editingDirection ? handleUpdateDirection : handleCreateDirection}
                variant="contained"
                disabled={submitting || !regiao.trim() || !rangeInicio.trim() || !rangeFim.trim() || !valorDirecao.trim()}
                startIcon={submitting ? <CircularProgress size={20} /> : editingDirection ? <EditIcon /> : <AddIcon />}
              >
                {submitting ? 'Salvando...' : editingDirection ? 'Atualizar' : 'Criar'}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </AppLayout>
    </AuthGuard>
  )
}