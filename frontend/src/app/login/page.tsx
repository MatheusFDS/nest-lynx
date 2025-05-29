// pages/LoginPage.tsx
'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  ThemeProvider,
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
  Fade,
  Slide,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Login as LoginIcon,
  Person,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import loginTheme from '../theme/loginTheme';
import { motion } from 'framer-motion';
import { getApiUrl } from '../../services/utils/apiUtils';

const LoginPage: React.FC = () => {
  const router = useRouter();
  const { login, isLoggedIn, userRole } = useAuth();

  // Estado do formulário de login
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
    rememberMe: false,
    error: '',
  });

  // Controle de visibilidade da senha
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);

  useEffect(() => {
    // Animação de entrada
    const timer = setTimeout(() => setIsFormVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isLoggedIn && userRole) {
      if (userRole === 'superadmin') {
        router.push('/platform');
      } else {
        router.push('/statistics');
      }
    }
  }, [isLoggedIn, userRole, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setLoginForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      error: '',
    }));
  };

  const toggleShowPassword = () => setShowPassword((prev) => !prev);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginForm((prev) => ({ ...prev, error: '' }));

    try {
      const response = await fetch(getApiUrl() + '/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginForm.email,
          password: loginForm.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login falhou');
      }

      const data = await response.json();
      login(data.access_token, data.refresh_token);

      if (loginForm.rememberMe) {
        localStorage.setItem('rememberMeEmail', loginForm.email);
      } else {
        localStorage.removeItem('rememberMeEmail');
      }
    } catch (error: any) {
      setLoginForm((prev) => ({
        ...prev,
        error: error.message || 'Credenciais inválidas. Tente novamente.',
      }));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberMeEmail');
    if (rememberedEmail) {
      setLoginForm((prev) => ({
        ...prev,
        email: rememberedEmail,
        rememberMe: true,
      }));
    }
  }, []);

  return (
    <ThemeProvider theme={loginTheme}>
      <Box
        sx={{
          width: '100vw',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(circle at 20% 20%, rgba(0, 212, 255, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 60% 40%, rgba(0, 255, 136, 0.05) 0%, transparent 50%)
            `,
            zIndex: 1,
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.02"%3E%3Ccircle cx="30" cy="30" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            zIndex: 1,
          },
        }}
      >
        <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 2 }}>
          <Slide
            direction="up"
            in={isFormVisible}
            timeout={800}
            easing={{ enter: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 4, md: 6 },
                  borderRadius: '24px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  boxShadow: `
                    0 25px 50px -12px rgba(0, 0, 0, 0.6),
                    0 0 0 1px rgba(255, 255, 255, 0.05),
                    inset 0 1px 0 rgba(255, 255, 255, 0.1)
                  `,
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: 'linear-gradient(90deg, transparent, #00d4ff, #8b5cf6, transparent)',
                  },
                }}
              >
                {/* Header */}
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '20px',
                        background: 'linear-gradient(135deg, #00d4ff 0%, #8b5cf6 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px',
                        boxShadow: '0 0 30px rgba(0, 212, 255, 0.3)',
                      }}
                    >
                      <Person sx={{ fontSize: 40, color: 'white' }} />
                    </Box>
                  </motion.div>

                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                  >
                    <Typography
                      variant="h4"
                      sx={{
                        background: 'linear-gradient(135deg, #00d4ff 0%, #8b5cf6 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontWeight: 800,
                        mb: 1,
                        fontSize: { xs: '1.8rem', md: '2.2rem' },
                      }}
                    >
                      Bem-vindo de volta
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: 'text.secondary',
                        fontSize: '1.1rem',
                        opacity: 0.8,
                      }}
                    >
                      Faça login em sua conta para continuar
                    </Typography>
                  </motion.div>
                </Box>

                {/* Formulário */}
                <motion.form
                  onSubmit={handleSubmit}
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                >
                  {/* Campo Email */}
                  <TextField
                    fullWidth
                    name="email"
                    label="E-mail"
                    type="email"
                    value={loginForm.email}
                    onChange={handleChange}
                    required
                    sx={{ mb: 3 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start" sx={{ ml: 1 }}>
                          <Email sx={{ color: 'text.secondary', fontSize: '1.2rem' }} />
                        </InputAdornment>
                      ),
                    }}
                  />

                  {/* Campo Senha */}
                  <TextField
                    fullWidth
                    name="password"
                    label="Senha"
                    type={showPassword ? 'text' : 'password'}
                    value={loginForm.password}
                    onChange={handleChange}
                    required
                    sx={{ mb: 3 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start" sx={{ ml: 1 }}>
                          <Lock sx={{ color: 'text.secondary', fontSize: '1.2rem' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={toggleShowPassword}
                            edge="end"
                            sx={{
                              color: 'text.secondary',
                              '&:hover': { color: 'primary.main' },
                            }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  {/* Lembrar-me */}
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="rememberMe"
                        checked={loginForm.rememberMe}
                        onChange={handleChange}
                        sx={{
                          color: 'text.secondary',
                          '&.Mui-checked': {
                            color: 'primary.main',
                          },
                        }}
                      />
                    }
                    label={
                      <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
                        Lembrar-me
                      </Typography>
                    }
                    sx={{ mb: 3 }}
                  />

                  {/* Mensagem de Erro */}
                  <Fade in={!!loginForm.error}>
                    <Box sx={{ mb: 3 }}>
                      {loginForm.error && (
                        <Alert
                          severity="error"
                          sx={{
                            borderRadius: '12px',
                            backgroundColor: 'rgba(248, 113, 113, 0.1)',
                            border: '1px solid rgba(248, 113, 113, 0.2)',
                            color: '#f87171',
                            '& .MuiAlert-icon': {
                              color: '#f87171',
                            },
                          }}
                        >
                          {loginForm.error}
                        </Alert>
                      )}
                    </Box>
                  </Fade>

                  {/* Botão de Login */}
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
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
                      fontSize: '1rem',
                      fontWeight: 600,
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #00d4ff 0%, #8b5cf6 100%)',
                      border: 'none',
                      color: 'white',
                      boxShadow: '0 4px 15px rgba(0, 212, 255, 0.3)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: '-100%',
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
                        transition: 'left 0.5s ease',
                      },
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(0, 212, 255, 0.4)',
                        background: 'linear-gradient(135deg, #00ff88 0%, #00d4ff 100%)',
                        '&::before': {
                          left: '100%',
                        },
                      },
                      '&:active': {
                        transform: 'translateY(-1px)',
                      },
                      '&:disabled': {
                        background: 'rgba(148, 163, 184, 0.2)',
                        color: 'rgba(248, 250, 252, 0.5)',
                        boxShadow: 'none',
                        transform: 'none',
                      },
                    }}
                  >
                    {isLoading ? 'Entrando...' : 'Entrar'}
                  </Button>
                </motion.form>

                {/* Footer */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                >
                  <Box sx={{ textAlign: 'center', mt: 4, pt: 3, borderTop: '1px solid rgba(148, 163, 184, 0.1)' }}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        fontSize: '0.85rem',
                        opacity: 0.7,
                      }}
                    >
                      Protegido por autenticação avançada
                    </Typography>
                  </Box>
                </motion.div>
              </Paper>
            </motion.div>
          </Slide>
        </Container>

        {/* Partículas flutuantes */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [-20, -100, -20],
              x: [0, 30, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{
              position: 'absolute',
              width: 4 + i * 2,
              height: 4 + i * 2,
              borderRadius: '50%',
              background: i % 2 === 0 ? '#00d4ff' : '#8b5cf6',
              left: `${10 + i * 15}%`,
              top: `${60 + i * 5}%`,
              zIndex: 1,
              filter: 'blur(1px)',
            }}
          />
        ))}
      </Box>
    </ThemeProvider>
  );
};

export default LoginPage;