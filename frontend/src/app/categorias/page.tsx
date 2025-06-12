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
  Grid,
  Tooltip,
  Avatar,
  InputAdornment,
  Stack, // Importado para substituir o Grid no Dialog
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Category as CategoryIcon,
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'
import type { Category, CreateCategoryDto, UpdateCategoryDto } from '../types/api'
import AppLayout from '../components/layout/AppLayout'
import AuthGuard from '../components/guards/AuthGuard'

export default function CategoriasPage() {
  const { user } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [submitting, setSubmitting] = useState(false)
  
  const [categoryName, setCategoryName] = useState('')
  const [categoryValue, setCategoryValue] = useState('')

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const categoriesData = await api.getCategories()
      setCategories(categoriesData)
    } catch (err) {
      console.error('Erro ao carregar categorias:', err)
      setError('Erro ao carregar categorias')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCategory = async () => {
    if (!categoryName.trim() || !categoryValue.trim()) {
      setError('Nome e valor da categoria são obrigatórios')
      return
    }

    const numericValue = parseFloat(categoryValue.replace(',', '.'))
    if (isNaN(numericValue) || numericValue < 0) {
      setError('Valor deve ser um número positivo')
      return
    }

    try {
      setSubmitting(true)
      setError('')

      const categoryData: CreateCategoryDto = {
        name: categoryName.trim(),
        valor: numericValue
      }

      await api.createCategory(categoryData)
      setSuccess('Categoria criada com sucesso!')
      setDialogOpen(false)
      resetForm()
      loadCategories()

    } catch (err) {
      console.error('Erro ao criar categoria:', err)
      setError('Erro ao criar categoria')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateCategory = async () => {
    if (!editingCategory || !categoryName.trim() || !categoryValue.trim()) {
      setError('Nome e valor da categoria são obrigatórios')
      return
    }

    const numericValue = parseFloat(categoryValue.replace(',', '.'))
    if (isNaN(numericValue) || numericValue < 0) {
      setError('Valor deve ser um número positivo')
      return
    }

    try {
      setSubmitting(true)
      setError('')

      const updateData: UpdateCategoryDto = {
        name: categoryName.trim(),
        valor: numericValue
      }

      await api.updateCategory(editingCategory.id, updateData)
      setSuccess('Categoria atualizada com sucesso!')
      setDialogOpen(false)
      resetForm()
      loadCategories()

    } catch (err) {
      console.error('Erro ao atualizar categoria:', err)
      setError('Erro ao atualizar categoria')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    if (!confirm(`Tem certeza que deseja excluir a categoria "${categoryName}"?`)) return

    try {
      await api.deleteCategory(categoryId)
      setSuccess('Categoria excluída com sucesso!')
      loadCategories()
    } catch (err) {
      console.error('Erro ao excluir categoria:', err)
      setError('Erro ao excluir categoria')
    }
  }

  const openCreateDialog = () => {
    setEditingCategory(null)
    resetForm()
    setDialogOpen(true)
  }

  const openEditDialog = (category: Category) => {
    setEditingCategory(category)
    setCategoryName(category.name)
    setCategoryValue(category.valor.toString())
    setDialogOpen(true)
  }

  const resetForm = () => {
    setCategoryName('')
    setCategoryValue('')
    setEditingCategory(null)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const clearMessages = () => {
    setError('')
    setSuccess('')
  }

  const getTotalValue = () => {
    return categories.reduce((sum, category) => sum + category.valor, 0)
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
              Lista de Categorias ({categories.length})
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={openCreateDialog}
              size="large"
            >
              Nova Categoria
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
              {categories.length === 0 ? (
                <Box textAlign="center" py={4}>
                  <CategoryIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    Nenhuma categoria cadastrada
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={openCreateDialog}
                    sx={{ mt: 2 }}
                  >
                    Criar Primeira Categoria
                  </Button>
                </Box>
              ) : (
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Categoria</TableCell>
                        <TableCell>Valor do Frete</TableCell>
                        <TableCell>% do Total</TableCell>
                        <TableCell align="center">Ações</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {categories.map((category) => {
                        const percentage = getTotalValue() > 0 ? (category.valor / getTotalValue() * 100).toFixed(1) : '0'
                        return (
                          <TableRow key={category.id} hover>
                            <TableCell>
                              <Box display="flex" alignItems="center">
                                <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 32, height: 32 }}>
                                  <CategoryIcon fontSize="small" />
                                </Avatar>
                                <div>
                                  <Typography variant="body2" fontWeight="medium">
                                    {category.name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    ID: {category.id.slice(0, 8)}...
                                  </Typography>
                                </div>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight="medium">
                                {formatCurrency(category.valor)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {percentage}%
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Tooltip title="Editar categoria">
                                <IconButton 
                                  size="small" 
                                  onClick={() => openEditDialog(category)}
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Excluir categoria">
                                <IconButton 
                                  size="small" 
                                  color="error"
                                  onClick={() => handleDeleteCategory(category.id, category.name)}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        )
                      })}
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
              {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
            </DialogTitle>
            <DialogContent>
              <Stack spacing={3} sx={{ mt: 1 }}>
                <TextField
                  fullWidth
                  label="Nome da Categoria"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  disabled={submitting}
                  required
                  placeholder="Ex: Van, Caminhão, Moto, Carreta"
                  autoFocus
                />
                <TextField
                  fullWidth
                  label="Valor do Frete"
                  value={categoryValue}
                  onChange={(e) => setCategoryValue(e.target.value)}
                  disabled={submitting}
                  required
                  type="number"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                  }}
                  placeholder="0.00"
                  helperText="Valor base para cálculo de frete desta categoria"
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
                onClick={editingCategory ? handleUpdateCategory : handleCreateCategory}
                variant="contained"
                disabled={submitting || !categoryName.trim() || !categoryValue.trim()}
                startIcon={submitting ? <CircularProgress size={20} /> : editingCategory ? <EditIcon /> : <AddIcon />}
              >
                {submitting ? 'Salvando...' : editingCategory ? 'Atualizar' : 'Criar'}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </AppLayout>
    </AuthGuard>
  )
}