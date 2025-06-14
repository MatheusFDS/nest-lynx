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
  Alert,
  CircularProgress,
  Fab,
  Tooltip,
} from '@mui/material'
import {
  Add as AddIcon,
  Upload as UploadIcon,
  Visibility as ViewIcon,
  History as HistoryIcon,
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'
import type { Order } from '../types/api'
import AppLayout from '../components/layout/AppLayout'
import AuthGuard from '../components/guards/AuthGuard'
import RoleGuard from '../components/guards/RoleGuard'

export default function PedidosPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Upload Dialog
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  // Load orders
  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const ordersData = await api.getOrders()
      setOrders(ordersData)
    } catch (err) {
      console.error('Erro ao carregar pedidos:', err)
      setError('Erro ao carregar pedidos')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const statusColors: { [key: string]: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' } = {
      'Sem rota': 'warning',
      'Em rota, aguardando liberação': 'info',
      'Em rota': 'primary',
      'Em entrega': 'secondary',
      'Entregue': 'success',
      'Não entregue': 'error',
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setUploadFile(file)
        setError('')
      } else {
        setError('Por favor, selecione um arquivo CSV válido')
        setUploadFile(null)
      }
    }
  }

  const handleUpload = async () => {
    if (!uploadFile) {
      setError('Selecione um arquivo para upload')
      return
    }

    try {
      setUploading(true)
      setError('')
      
      // Read CSV file
      const text = await uploadFile.text()
      const lines = text.split('\n')
      const headers = lines[0].split(',').map(h => h.trim())
      
      const ordersToUpload = []
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (line) {
          const values = line.split(',').map(v => v.trim())
          const order: any = {}
          
          headers.forEach((header, index) => {
            order[header] = values[index] || ''
          })
          
          ordersToUpload.push(order)
        }
      }

      if (ordersToUpload.length === 0) {
        setError('Nenhum pedido encontrado no arquivo')
        return
      }

      await api.uploadOrders(ordersToUpload)
      setSuccess(`${ordersToUpload.length} pedidos importados com sucesso!`)
      setUploadDialogOpen(false)
      setUploadFile(null)
      loadOrders()
      
    } catch (err) {
      console.error('Erro no upload:', err)
      setError('Erro ao importar pedidos. Verifique o formato do arquivo.')
    } finally {
      setUploading(false)
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
    <AuthGuard requiredRoles={['admin', 'user']}>
      <AppLayout>
        <Box sx={{ flexGrow: 1 }}>
          {/* Header */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <div>
              <Typography variant="h4" component="h1" gutterBottom>
                Pedidos
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Gerencie todos os pedidos do sistema
              </Typography>
            </div>
            
            <RoleGuard allowedRoles={['admin']}>
              <Button
                variant="contained"
                startIcon={<UploadIcon />}
                onClick={() => setUploadDialogOpen(true)}
              >
                Importar CSV
              </Button>
            </RoleGuard>
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

          {/* Orders Table */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Lista de Pedidos ({orders.length})
              </Typography>
              
              {orders.length === 0 ? (
                <Box textAlign="center" py={4}>
                  <Typography variant="body1" color="text.secondary">
                    Nenhum pedido encontrado
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mt={1}>
                    Importe pedidos usando o botão "Importar CSV"
                  </Typography>
                </Box>
              ) : (
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Número</TableCell>
                        <TableCell>Data</TableCell>
                        <TableCell>Cliente</TableCell>
                        <TableCell>Cidade</TableCell>
                        <TableCell>Valor</TableCell>
                        <TableCell>Peso (kg)</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="center">Ações</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {order.numero}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {formatDate(order.data)}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {order.cliente}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {order.cidade} - {order.uf}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {formatCurrency(order.valor)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {order.peso}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={order.status.replace('_', ' ')}
                              color={getStatusColor(order.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="Ver detalhes">
                              <IconButton size="small">
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Ver histórico">
                              <IconButton size="small">
                                <HistoryIcon />
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

          {/* Upload Dialog */}
          <Dialog
            open={uploadDialogOpen}
            onClose={() => !uploading && setUploadDialogOpen(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>
              <Box display="flex" alignItems="center" gap={1}>
                <CloudUploadIcon />
                Importar Pedidos via CSV
              </Box>
            </DialogTitle>
            <DialogContent>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Selecione um arquivo CSV com os dados dos pedidos. O arquivo deve conter as colunas:
                numero, data, cliente, endereco, cidade, uf, cep, telefone, email, valor, peso
              </Typography>
              
              <TextField
                type="file"
                fullWidth
                inputProps={{ accept: '.csv' }}
                onChange={handleFileChange}
                disabled={uploading}
                helperText={uploadFile ? `Arquivo selecionado: ${uploadFile.name}` : 'Nenhum arquivo selecionado'}
              />
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => setUploadDialogOpen(false)}
                disabled={uploading}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleUpload}
                variant="contained"
                disabled={!uploadFile || uploading}
                startIcon={uploading ? <CircularProgress size={20} /> : <UploadIcon />}
              >
                {uploading ? 'Importando...' : 'Importar'}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </AppLayout>
    </AuthGuard>
  )
}