// app/layout.tsx
'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import OriginalToolbar, { APP_BAR_HEIGHT } from './components/Toolbar'; // Importar APP_BAR_HEIGHT
import { AuthProvider, useAuth } from './context/AuthContext';
import './globals.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import { usePathname } from 'next/navigation';
import { ThemeProvider as CustomThemeProvider } from './context/ThemeContext';
import { UserSettingsProvider, useUserSettings } from './context/UserSettingsContext';
import { darkTheme, lightTheme } from './theme/theme';
import loginTheme from './theme/loginTheme';
import { LoadingProvider, useLoading } from './context/LoadingContext';
import { MessageProvider } from './context/MessageContext';
import LinearDeterminate from './components/LinearDeterminate';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import MessageBanner from './components/MessageBanner'; // Importar o MessageBanner

interface LayoutProps {
  children: ReactNode;
}

const LayoutContent = ({ children }: LayoutProps) => {
  const { isLoggedIn } = useAuth();
  const { isLoading } = useLoading();
  
  const toolbarHeightPx = `${APP_BAR_HEIGHT}px`;

  return (
    <>
      {isLoggedIn && <OriginalToolbar title="GERA ROTA" />}
      {isLoading && <LinearDeterminate />}
      <MessageBannerWrapper /> {/* Componente para renderizar o banner de mensagens */}
      <main
        style={{
          paddingTop: isLoggedIn ? toolbarHeightPx : '0px',
          height: `calc(100vh - ${isLoggedIn ? toolbarHeightPx : '0px'})`,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          overflow: 'auto',
          transition: 'padding-top 0.3s ease-in-out', // Suaviza a transição do padding
        }}
      >
        {children}
      </main>
    </>
  );
};

// Componente wrapper para o MessageBanner para poder usar o hook useMessage
const MessageBannerWrapper = () => {
  // Se o MessageContext já renderiza o MessageBanner internamente, este wrapper pode não ser necessário aqui,
  // mas se MessageBanner precisa ser colocado explicitamente na árvore e usar o contexto, esta é uma forma.
  // No seu MessageContext, você já renderiza o MessageBanner, então este wrapper aqui é redundante.
  // O MessageBanner já será posicionado corretamente devido ao seu estilo 'fixed' e 'top' ajustado.
  return null; // O MessageBanner é renderizado dentro do MessageProvider
};


const Layout = ({ children }: LayoutProps) => {
  return (
    <html lang="pt-br">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Gera Rota</title>
      </head>
      <body style={{ margin: 0, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AuthProvider>
          <UserSettingsProvider>
            <LoadingProvider>
              <MessageProvider> {/* MessageBanner é renderizado dentro deste provider */}
                <CustomThemeProvider>
                  <AppContent>{children}</AppContent>
                </CustomThemeProvider>
              </MessageProvider>
            </LoadingProvider>
          </UserSettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
};

const AppContent = ({ children }: LayoutProps) => {
  const pathname = usePathname();
  const { settings } = useUserSettings();
  const { setLoading } = useLoading();
  const [currentMuiTheme, setCurrentMuiTheme] = useState(lightTheme);

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 250); 
    return () => clearTimeout(timeout);
  }, [pathname, setLoading]);

  useEffect(() => {
    const isLoginPage = pathname === '/login';
    if (isLoginPage) {
      setCurrentMuiTheme(loginTheme);
    } else {
      setCurrentMuiTheme(settings?.theme === 'dark' ? darkTheme : lightTheme);
    }
  }, [pathname, settings]);

  return (
    <MuiThemeProvider theme={currentMuiTheme}>
      <CssBaseline />
      {/*
        O MessageBanner é renderizado pelo MessageProvider.
        Para o posicionamento correto do MessageBanner (abaixo da Toolbar),
        o ajuste deve ser feito no próprio MessageBanner.tsx, como discutimos,
        setando seu 'top' para APP_BAR_HEIGHT.
      */}
      <LayoutContent>{children}</LayoutContent>
    </MuiThemeProvider>
  );
};

export default Layout;