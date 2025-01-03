import React, { useState } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';
import { useAuth } from '../../context/AuthContext';

import { getApiUrl } from '../../../services/utils/apiUtils';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const response = await fetch(getApiUrl() + '/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Resposta de Erro:', errorData);
        throw new Error('Falha ao fazer login');
      }

      const data = await response.json();
      const token = data.access_token;
      const refreshToken = data.refresh_token;

      login(token, refreshToken);
    } catch (error) {
      console.error('Erro de Login:', error);
      setError('Falha ao fazer login. Verifique suas credenciais e tente novamente.');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
      <TextField
        label="E-mail de acesso"
        variant="outlined"
        fullWidth
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        margin="normal"
      />
      <TextField
        label="Senha"
        type="password"
        variant="outlined"
        fullWidth
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        margin="normal"
      />
      {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
      <Button
        type="submit"
        fullWidth
        variant="contained"
        color="primary"
        sx={{ mt: 3, mb: 2 }}
      >
        ENTRAR
      </Button>
      <Typography variant="body2" color="textSecondary" align="center">
        Esqueceu a senha?
      </Typography>
    </Box>
  );
};

export default LoginForm;
