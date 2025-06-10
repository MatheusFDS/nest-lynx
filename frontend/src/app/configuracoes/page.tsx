'use client'
import { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  Grid,
  TextField,
  Button,
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
  Alert,
  CircularProgress,
  Divider,
  Tooltip,
  InputAdornment,
  FormControlLabel,
  Switch,
} from '@mui/material'
import {
  Settings as SettingsIcon,
  Business as BusinessIcon,
  Category as CategoryIcon,
  Map as MapIcon,
  People as PeopleIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'
import type { 
  Tenant, 
  UpdateTenantDto, 
  Category, 
  CreateCategoryDto, 
  UpdateCategoryDto 
} from '../types/api'
import AppLayout from '../components/layout/AppLayout'
import AuthGuard from '../components/guards/AuthGuard'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`config-tabpanel-${index}`}
      aria-labelledby={`config-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

export default function ConfiguracoesPage() {
  const { user } = useAuth()
  const [currentTab, setCurrentTab] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Tenant Configuration
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [tenantForm, setTenantForm] = useState<UpdateTenantDto>({})

  // Categories
  const [categories, setCategories] = useState<Category[]>([])
  const [categoryDialog, setCategoryDialog] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [categoryName, setCategoryName] = useState('')
  const [categoryValue, setCategoryValue] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [tenantData, categoriesData] = await Promise.all([
        api.getTenant(),
        api.getCategories()
      ])
      
      setTenant(tenantData)
      setTenantForm({
        name: tenantData.name,
        address: tenantData.address,
        minValue: tenantData.minValue,
        minPeso: tenantData.minPeso,
        minOrders: tenantData.minOrders,
        minDeliveryPercentage: tenantData.minDeliveryPercentage,
      })
      setCategories(categoriesData)
      
    } catch (err) {
      console.error('Erro ao carregar configurações:', err)
      setError('Erro ao carregar configurações')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveTenant = async () => {
    if (!tenant || !tenantForm.name?.trim()) {
      setError('Nome da empresa é obrigatório')
      return
    }

    try {
      setSaving(true)
      setError('')

      await api.updateTenant(tenant.id, tenantForm)
      setSuccess('Configurações da empresa atualizadas com sucesso!')
      loadData()

    } catch (err) {
      console.error('Erro ao salvar configurações:', err)
      setError('Erro ao salvar configurações da empresa')
    } finally {
      setSaving(false)
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
      setSaving(true)
      setError('')

      const categoryData: CreateCategoryDto = {
        name: categoryName.trim(),
        valor: numericValue
      }

      await api.createCategory(categoryData)
      setSuccess('Categoria criada com sucesso!')
      setCategoryDialog(false)
      resetCategoryForm()
      loadData()

    } catch (err) {
      console.error('Erro ao criar categoria:', err)
      setError('Erro ao criar categoria')
    } finally {
      setSaving(false)
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
      setSaving(true)
      setError('')

      const updateData: UpdateCategoryDto = {
        name: categoryName.trim(),
        valor: numericValue
      }

      await api.updateCategory(editingCategory.id, updateData)
      setSuccess('Categoria atualizada com sucesso!')
      setCategoryDialog(false)
      resetCategoryForm()
      loadData()

    } catch (err) {
      console.error('Erro ao atualizar categoria:', err)
      setError('Erro ao atualizar categoria')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    if (!confirm(`Tem certeza que deseja excluir a categoria "${categoryName}"?`)) return

    try {
      await api.deleteCategory(categoryId)
      setSuccess('Categoria excluída com sucesso!')
      loadData()
    } catch (err) {
      console.error('Erro ao excluir categoria:', err)
      setError('Erro ao excluir categoria')
    }
  }

  const openCreateCategoryDialog = () => {
    setEditingCategory(null)
    resetCategoryForm()
    setCategoryDialog(true)
  }

  const openEditCategoryDialog = (category: Category) => {
    setEditingCategory(category)
    setCategoryName(category.name)
    setCategoryValue(category.valor.toString())
    setCategoryDialog(true)
  }

  const resetCategoryForm = () => {
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
          {/* Header */}
          <Box mb={4}>
            <Typography variant="h4" component="h1" gutterBottom>
              Configurações
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Gerencie configurações gerais do sistema
            </Typography>
          </Box>

          {/* Messages */}
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

          {/* Configuration Tabs */}
          <Card>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={currentTab} 
                onChange={(e, newValue) => setCurrentTab(newValue)}
                aria-label="configurações tabs"
              >
                <Tab 
                  icon={<BusinessIcon />} 
                  label="Empresa" 
                  iconPosition="start"
                />
                <Tab 
                  icon={<CategoryIcon />} 
                  label="Categorias" 
                  iconPosition="start"
                />
                <Tab 
                  icon={<SettingsIcon />} 
                  label="Sistema" 
                  iconPosition="start"
                />
              </Tabs>
            </Box>

            {/* Tab 1: Empresa */}
            <TabPanel value={currentTab} index={0}>
              <Typography variant="h6" gutterBottom>
                <BusinessIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Informações da Empresa
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Nome da Empresa"
                    value={tenantForm.name || ''}
                    onChange={(e) => setTenantForm(prev => ({ ...prev, name: e.target.value }))}
                    disabled={saving}
                    required
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Endereço"
                    value={tenantForm.address || ''}
                    onChange={(e) => setTenantForm(prev => ({ ...prev, address: e.target.value }))}
                    disabled={saving}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Regras para Liberação Automática de Roteiros
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Configure os limites para que roteiros sejam liberados automaticamente
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Valor Mínimo"
                    type="number"
                    value={tenantForm.minValue || ''}
                    onChange={(e) => setTenantForm(prev => ({ 
                      ...prev, 
                      minValue: e.target.value ? parseFloat(e.target.value) : undefined 
                    }))}
                    disabled={saving}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                    }}
                    helperText="Valor mínimo da carga"
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Peso Mínimo"
                    type="number"
                    value={tenantForm.minPeso || ''}
                    onChange={(e) => setTenantForm(prev => ({ 
                      ...prev, 
                      minPeso: e.target.value ? parseFloat(e.target.value) : undefined 
                    }))}
                    disabled={saving}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">kg</InputAdornment>,
                    }}
                    helperText="Peso mínimo da carga"
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Pedidos Mínimos"
                    type="number"
                    value={tenantForm.minOrders || ''}
                    onChange={(e) => setTenantForm(prev => ({ 
                      ...prev, 
                      minOrders: e.target.value ? parseInt(e.target.value) : undefined 
                    }))}
                    disabled={saving}
                    helperText="Quantidade mínima de pedidos"
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="% Máximo de Frete"
                    type="number"
                    value={tenantForm.minDeliveryPercentage || ''}
                    onChange={(e) => setTenantForm(prev => ({ 
                      ...prev, 
                      minDeliveryPercentage: e.target.value ? parseFloat(e.target.value) : undefined 
                    }))}
                    disabled={saving}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                    helperText="Percentual máximo do frete sobre valor"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box display="flex" gap={2} mt={2}>
                    <Button
                      variant="contained"
                      startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                      onClick={handleSaveTenant}
                      disabled={saving || !tenantForm.name?.trim()}
                    >
                      {saving ? 'Salvando...' : 'Salvar Configurações'}
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<RefreshIcon />}
                      onClick={loadData}
                      disabled={saving}
                    >
                      Recarregar
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </TabPanel>

            {/* Tab 2: Categorias */}
            <TabPanel value={currentTab} index={1}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <div>
                  <Typography variant="h6" gutterBottom>
                    <CategoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Categorias de Veículos
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Gerencie as categorias e valores de frete por tipo de veículo
                  </Typography>
                </div>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={openCreateCategoryDialog}
                >
                  Nova Categoria
                </Button>
              </Box>

              {categories.length === 0 ? (
                <Box textAlign="center" py={4}>
                  <CategoryIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    Nenhuma categoria cadastrada
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mt={1}>
                    Crie categorias para organizar os tipos de veículos
                  </Typography>
                </Box>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Nome da Categoria</TableCell>
                        <TableCell>Valor do Frete</TableCell>
                        <TableCell align="center">Ações</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {categories.map((category) => (
                        <TableRow key={category.id} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {category.name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {formatCurrency(category.valor)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="Editar categoria">
                              <IconButton 
                                size="small" 
                                onClick={() => openEditCategoryDialog(category)}
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
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </TabPanel>

            {/* Tab 3: Sistema */}
            <TabPanel value={currentTab} index={2}>
              <Typography variant="h6" gutterBottom>
                <SettingsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Configurações do Sistema
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Informações da Conta
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Usuário Atual
                          </Typography>
                          <Typography variant="body1">
                            {user?.name} ({user?.email})
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Perfil de Acesso
                          </Typography>
                          <Typography variant="body1">
                            {user?.role}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Tenant ID
                          </Typography>
                          <Typography variant="body1" fontFamily="monospace">
                            {user?.tenantId}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Empresa Atual
                          </Typography>
                          <Typography variant="body1">
                            {tenant?.name || 'Carregando...'}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Configurações Avançadas
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Configurações avançadas do sistema serão implementadas em versões futuras
                      </Typography>
                      
                      <Box display="flex" flexDirection="column" gap={2}>
                        <FormControlLabel
                          control={<Switch disabled />}
                          label="Notificações por email"
                        />
                        <FormControlLabel
                          control={<Switch disabled />}
                          label="Backup automático"
                        />
                        <FormControlLabel
                          control={<Switch disabled />}
                          label="Modo debug"
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>
          </Card>

          {/* Create/Edit Category Dialog */}
          <Dialog
            open={categoryDialog}
            onClose={() => !saving && setCategoryDialog(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>
              {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Nome da Categoria"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    disabled={saving}
                    required
                    placeholder="Ex: Van, Caminhão, Moto"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Valor do Frete"
                    value={categoryValue}
                    onChange={(e) => setCategoryValue(e.target.value)}
                    disabled={saving}
                    required
                    InputProps={{
                      startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                    }}
                    placeholder="0,00"
                    helperText="Valor base para cálculo de frete desta categoria"
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => setCategoryDialog(false)}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button
                onClick={editingCategory ? handleUpdateCategory : handleCreateCategory}
                variant="contained"
                disabled={saving || !categoryName.trim() || !categoryValue.trim()}
                startIcon={saving ? <CircularProgress size={20} /> : editingCategory ? <EditIcon /> : <AddIcon />}
              >
                {saving ? 'Salvando...' : editingCategory ? 'Atualizar' : 'Criar'}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </AppLayout>
    </AuthGuard>
  )
}