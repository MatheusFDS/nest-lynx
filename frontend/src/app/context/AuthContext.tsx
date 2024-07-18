// src/context/AuthContext.tsx

'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

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
    const storedToken = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    if (storedToken) {
      setToken(storedToken);
      setIsLoggedIn(true);
      setUserRole(JSON.parse(atob(storedToken.split('.')[1])).role);
      const tokenExp = JSON.parse(atob(storedToken.split('.')[1])).exp;
      const currentTime = Math.floor(Date.now() / 1000);
      if (tokenExp - currentTime < 300 && refreshToken) { // Ajuste o tempo para renovar o token antes de expirar
        refreshAccessToken(refreshToken);
      }
    } else {
      setIsLoggedIn(false);
      setUserRole(null);
    }
  }, []);

  const refreshAccessToken = async (refreshToken: string) => {
    try {
      const response = await fetch('http://localhost:4000/auth/refresh-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      const newToken = data.access_token;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUserRole(JSON.parse(atob(newToken.split('.')[1])).role);
    } catch (error) {
      console.error('Failed to refresh token:', error);
    }
  };

  const login = (token: string, refreshToken: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    setToken(token);
    setIsLoggedIn(true);
    setUserRole(JSON.parse(atob(token.split('.')[1])).role);
    router.push('/statistics');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
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
