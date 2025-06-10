// src/app/login/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  FormControlLabel,
  Checkbox,
  IconButton,
  InputAdornment,
  Alert,
  CircularProgress,
  Avatar,
  Fade,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Login as LoginIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../../services/api/client';

// ========================================
// TYPES
// ========================================

interface LoginForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

// ========================================
// MAIN COMPONENT
// ========================================

const LoginPage: React.FC = () => {
  const router = useRouter();
  const { login, isLoggedIn, userRole } = useAuth();

  // ========================================
  // STATES
  // ========================================
  
  const [formData, setFormData] = useState<LoginForm>({
    email: '',
    password: '',
    rememberMe: false,
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // ========================================
  // EFFECTS
  // ========================================
  
  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn && userRole) {
      const redirectPath = userRole === 'superadmin' ? '/plataforma' : '/estatisticas';
      router.push(redirectPath);
    }
  }, [isLoggedIn, userRole, router]);

  // Load remembered email
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberMeEmail');
    if (rememberedEmail) {
      setFormData(prev => ({ 
        ...prev, 
        email: rememberedEmail, 
        rememberMe: true 
      }));
    }
  }, []);

  // ========================================
  // HANDLERS
  // ========================================
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setError('');
  };

  const toggleShowPassword = () => {
    setShowPassword(prev => !prev);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await apiClient.post('/auth/login', {
        email: formData.email,
        password: formData.password,
      }, {
        skipAuth: true,
      });

      await login(response.access_token, response.refresh_token);

      if (formData.rememberMe) {
        localStorage.setItem('rememberMeEmail', formData.email);
      } else {
        localStorage.removeItem('rememberMeEmail');
      }

    } catch (err: any) {
      setError(err.message || 'Credenciais inválidas. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // ========================================
  // RENDER
  // ========================================
  
  return (
    <Box
      sx={{
        width: '100vw',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Container maxWidth="xs">
        <Fade in timeout={600}>
          <Paper
            elevation={2}
            sx={{
              p: 4,
              textAlign: 'center',
            }}
          >
            {/* Header Section */}
            <Box sx={{ mb: 4 }}>
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  bgcolor: 'primary.main',
                  margin: '0 auto 16px',
                }}
              >
                <LoginIcon />
              </Avatar>
              
              <Typography 
                variant="h4" 
                component="h1" 
                gutterBottom
                color="text.primary"
                sx={{ fontWeight: 500 }}
              >
                Login
              </Typography>
              
              <Typography 
                variant="body1" 
                color="text.secondary"
              >
                Acesse sua conta para continuar
              </Typography>
            </Box>

            {/* Login Form */}
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                name="email"
                label="E-mail"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isLoading}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                name="password"
                label="Senha"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isLoading}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={toggleShowPassword}
                        disabled={isLoading}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                }
                label="Lembrar-me"
                sx={{ mb: 2, alignSelf: 'flex-start' }}
              />

              {/* Error Alert */}
              {error && (
                <Alert 
                  severity="error" 
                  sx={{ mb: 2, textAlign: 'left' }}
                >
                  {error}
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading}
                startIcon={
                  isLoading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <LoginIcon />
                  )
                }
                sx={{
                  py: 1.5,
                  mb: 3,
                }}
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>

            {/* Footer */}
            <Box 
              sx={{ 
                pt: 2, 
                borderTop: 1, 
                borderColor: 'divider',
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Gera Rota © {new Date().getFullYear()}
              </Typography>
            </Box>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};

export default LoginPage;