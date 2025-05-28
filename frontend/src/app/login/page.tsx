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
import { useAuth } from '../context/AuthContext'; // Importa o hook useAuth
import loginTheme from '../theme/loginTheme';
import { motion } from 'framer-motion';

// Importando os componentes
import LoginForm from '../components/login/LoginForm';
import MissionVisionValues from '../components/login/MissionVisionValues';
import ContactForm from '../components/login/ContactForm';
import { getApiUrl } from '../../services/utils/apiUtils';

// Definição das variantes de animação
const animationVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0 },
};

const LoginPage: React.FC = () => {
  const router = useRouter();
  // Obtém login, isLoggedIn e userRole do AuthContext
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

  // Estado para loader de envio (login)
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Se o usuário já está logado (informação vinda do AuthContext), redirecione
    if (isLoggedIn && userRole) {
      if (userRole === 'superadmin') {
        router.push('/platform'); // Rota para o dashboard do superadmin
      } else {
        router.push('/statistics'); // Rota padrão para outros usuários
      }
    }
    // Se não estiver logado, o usuário permanece na página de login.
  }, [isLoggedIn, userRole, router]);

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
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login falhou');
      }

      const data = await response.json();
      
      // A função login do AuthContext agora cuida de salvar tokens, decodificar,
      // definir o estado do usuário (incluindo userRole) e redirecionar.
      login(data.access_token, data.refresh_token);

      // Lógica de "lembrar-me" (opcional, pode ser gerenciada de outras formas)
      if (loginForm.rememberMe) {
        localStorage.setItem('rememberMeEmail', loginForm.email); // Salva o email se "lembrar-me" estiver ativo
      } else {
        localStorage.removeItem('rememberMeEmail');
      }

      // O redirecionamento agora é feito dentro da função login do AuthContext.

    } catch (error: any) {
      setLoginForm((prev) => ({
        ...prev,
        error: error.message || 'Credenciais inválidas. Tente novamente.',
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Efeito para carregar o e-mail se "lembrar-me" estiver ativo
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
          minHeight: '100vh', // Garante que o box ocupe a altura toda
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start', // Pode ajustar para 'center' se preferir o conteúdo mais centralizado verticalmente
          backgroundColor: 'background.default',
          backgroundImage: 'url(/background.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          p: { xs: 2, md: 4 },
          overflowY: 'auto', // Permite scroll se o conteúdo for maior que a tela
        }}
      >
        <Container maxWidth="md" sx={{ mt: {xs: 2, md: 4}, mb: {xs:2, md:4} }}> {/* Adiciona margem no topo e embaixo */}
          <Stack spacing={{ xs: 8, md: 12 }}> {/* Ajuste o espaçamento responsivo */}
            <motion.div
              initial="hidden" // Alterado para hidden para animar na entrada
              animate="visible"  // Alterado para animate para controle da animação
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

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
              variants={animationVariants}
            >
              <MissionVisionValues />
            </motion.div>

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