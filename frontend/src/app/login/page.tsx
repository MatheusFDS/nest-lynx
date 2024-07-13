'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Paper, Typography } from '@mui/material';
import LoginForm from '../components/login/LoginForm';
import loginTheme from '../theme/loginTheme';
import { ThemeProvider } from '@mui/material/styles';

const LoginPage = () => {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/statistics');
    }
  }, [router]);

  return (
    <ThemeProvider theme={loginTheme}>
      <Box
        sx={{
          height: '100vh',
          width: '100vw',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          backgroundImage: 'url(/background.jpg)', 
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          padding: 10,
        }}
      >
        <Paper
          elevation={6}
          sx={{
            width: '350px',
            padding: 4,
            borderRadius: 7,
            boxShadow: '0 3px 5px 2px rgba(0, 0, 0, .3)',
            backgroundColor: '#S2S2S2'
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
              TMS LYNX
            </Typography>
            <LoginForm />
          </Box>
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

export default LoginPage;
