'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Container,
  IconButton,
  InputAdornment,
  Divider,
} from '@mui/material'
import {
  Visibility,
  VisibilityOff,
  LocalShipping as DeliveryIcon,
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { login, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, isLoading, router])

  // Validação simples de email
  const isEmailValid = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Validação do formulário
  const isFormValid = () => {
    return email.trim() !== '' && password.trim() !== '' && isEmailValid(email)
  }

  // Envio do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isFormValid()) {
      setError('Por favor, preencha todos os campos corretamente.')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const success = await login(email.trim(), password)
      
      if (success) {
        router.push('/dashboard')
      } else {
        setError('Email ou senha incorretos. Tente novamente.')
      }
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente mais tarde.')
      console.error('Erro no login:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Mostrar loading inicial
  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        bgcolor="background.default"
      >
        <CircularProgress size={60} />
      </Box>
    )
  }

  // Se já autenticado, não mostrar tela de login
  if (isAuthenticated) {
    return null
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'background.default',
        backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <Card
          elevation={24}
          sx={{
            borderRadius: 4,
            overflow: 'hidden',
            backdropFilter: 'blur(10px)',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
          }}
        >
          <CardContent sx={{ p: 6 }}>
            {/* Logo e Título */}
            <Box display="flex" alignItems="center" justifyContent="center" mb={3}>
              <DeliveryIcon sx={{ fontSize: 48, color: 'primary.main', mr: 2 }} />
              <Typography variant="h4" component="h1" fontWeight="bold">
                Delivery System
              </Typography>
            </Box>

            <Typography
              variant="h6"
              color="text.secondary"
              textAlign="center"
              mb={4}
            >
              Acesse sua conta para continuar
            </Typography>

            <Divider sx={{ mb: 4 }} />

            {/* Formulário */}
            <Box component="form" onSubmit={handleSubmit}>
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={email !== '' && !isEmailValid(email)}
                helperText={
                  email !== '' && !isEmailValid(email)
                    ? 'Digite um email válido'
                    : ''
                }
                margin="normal"
                required
                autoFocus
                autoComplete="email"
                disabled={isSubmitting}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Senha"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                required
                autoComplete="current-password"
                disabled={isSubmitting}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        disabled={isSubmitting}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 4 }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={!isFormValid() || isSubmitting}
                sx={{
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  borderRadius: 2,
                  textTransform: 'none',
                }}
              >
                {isSubmitting ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Entrar'
                )}
              </Button>
            </Box>

            {/* Informações adicionais */}
            <Box mt={4} textAlign="center">
              <Typography variant="body2" color="text.secondary">
                Esqueceu sua senha?{' '}
                <Button
                  variant="text"
                  size="small"
                  disabled={isSubmitting}
                  sx={{ textTransform: 'none' }}
                >
                  Recuperar senha
                </Button>
              </Typography>
            </Box>

            {/* Demo credentials para desenvolvimento */}
            {process.env.NODE_ENV === 'development' && (
              <Box mt={3} p={2} bgcolor="grey.100" borderRadius={2}>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  <strong>Demo:</strong><br />
                  Admin: admin@sistema.com / 123456<br />
                  Motorista: motorista@sistema.com / 123456
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}