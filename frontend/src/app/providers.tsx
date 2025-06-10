// src/app/providers.tsx
'use client';

import React, { ReactNode } from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

// Contexts
import { AuthProvider, useAuth } from './context/AuthContext';
import { UserSettingsProvider } from './context/UserSettingsContext';
import { LoadingProvider, useLoading } from './context/LoadingContext';
import { MessageProvider } from './context/MessageContext';
import { AppThemeProvider } from './context/ThemeContext';

// Components
import OriginalToolbar, { APP_BAR_HEIGHT } from './components/Toolbar';
import LinearDeterminate from './components/LinearDeterminate';
import MessageBanner from './components/MessageBanner';

// Componente estilizado para o conteúdo principal
const MainContent = styled('main', {
  shouldForwardProp: (prop) => prop !== 'isLoggedIn',
})<{ isLoggedIn: boolean }>(({ theme, isLoggedIn }) => ({
  flexGrow: 1,
  overflow: 'auto',
  height: `calc(100vh - ${isLoggedIn ? APP_BAR_HEIGHT : 0}px)`,
  paddingTop: isLoggedIn ? `${APP_BAR_HEIGHT}px` : '0px',
  transition: 'all 0.3s ease-in-out',
  display: 'flex',
  flexDirection: 'column',
}));


// A "casca" da aplicação que contém a UI principal
const AppShell = ({ children }: { children: ReactNode }) => {
  const { isLoggedIn } = useAuth();
  const { isLoading } = useLoading();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {isLoggedIn && <OriginalToolbar title="GERA ROTA" />}
      {isLoading && <LinearDeterminate />}
      <MessageBanner />
      <MainContent isLoggedIn={isLoggedIn}>{children}</MainContent>
    </Box>
  );
};

// O componente que organiza todos os providers
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <UserSettingsProvider>
        <LoadingProvider>
          <MessageProvider>
            <AppThemeProvider>
              <AppShell>{children}</AppShell>
            </AppThemeProvider>
          </MessageProvider>
        </LoadingProvider>
      </UserSettingsProvider>
    </AuthProvider>
  );
}