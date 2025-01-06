// components/LoginForm.tsx
'use client';

import React from 'react';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  FormControlLabel,
  Checkbox,
  IconButton,
  InputAdornment,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

interface LoginFormProps {
  loginForm: {
    email: string;
    password: string;
    rememberMe: boolean;
    error: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  showPassword: boolean;
  toggleShowPassword: () => void;
  isLoading: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({
  loginForm,
  handleChange,
  handleSubmit,
  showPassword,
  toggleShowPassword,
  isLoading,
}) => (
  <Paper
    elevation={3}
    sx={{
      p: { xs: 3, md: 4 },
      borderRadius: 2,
      backgroundColor: 'background.paper',
      maxWidth: 400, // Mantém o formulário mais fino
      margin: '0 auto', // Centraliza o Paper
    }}
  >
    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }} align="center">
      GERA ROTA
    </Typography>
    <Typography variant="body1" align="center" sx={{ mb: 3 }}>
      Faça login para continuar
    </Typography>

    <form onSubmit={handleSubmit}>
      <TextField
        name="email"
        label="E-mail de acesso"
        variant="outlined"
        fullWidth
        required
        value={loginForm.email}
        onChange={handleChange}
        margin="normal"
        type="email"
        autoComplete="email"
      />
      <TextField
        name="password"
        label="Senha"
        type={showPassword ? 'text' : 'password'}
        variant="outlined"
        fullWidth
        required
        value={loginForm.password}
        onChange={handleChange}
        margin="normal"
        autoComplete="current-password"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={toggleShowPassword}
                edge="end"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      {loginForm.error && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {loginForm.error}
        </Alert>
      )}

      <FormControlLabel
        control={
          <Checkbox
            checked={loginForm.rememberMe}
            onChange={handleChange}
            name="rememberMe"
            color="primary"
          />
        }
        label="Lembrar-me"
        sx={{ mt: 1 }}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        color="primary"
        sx={{ mt: 3, mb: 2 }}
        disabled={isLoading}
      >
        {isLoading ? <CircularProgress size={24} color="inherit" /> : 'ENTRAR'}
      </Button>

      <Typography variant="body2" color="text.secondary" align="center">
        <Link href="#" variant="body2" underline="hover">
          Esqueceu a senha?
        </Link>
      </Typography>
    </form>
  </Paper>
);

export default LoginForm;
