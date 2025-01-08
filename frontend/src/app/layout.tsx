'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from './components/Toolbar';
import { AuthProvider, useAuth } from './context/AuthContext';
import './globals.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import { usePathname } from 'next/navigation';
import { ThemeProvider } from './context/ThemeContext'; // Importe seu ThemeProvider customizado
import { UserSettingsProvider, useUserSettings } from './context/UserSettingsContext'; // Importe o UserSettingsProvider
import { darkTheme, lightTheme } from './theme/theme';
import loginTheme from './theme/loginTheme';
import { LoadingProvider, useLoading } from './context/LoadingContext'; // Importe o LoadingProvider
import { MessageProvider } from './context/MessageContext'; // Importe o novo contexto
import LinearDeterminate from './components/LinearDeterminate'; // Importe o componente LinearDeterminate

interface LayoutProps {
  children: ReactNode;
}

const LayoutContent = ({ children }: LayoutProps) => {
  const { isLoggedIn } = useAuth();
  const { isLoading } = useLoading(); // Use the loading context

  return (
    <>
      {isLoggedIn && <Toolbar title="GERA ROTA" />}
      {isLoading && <LinearDeterminate />} {/* Display the progress bar when loading */}
      <div id="__next" style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        {children}
      </div>
    </>
  );
};

const Layout = ({ children }: LayoutProps) => {
  return (
    <html lang="pt-br">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Gera Rota</title>
      </head>
      <body style={{ margin: 0,  display: 'flex', flexDirection: 'column' }}>
        <AuthProvider>
          <UserSettingsProvider>
            <LoadingProvider>
              <MessageProvider> {/* Adicione o MessageProvider aqui */}
                <ThemeProvider>
                  <AppContent>{children}</AppContent>
                </ThemeProvider>
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
  const [currentTheme, setCurrentTheme] = useState(lightTheme);

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 500); // Simulate loading time
    return () => clearTimeout(timeout);
  }, [pathname, setLoading]);

  useEffect(() => {
    const isLoginPage = pathname === '/login';
    if (isLoginPage) {
      setCurrentTheme(loginTheme);
    } else {
      setCurrentTheme(settings?.theme === 'dark' ? darkTheme : lightTheme);
    }
  }, [pathname, settings]);

  return (
    <ThemeProvider>
      <CssBaseline />
      <LayoutContent>{children}</LayoutContent>
    </ThemeProvider>
  );
};

export default Layout;
