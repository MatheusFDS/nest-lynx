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
        bgcolor="#fafafa"
      >
        <CircularProgress size={40} />
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
        backgroundColor: '#fafafa',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Container maxWidth="xs">
        <Card
          elevation={2}
          sx={{
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'white',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            {/* Logo e Título */}
            <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
              <DeliveryIcon sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
              <Typography variant="h5" component="h1" fontWeight="600" color="text.primary">
                Delivery System
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                textAlign="center"
                mt={0.5}
              >
                Acesse sua conta
              </Typography>
            </Box>

            {/* Formulário */}
            <Box component="form" onSubmit={handleSubmit}>
              {error && (
                <Alert severity="error" sx={{ mb: 2, fontSize: '0.875rem' }}>
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
                size="medium"
                sx={{ mb: 1.5 }}
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
                size="medium"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        disabled={isSubmitting}
                        size="small"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 3 }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="medium"
                disabled={!isFormValid() || isSubmitting}
                sx={{
                  py: 1.2,
                  fontSize: '1rem',
                  fontWeight: '500',
                  borderRadius: 1.5,
                  textTransform: 'none',
                  mb: 2,
                }}
              >
                {isSubmitting ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  'Entrar'
                )}
              </Button>
            </Box>

            {/* Link para recuperar senha */}
            <Box textAlign="center">
              <Button
                variant="text"
                size="small"
                disabled={isSubmitting}
                sx={{ 
                  textTransform: 'none',
                  fontSize: '0.875rem',
                  color: 'text.secondary'
                }}
              >
                Esqueceu sua senha?
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}