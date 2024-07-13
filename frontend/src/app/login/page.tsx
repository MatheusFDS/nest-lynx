// src/app/login/page.tsx
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Box, Paper, Typography } from '@mui/material';
import LoginForm from '../components/login/LoginForm';

const LoginPage = () => {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/statistics');
    }
  }, [router]);

  return (
    <Container
      component="main"
      maxWidth="xs"
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: 'url(/background.jpg)', // Adicione sua imagem de fundo
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <Paper
        elevation={6}
        sx={{
          padding: 4,
          borderRadius: 2,
          boxShadow: '0 3px 5px 2px rgba(0, 0, 0, .3)',
          backgroundColor: 'rgba(255, 255, 255, 0.9)', // Fundo semi-transparente
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
            Nest Lynx
          </Typography>
          <LoginForm />
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage;
