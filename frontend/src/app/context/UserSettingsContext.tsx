// src/context/UserSettingsContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '../../services/api/client';
import { useAuth } from './AuthContext';

// ========================================
// INTERFACES
// ========================================

interface UserSettings {
  theme?: 'light' | 'dark';
  language?: string;
  notifications?: boolean;
  defaultRowsPerPage?: number;
  timezone?: string;
  [key: string]: any; // Permitir outras configurações futuras
}

interface UserSettingsContextProps {
  settings: UserSettings | null;
  isLoading: boolean;
  saveSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
}

// ========================================
// DEFAULT SETTINGS
// ========================================

const defaultSettings: UserSettings = {
  theme: 'light',
  language: 'pt-BR',
  notifications: true,
  defaultRowsPerPage: 12,
  timezone: 'America/Sao_Paulo',
};

// ========================================
// CONTEXT CREATION
// ========================================

const UserSettingsContext = createContext<UserSettingsContextProps | undefined>(undefined);

// ========================================
// USER SETTINGS PROVIDER
// ========================================

export const UserSettingsProvider = ({ children }: { children: ReactNode }) => {
  const { isLoggedIn, token } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(defaultSettings);
  const [isLoading, setIsLoading] = useState(false);

  // ========================================
  // LOAD SETTINGS FROM API
  // ========================================
  
  const loadSettings = async (): Promise<void> => {
    if (!isLoggedIn || !token) {
      // Se não estiver logado, usar configurações padrão
      setSettings(defaultSettings);
      return;
    }

    try {
      setIsLoading(true);
      
      // ✅ USANDO NOVO API CLIENT
      const response = await apiClient.get<{ settings: UserSettings }>('/users/me/settings');
      
      // Mesclar com configurações padrão para garantir que todos os campos existam
      const mergedSettings = { ...defaultSettings, ...response.settings };
      setSettings(mergedSettings);
      
    } catch (error) {
      console.error('Erro ao carregar configurações do usuário:', error);
      
      // Em caso de erro, usar configurações padrão
      setSettings(defaultSettings);
      
      // Se for erro 404, significa que o usuário não tem settings ainda
      // Isso é normal para novos usuários
      if ((error as any)?.status !== 404) {
        console.warn('Usando configurações padrão devido ao erro');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ========================================
  // SAVE SETTINGS TO API
  // ========================================
  
  const saveSettings = async (newSettings: Partial<UserSettings>): Promise<void> => {
    if (!isLoggedIn || !token) {
      console.warn('Tentativa de salvar configurações sem estar logado');
      return;
    }

    try {
      setIsLoading(true);
      
      // Mesclar configurações atuais com as novas
      const updatedSettings = { ...settings, ...newSettings };
      
      // ✅ USANDO NOVO API CLIENT
      const response = await apiClient.patch<{ settings: UserSettings }>('/users/me/settings', {
        settings: updatedSettings
      });
      
      // Atualizar estado local
      setSettings(response.settings);
      
    } catch (error) {
      console.error('Erro ao salvar configurações do usuário:', error);
      throw error; // Re-throw para que o componente possa mostrar erro
    } finally {
      setIsLoading(false);
    }
  };

  // ========================================
  // RESET SETTINGS TO DEFAULT
  // ========================================
  
  const resetSettings = async (): Promise<void> => {
    try {
      await saveSettings(defaultSettings);
    } catch (error) {
      console.error('Erro ao resetar configurações:', error);
      throw error;
    }
  };

  // ========================================
  // EFFECTS
  // ========================================
  
  // Carregar configurações quando o usuário fizer login
  useEffect(() => {
    loadSettings();
  }, [isLoggedIn, token]);

  // ========================================
  // CONTEXT VALUE
  // ========================================
  
  const contextValue: UserSettingsContextProps = {
    settings,
    isLoading,
    saveSettings,
    resetSettings,
  };

  // ========================================
  // RENDER
  // ========================================
  
  return (
    <UserSettingsContext.Provider value={contextValue}>
      {children}
    </UserSettingsContext.Provider>
  );
};

// ========================================
// HOOK PARA USAR USER SETTINGS
// ========================================

export const useUserSettings = (): UserSettingsContextProps => {
  const context = useContext(UserSettingsContext);
  if (!context) {
    throw new Error('useUserSettings must be used within a UserSettingsProvider');
  }
  return context;
};

// ========================================
// EXPORT DEFAULT
// ========================================

export default UserSettingsProvider;