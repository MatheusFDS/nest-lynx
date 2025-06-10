// src/context/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { apiClient, usersService } from '../../services/api/client'; // ✅ Novo API Client
import type { User } from '../../types';

// ========================================
// INTERFACES
// ========================================

interface DecodedToken {
  email: string;
  sub: string;
  role: string;
  tenantId: string | null;
  exp?: number;
  iat?: number;
}

interface AuthContextProps {
  isLoggedIn: boolean;
  userRole: string | null;
  user: User | null;
  token: string | null;
  login: (token: string, refreshToken: string) => Promise<void>;
  logout: () => void;
  refreshUserData: () => Promise<void>;
}

// ========================================
// CONTEXT CREATION
// ========================================

const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

// ========================================
// TOKEN UTILITIES
// ========================================

const decodeToken = (token: string): DecodedToken => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch (error) {
    throw new Error('Token inválido');
  }
};

const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = decodeToken(token);
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp ? decoded.exp < currentTime : false;
  } catch {
    return true;
  }
};

// ========================================
// AUTH PROVIDER
// ========================================

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // ========================================
  // INITIALIZE AUTH STATE
  // ========================================
  
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = apiClient.getToken();
        
        if (storedToken) {
          // Verificar se token está expirado
          if (isTokenExpired(storedToken)) {
            console.log('Token expirado, tentando refresh...');
            
            // Tentar refresh automático via apiClient (ele tem lógica de refresh built-in)
            try {
              // O apiClient vai tentar fazer refresh automaticamente na próxima requisição
              const currentUser = await usersService.getCurrentUser();
              const newToken = apiClient.getToken(); // Pegar o token novo após refresh
              
              if (newToken) {
                const decoded = decodeToken(newToken);
                setToken(newToken);
                setUser(currentUser);
                setUserRole(decoded.role);
              }
            } catch (refreshError) {
              console.error('Falha no refresh automático:', refreshError);
              await logoutAndRedirect();
            }
          } else {
            // Token válido, decodificar para pegar role
            try {
              const decoded = decodeToken(storedToken);
              setToken(storedToken);
              setUserRole(decoded.role);
              
              // Buscar dados completos do usuário
              const currentUser = await usersService.getCurrentUser();
              setUser(currentUser);
            } catch (error) {
              console.error('Erro ao decodificar token ou buscar usuário:', error);
              await logoutAndRedirect();
            }
          }
        }
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error);
        await logoutAndRedirect();
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, [pathname]); // Re-avaliar quando mudar de rota

  // ========================================
  // LOGIN FUNCTION
  // ========================================
  
  const login = async (newToken: string, refreshToken: string): Promise<void> => {
    try {
      // Salvar tokens no apiClient (localStorage)
      apiClient.setTokens(newToken, refreshToken);
      
      // Decodificar token para pegar role
      const decoded = decodeToken(newToken);
      setToken(newToken);
      setUserRole(decoded.role);
      
      // Buscar dados completos do usuário
      const currentUser = await usersService.getCurrentUser();
      setUser(currentUser);
      
      // ✅ REDIRECIONAMENTO BASEADO EM ROLE (mantendo lógica original)
      if (decoded.role === 'superadmin') {
        router.push('/platform');
      } else {
        router.push('/estatisticas'); // Ajustado para rota correta
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      await logoutAndRedirect();
      throw error;
    }
  };

  // ========================================
  // LOGOUT FUNCTIONS
  // ========================================
  
  const logoutAndRedirect = async (): Promise<void> => {
    try {
      apiClient.clearTokens();
      setToken(null);
      setUser(null);
      setUserRole(null);
      
      // Só redirecionar se não estiver já na página de login
      if (pathname !== '/login') {
        router.push('/login');
      }
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      // Mesmo com erro, limpar estado local
      setToken(null);
      setUser(null);
      setUserRole(null);
      if (pathname !== '/login') {
        router.push('/login');
      }
    }
  };
  
  const logout = (): void => {
    logoutAndRedirect();
  };

  // ========================================
  // REFRESH USER DATA
  // ========================================
  
  const refreshUserData = async (): Promise<void> => {
    try {
      if (!token) return;
      
      const currentUser = await usersService.getCurrentUser();
      setUser(currentUser);
      
      // Atualizar role também se o token mudou
      const decoded = decodeToken(token);
      setUserRole(decoded.role);
    } catch (error) {
      console.error('Erro ao atualizar dados do usuário:', error);
      await logoutAndRedirect();
    }
  };

  // ========================================
  // CONTEXT VALUE
  // ========================================
  
  const contextValue: AuthContextProps = {
    isLoggedIn: !!user && !!token,
    userRole,
    user,
    token,
    login,
    logout,
    refreshUserData,
  };

  // ========================================
  // RENDER
  // ========================================
  
  // Não renderizar children até auth ser inicializado
  if (!isInitialized) {
    return null; // Ou um loading spinner
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// ========================================
// HOOK PARA USAR AUTH
// ========================================

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// ========================================
// COMPATIBILITY EXPORTS (para manter compatibilidade)
// ========================================

// Export das funções de token para quem ainda usa diretamente
export const tokenUtils = {
  decodeToken,
  isTokenExpired,
  getToken: () => apiClient.getToken(),
  clearTokens: () => apiClient.clearTokens(),
  setTokens: (token: string, refreshToken: string) => apiClient.setTokens(token, refreshToken),
};

// ========================================
// EXPORT DEFAULT
// ========================================

export default AuthProvider;