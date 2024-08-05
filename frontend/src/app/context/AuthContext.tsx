// src/context/AuthContext.tsx

'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  getStoredToken,
  getStoredRefreshToken,
  decodeToken,
  refreshAccessToken,
  storeTokens,
  clearTokens
} from '../../services/authService';

interface AuthContextProps {
  isLoggedIn: boolean;
  userRole: string | null;
  token: string | null;
  login: (token: string, refreshToken: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedToken = getStoredToken();
    const refreshToken = getStoredRefreshToken();
    if (storedToken) {
      setToken(storedToken);
      setIsLoggedIn(true);
      setUserRole(decodeToken(storedToken).role);
      const tokenExp = decodeToken(storedToken).exp;
      const currentTime = Math.floor(Date.now() / 1000);
      if (tokenExp - currentTime < 300 && refreshToken) { // Ajuste o tempo para renovar o token antes de expirar
        handleRefreshToken(refreshToken);
      }
    } else {
      setIsLoggedIn(false);
      setUserRole(null);
    }
  }, []);

  const handleRefreshToken = async (refreshToken: string) => {
    try {
      const newToken = await refreshAccessToken(refreshToken);
      setToken(newToken);
      setUserRole(decodeToken(newToken).role);
    } catch (error) {
      console.error('Failed to refresh token:', error);
    }
  };

  const login = (token: string, refreshToken: string) => {
    storeTokens(token, refreshToken);
    setToken(token);
    setIsLoggedIn(true);
    setUserRole(decodeToken(token).role);
    router.push('/statistics');
  };

  const logout = () => {
    clearTokens();
    setToken(null);
    setIsLoggedIn(false);
    setUserRole(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, userRole, token, login, logout }}>
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
