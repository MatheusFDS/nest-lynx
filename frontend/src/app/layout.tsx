'use client';

import React, { ReactNode } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme/theme';
import Toolbar from './components/Toolbar';
import { AuthProvider, useAuth } from './context/AuthContext';

interface LayoutProps {
  children: ReactNode;
}

const LayoutContent = ({ children }: LayoutProps) => {
  const { isLoggedIn } = useAuth();

  return (
    <>
      {isLoggedIn && <Toolbar title="My App" />}
      {children}
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
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AuthProvider>
            <LayoutContent>{children}</LayoutContent>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default Layout;
