// src/context/AuthContext.tsx

'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation'; // usePathname pode ser útil
import {
  getStoredToken,
  getStoredRefreshToken,
  decodeToken, // Sua função decodeToken
  refreshAccessToken,
  storeTokens,
  clearTokens
} from '../../services/authService';

interface DecodedToken { // Adicione uma interface para o token decodificado se não existir em authService
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
  token: string | null;
  login: (token: string, refreshToken: string) => void;
  logout: () => void;
  // Adicione o usuário completo se quiser mais detalhes além da role
  // user: DecodedToken | null; 
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  // const [user, setUser] = useState<DecodedToken | null>(null); // Opcional: para guardar todo o payload
  const router = useRouter();
  const pathname = usePathname(); // Para saber a rota atual

  useEffect(() => {
    const storedToken = getStoredToken();
    const refreshToken = getStoredRefreshToken();

    if (storedToken) {
      try {
        const decoded = decodeToken(storedToken) as DecodedToken; // Use sua função decodeToken
        const currentTime = Math.floor(Date.now() / 1000);

        if (decoded.exp && decoded.exp < currentTime) {
          // Token expirado, tentar refresh se tiver refresh token
          if (refreshToken) {
            handleRefreshToken(refreshToken);
          } else {
            // Sem refresh token, deslogar
            console.log('Token expirado, sem refresh token, deslogando.');
            logoutAndRedirect();
          }
        } else {
          // Token válido
          setToken(storedToken);
          setIsLoggedIn(true);
          setUserRole(decoded.role);
          // setUser(decoded); // Opcional
        }
      } catch (error) {
        console.error("Erro ao processar token armazenado:", error);
        logoutAndRedirect(); // Se o token for inválido
      }
    } else {
      setIsLoggedIn(false);
      setUserRole(null);
      setToken(null);
      // setUser(null); // Opcional
    }
  // A dependência de 'pathname' aqui é para reavaliar se o usuário tentar acessar /login logado
  // Mas a lógica de redirecionamento de /login para usuários logados é melhor na própria página de login
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]); // O logoutAndRedirect pode causar loop se router estiver aqui e não houver controle.


  const handleRefreshToken = async (rToken: string) => {
    try {
      const newAccessToken = await refreshAccessToken(rToken);
      const decoded = decodeToken(newAccessToken) as DecodedToken;
      
      storeTokens(newAccessToken, rToken); // Armazena o novo token e o mesmo refresh token
      setToken(newAccessToken);
      setIsLoggedIn(true);
      setUserRole(decoded.role);
      // setUser(decoded); // Opcional
      console.log('Token atualizado com sucesso.');
    } catch (error) {
      console.error('Falha ao atualizar o token:', error);
      logoutAndRedirect(); // Se o refresh token falhar, deslogar
    }
  };

  const login = (newToken: string, newRefreshToken: string) => {
    storeTokens(newToken, newRefreshToken);
    const decoded = decodeToken(newToken) as DecodedToken; // Use sua função decodeToken

    setToken(newToken);
    setIsLoggedIn(true);
    setUserRole(decoded.role);
    // setUser(decoded); // Opcional

    // Redirecionamento baseado na role
    if (decoded.role === 'superadmin') {
      router.push('/platform');
    } else {
      router.push('/statistics'); 
    }
  };

  const logoutAndRedirect = () => {
    clearTokens();
    setToken(null);
    setIsLoggedIn(false);
    setUserRole(null);
    if (pathname !== '/login') {
        router.push('/login');
    }
  };

  const logout = () => {
    logoutAndRedirect();
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, userRole, token, login, logout /*, user*/ }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};