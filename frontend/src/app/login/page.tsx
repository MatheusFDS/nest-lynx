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
  Avatar, // Import Avatar
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Email from '@mui/icons-material/Email';
import Lock from '@mui/icons-material/Lock';
import LoginIcon from '@mui/icons-material/Login';
// import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import loginTheme from '../theme/loginTheme'; // Importando o tema ajustado
import { motion } from 'framer-motion';
import { getApiUrl } from '../../services/utils/apiUtils';
// createTheme e alpha já estão em loginTheme.ts se você definir lá

const LoginPage: React.FC = () => {
  const router = useRouter();
  const { login, isLoggedIn, userRole } = useAuth();

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
    rememberMe: false,
    error: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsFormVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isLoggedIn && userRole) {
      router.push(userRole === 'superadmin' ? '/platforma' : '/roteiros/criar');
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
        body: JSON.stringify({ email: loginForm.email, password: loginForm.password }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({message: "Erro de comunicação."}));
        throw new Error(errorData.message || 'Login falhou');
      }
      const data = await response.json();
      login(data.access_token, data.refresh_token); // Assumindo que o backend retorna refresh_token também
      if (loginForm.rememberMe) localStorage.setItem('rememberMeEmail', loginForm.email);
      else localStorage.removeItem('rememberMeEmail');
    } catch (error: any) {
      setLoginForm((prev) => ({ ...prev, error: error.message || 'Credenciais inválidas.' }));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberMeEmail');
    if (rememberedEmail) {
      setLoginForm((prev) => ({ ...prev, email: rememberedEmail, rememberMe: true }));
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
          backgroundColor: 'background.default',
          p: 2,
        }}
      >
        <Container maxWidth="xs" sx={{ zIndex: 2 }}>
          <Slide direction="up" in={isFormVisible} timeout={600} easing={{ enter: 'cubic-bezier(0.4, 0, 0.2, 1)' }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <Paper sx={{ p: { xs: 3, sm: 4 } /* borderRadius virá do tema */ }}>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, duration: 0.4 }}>
                    <Avatar // Usando Avatar para o ícone, ele será quadrado devido ao MuiAvatar override no tema
                      sx={{
                        width: 64, height: 64,
                        bgcolor: 'primary.main',
                        margin: '0 auto 16px',
                        color: 'primary.contrastText',
                        // O borderRadius: 0 será aplicado pelo tema no MuiAvatar,
                        // ou remova o override do MuiAvatar no tema se quiser ele circular.
                      }}
                    >
                      <LoginIcon sx={{ fontSize: 32 }} />
                    </Avatar>
                  </motion.div>
                  <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3, duration: 0.5 }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                      Login
                    </Typography>
                    <Typography variant="body1">
                      Acesse sua conta para continuar.
                    </Typography>
                  </motion.div>
                </Box>

                <motion.form onSubmit={handleSubmit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.6 }}>
                  <TextField
                    fullWidth name="email" label="E-mail" type="email"
                    value={loginForm.email} onChange={handleChange} required
                    sx={{ mb: 2 }}
                    InputProps={{ startAdornment: ( <InputAdornment position="start"><Email sx={{color: 'action.active'}} /></InputAdornment> ), }}
                  />
                  <TextField
                    fullWidth name="password" label="Senha" type={showPassword ? 'text' : 'password'}
                    value={loginForm.password} onChange={handleChange} required
                    sx={{ mb: 2 }}
                    InputProps={{
                      startAdornment: ( <InputAdornment position="start"><Lock sx={{color: 'action.active'}} /></InputAdornment> ),
                      endAdornment: ( <InputAdornment position="end"> <IconButton onClick={toggleShowPassword} edge="end"> {showPassword ? <VisibilityOff /> : <Visibility />} </IconButton> </InputAdornment> ),
                    }}
                  />
                  <FormControlLabel
                    control={ <Checkbox name="rememberMe" checked={loginForm.rememberMe} onChange={handleChange} /> }
                    label={ <Typography variant="body2">Lembrar-me</Typography> }
                    sx={{ mb: 2 }}
                  />
                  <Fade in={!!loginForm.error}>
                    <Box sx={{ mb: loginForm.error ? 2 : 0 }}>
                      {loginForm.error && ( <Alert severity="error">{loginForm.error}</Alert> )}
                    </Box>
                  </Fade>
                  <Button
                    type="submit" fullWidth variant="contained" color="primary" disabled={isLoading}
                    startIcon={ isLoading ? <CircularProgress size={20} color="inherit" /> : <LoginIcon /> }
                    sx={{ py: 1.2, fontSize: '1rem', fontWeight: 600, mt: 1 /* borderRadius virá do tema */ }}
                  >
                    {isLoading ? 'Entrando...' : 'Entrar'}
                  </Button>
                </motion.form>
                
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.5 }}>
                  <Box sx={{ textAlign: 'center', mt: 3, pt: 2, borderTop: `1px solid ${loginTheme.palette.divider}` }}>
                    <Typography variant="caption">
                      Gera Rota &copy; {new Date().getFullYear()}
                    </Typography>
                  </Box>
                </motion.div>
              </Paper>
            </motion.div>
          </Slide>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default LoginPage;