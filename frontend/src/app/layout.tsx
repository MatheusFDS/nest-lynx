'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { lightTheme, darkTheme } from './theme/theme'; // Importe os temas globais
import loginTheme from './theme/loginTheme'; // Importe o tema específico da página de login
import Toolbar from './components/Toolbar';
import { AuthProvider, useAuth } from './context/AuthContext';
import './globals.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import { usePathname } from 'next/navigation';
import { ThemeProvider, useTheme } from './context/ThemeContext'; // Importe seu ThemeProvider customizado

interface LayoutProps {
  children: ReactNode;
}

const LayoutContent = ({ children }: LayoutProps) => {
  const { isLoggedIn } = useAuth();

  return (
    <>
      {isLoggedIn && <Toolbar title="My App" />}
      <div id="__next" style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        {children}
      </div>
    </>
  );
};

const Layout = ({ children }: LayoutProps) => {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>My App</title>
      </head>
      <body style={{ margin: 0, height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column' }}>
        <ThemeProvider>
          <AppContent>{children}</AppContent>
        </ThemeProvider>
      </body>
    </html>
  );
};

const AppContent = ({ children }: LayoutProps) => {
  const pathname = usePathname();
  const { isDarkMode } = useTheme();
  const [currentTheme, setCurrentTheme] = useState(lightTheme);

  useEffect(() => {
    const isLoginPage = pathname === '/login';
    if (isLoginPage) {
      setCurrentTheme(loginTheme);
    } else {
      setCurrentTheme(isDarkMode ? darkTheme : lightTheme);
    }
  }, [pathname, isDarkMode]);

  return (
    <MuiThemeProvider theme={currentTheme}>
      <CssBaseline />
      <AuthProvider>
        <LayoutContent>{children}</LayoutContent>
      </AuthProvider>
    </MuiThemeProvider>
  );
};

export default Layout;
