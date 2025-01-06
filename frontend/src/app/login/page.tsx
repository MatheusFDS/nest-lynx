// pages/LoginPage.tsx
'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  ThemeProvider,
  Container,
  Stack,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import loginTheme from '../theme/loginTheme';
import { motion } from 'framer-motion';

// Importando os componentes
import LoginForm from '../components/login/LoginForm';
import MissionVisionValues from '../components/login/MissionVisionValues';
import ContactForm from '../components/login/ContactForm';
import { getApiUrl } from '@/services/utils/apiUtils';

// Definição das variantes de animação
const animationVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0 },
};

const LoginPage: React.FC = () => {
  const router = useRouter();
  const { login } = useAuth();

  // Estado do formulário de login
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
    rememberMe: false,
    error: '',
  });

  // Controle de visibilidade da senha
  const [showPassword, setShowPassword] = useState(false);

  // Estado para loader de envio (login)
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Se já houver um token salvo, redirecionar para a área logada
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/statistics');
    }
  }, [router]);

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    setLoginForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      error: '', // Limpa o erro ao digitar novamente
    }));
  };

  // Mostra/oculta a senha
  const toggleShowPassword = () => setShowPassword((prev) => !prev);

  // Submissão do formulário de login
  const handleLoginSubmit = async (e: React.FormEvent) => {
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
          rememberMe: loginForm.rememberMe,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login falhou');
      }

      const data = await response.json();
      // Realiza login via contexto, salvando tokens
      login(data.access_token, data.refresh_token);

      // Opção de salvar "lembrar-me" em localStorage
      if (loginForm.rememberMe) {
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('token', data.access_token);
      } else {
        localStorage.removeItem('rememberMe');
        localStorage.setItem('token', data.access_token);
      }

      // Redirecionar após login bem-sucedido
      router.push('/statistics');
    } catch (error: any) {
      setLoginForm((prev) => ({
        ...prev,
        error: error.message || 'Credenciais inválidas. Tente novamente.',
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemeProvider theme={loginTheme}>
      {/* Container principal com fundo */}
      <Box
        sx={{
          width: '100vw',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          backgroundColor: 'background.default',
          backgroundImage: 'url(/background.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          p: { xs: 2, md: 4 },
        }}
      >
        <Container maxWidth="md">
          {/* Utilizar Stack para espaçamento */}
          <Stack spacing={20}> {/* Ajuste o valor conforme necessário */}
            {/* 1) Formulário de Login */}
            <motion.div
              initial="show"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              variants={animationVariants}
            >
              <LoginForm
                loginForm={loginForm}
                handleChange={handleLoginChange}
                handleSubmit={handleLoginSubmit}
                showPassword={showPassword}
                toggleShowPassword={toggleShowPassword}
                isLoading={isLoading}
              />
            </motion.div>

            {/* 2) Missão, Visão e Valores */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
              variants={animationVariants}
            >
              <MissionVisionValues />
            </motion.div>

            {/* 3) Formulário de Contato */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.4 }}
              variants={animationVariants}
            >
              <ContactForm />
            </motion.div>
          </Stack>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default LoginPage;
