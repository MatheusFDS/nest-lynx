// app/layout.tsx
'use client';

import React, { ReactNode, useEffect } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { usePathname } from 'next/navigation';

// Contexts
import { AuthProvider, useAuth } from './context/AuthContext';
import { UserSettingsProvider, useUserSettings } from './context/UserSettingsContext';
import { ThemeProvider as CustomThemeProvider, useTheme } from './context/ThemeContext';
import { LoadingProvider, useLoading } from './context/LoadingContext';
import { MessageProvider } from './context/MessageContext';

// Components
import OriginalToolbar, { APP_BAR_HEIGHT } from './components/Toolbar';
import LinearDeterminate from './components/LinearDeterminate';

// Styles & Theme
import './globals.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import { getTheme } from './theme/theme'; // ✅ Tema unificado

// ========================================
// LAYOUT CONTENT
// ========================================

const LayoutContent = ({ children }: { children: ReactNode }) => {
  const { isLoggedIn } = useAuth();
  const { isLoading } = useLoading();
  const { isDarkMode } = useTheme(); // ✅ CORREÇÃO: Usar o hook do contexto
  
  // ✅ CORREÇÃO: Aplicar tema baseado na configuração do usuário
  const currentTheme = getTheme(isDarkMode ? 'dark' : 'light');
  const toolbarHeight = isLoggedIn ? `${APP_BAR_HEIGHT}px` : '0px';

  return (
    <MuiThemeProvider theme={currentTheme}>
      <CssBaseline />
      
      {/* Toolbar (apenas se logado) */}
      {isLoggedIn && <OriginalToolbar title="GERA ROTA" />}
      
      {/* Loading Bar */}
      {isLoading && <LinearDeterminate />}
      
      {/* Main Content */}
      <main
        style={{
          paddingTop: toolbarHeight,
          height: `calc(100vh - ${toolbarHeight})`,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          overflow: 'auto',
        }}
      >
        {children}
      </main>
    </MuiThemeProvider>
  );
};

// ========================================
// LOADING HANDLER
// ========================================

const LoadingHandler = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const { setLoading } = useLoading();

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 150);
    return () => clearTimeout(timeout);
  }, [pathname, setLoading]);

  return <>{children}</>;
};

// ========================================
// MAIN LAYOUT
// ========================================

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <html lang="pt-br">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Gera Rota</title>
      </head>
      <body style={{ 
        margin: 0, 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh' 
      }}>
        <AuthProvider>
          <UserSettingsProvider>
            <LoadingProvider>
              <MessageProvider>
                <CustomThemeProvider>
                  <LoadingHandler>
                    <LayoutContent>
                      {children}
                    </LayoutContent>
                  </LoadingHandler>
                </CustomThemeProvider>
              </MessageProvider>
            </LoadingProvider>
          </UserSettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
};

export default Layout;