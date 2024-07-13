'use client';

import React, { ReactNode } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from './context/ThemeContext';
import Toolbar from './components/Toolbar';
import { AuthProvider, useAuth } from './context/AuthContext';
import './globals.css';

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
