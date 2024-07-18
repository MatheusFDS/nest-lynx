// src/layout/Layout.tsx
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

interface LayoutProps {
  children: ReactNode;
}

const LayoutContent = ({ children }: LayoutProps) => {
  const { isLoggedIn } = useAuth();

  return (
    <>
      {isLoggedIn && <Toolbar title="MATHEX FLOW" />}
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
        <title>My App</title>
      </head>
      <body style={{ margin: 0, height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column' }}>
        <AuthProvider>
          <UserSettingsProvider>
            <ThemeProvider>
              <AppContent>{children}</AppContent>
            </ThemeProvider>
          </UserSettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
};

const AppContent = ({ children }: LayoutProps) => {
  const pathname = usePathname();
  const { settings } = useUserSettings();
  const [currentTheme, setCurrentTheme] = useState(lightTheme);

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
