'use client'
import { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Divider,
  InputAdornment,
  Stack,
} from '@mui/material'
import {
  Business as BusinessIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'
import type { 
  Tenant, 
  UpdateTenantDto, 
} from '../types/api'
import AppLayout from '../components/layout/AppLayout'
import AuthGuard from '../components/guards/AuthGuard'

export default function EmpresaPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [tenantForm, setTenantForm] = useState<UpdateTenantDto>({})

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const tenantData = await api.getTenant()
      
      setTenant(tenantData)
      setTenantForm({
        name: tenantData.name,
        address: tenantData.address,
        minValue: tenantData.minValue,
        minPeso: tenantData.minPeso,
        minOrders: tenantData.minOrders,
        minDeliveryPercentage: tenantData.minDeliveryPercentage,
      })
      
    } catch (err) {
      console.error('Erro ao carregar dados da empresa:', err)
      setError('Erro ao carregar dados da empresa')
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
          <Box mb={4}>
            <Typography variant="h4" component="h1" gutterBottom>
              Configurações da Empresa
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Gerencie os dados e regras de negócio da sua empresa
            </Typography>
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
              <Typography variant="h6" gutterBottom>
                <BusinessIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Informações da Empresa
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Stack spacing={3}>
                <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                  <TextField
                    fullWidth
                    label="Nome da Empresa"
                    value={tenantForm.name || ''}
                    onChange={(e) => setTenantForm(prev => ({ ...prev, name: e.target.value }))}
                    disabled={saving}
                    required
                  />
                  <TextField
                    fullWidth
                    label="Endereço"
                    value={tenantForm.address || ''}
                    onChange={(e) => setTenantForm(prev => ({ ...prev, address: e.target.value }))}
                    disabled={saving}
                  />
                </Box>

                <Box>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Regras para Liberação Automática de Roteiros
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Configure os limites para que roteiros sejam liberados automaticamente
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' } }}>
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
                </Box>

                <Box>
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
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </AppLayout>
    </AuthGuard>
  )
}