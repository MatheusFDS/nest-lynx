'use client'
import { useEffect, useState } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  LocalShipping as DeliveryIcon,
  Assignment as OrdersIcon,
  People as DriversIcon,
  Payment as PaymentsIcon,
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'
import type { Statistics } from '../types/api'
import AppLayout from '../components/layout/AppLayout'
import AuthGuard from '../components/guards/AuthGuard'

interface StatCard {
  title: string
  value: number | string
  icon: React.ReactNode
  color: string
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true)
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        
        const stats = await api.getStatistics(
          startOfMonth.toISOString().split('T')[0],
          endOfMonth.toISOString().split('T')[0]
        )
        setStatistics(stats)
      } catch (err) {
        console.error('Erro ao carregar estatísticas:', err)
        setError('Erro ao carregar estatísticas do dashboard')
      } finally {
        setLoading(false)
      }
    }

    fetchStatistics()
  }, [])

  const getStatCards = (): StatCard[] => {
    if (!statistics) return []

    return [
      {
        title: 'Pedidos Pendentes',
        value: statistics.ordersPending || 0,
        icon: <OrdersIcon sx={{ fontSize: 40 }} />,
        color: '#ff9800'
      },
      {
        title: 'Pedidos em Rota',
        value: statistics.ordersInRoute || 0,
        icon: <DeliveryIcon sx={{ fontSize: 40 }} />,
        color: '#2196f3'
      },
      {
        title: 'Pedidos Finalizados',
        value: statistics.ordersFinalized || 0,
        icon: <OrdersIcon sx={{ fontSize: 40 }} />,
        color: '#4caf50'
      },
      {
        title: 'Entregas em Rota',
        value: statistics.deliveriesInRoute || 0,
        icon: <DeliveryIcon sx={{ fontSize: 40 }} />,
        color: '#9c27b0'
      },
      {
        title: 'Entregas Finalizadas',
        value: statistics.deliveriesFinalized || 0,
        icon: <DeliveryIcon sx={{ fontSize: 40 }} />,
        color: '#4caf50'
      },
      {
        title: 'Fretes a Pagar',
        value: statistics.freightsToPay || 0,
        icon: <PaymentsIcon sx={{ fontSize: 40 }} />,
        color: '#f44336'
      },
    ]
  }

  if (loading) {
    return (
      <AppLayout>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="400px"
        >
          <CircularProgress size={60} />
        </Box>
      </AppLayout>
    )
  }

  return (
    <AuthGuard>
      <AppLayout>
        <Box sx={{ flexGrow: 1 }}>
          {/* Header */}
          <Box mb={4}>
            <Typography variant="h4" component="h1" gutterBottom>
              Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Bem-vindo, {user?.name}! Aqui está o resumo do sistema.
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Statistics Cards */}
          <Grid container spacing={3} mb={4}>
            {getStatCards().map((card, index) => (
              <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
                <Card 
                  sx={{ 
                    height: '100%',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4
                    }
                  }}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      <Box 
                        sx={{ 
                          color: card.color,
                          mr: 2
                        }}
                      >
                        {card.icon}
                      </Box>
                    </Box>
                    <Typography variant="h4" component="div" gutterBottom>
                      {card.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {card.title}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Quick Actions */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Ações Rápidas
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Use o menu lateral para navegar pelas funcionalidades do sistema:
                  </Typography>
                  <Box mt={2}>
                    <Typography variant="body2">
                      • <strong>Pedidos:</strong> Gerenciar e acompanhar pedidos
                    </Typography>
                    <Typography variant="body2">
                      • <strong>Entregas:</strong> Criar e gerenciar roteiros
                    </Typography>
                    <Typography variant="body2">
                      • <strong>Motoristas:</strong> Cadastro e gestão da equipe
                    </Typography>
                    <Typography variant="body2">
                      • <strong>Pagamentos:</strong> Controle financeiro
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Informações do Sistema
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Status da sua conta:
                  </Typography>
                  <Box mt={2}>
                    <Typography variant="body2">
                      • <strong>Usuário:</strong> {user?.name}
                    </Typography>
                    <Typography variant="body2">
                      • <strong>Email:</strong> {user?.email}
                    </Typography>
                    <Typography variant="body2">
                      • <strong>Perfil:</strong> {user?.role}
                    </Typography>
                    <Typography variant="body2">
                      • <strong>Tenant:</strong> {user?.tenantId}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </AppLayout>
    </AuthGuard>
  )
}