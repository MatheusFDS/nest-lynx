// src/context/UserSettingsContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getUserSettings, updateUserSettings } from '../../services/userSettingsService';
import { useAuth } from './AuthContext';

interface UserSettings {
  theme?: string;
  [key: string]: any; // Permitir outras configurações
}

interface UserSettingsContextProps {
  settings: UserSettings | null;
  saveSettings: (newSettings: UserSettings) => void;
}

const UserSettingsContext = createContext<UserSettingsContextProps | undefined>(undefined);

export const UserSettingsProvider = ({ children }: { children: ReactNode }) => {
  const { token } = useAuth(); // Pega o token do AuthContext
  const [settings, setSettings] = useState<UserSettings | null>(null);

  useEffect(() => {
    if (token) {
      const fetchSettings = async () => {
        const userSettings = await getUserSettings(token);
        setSettings(userSettings.settings);
      };
      fetchSettings();
    }
  }, [token]);

  const saveSettings = async (newSettings: UserSettings) => {
    if (token) {
      const updatedSettings = await updateUserSettings(token, newSettings);
      setSettings(updatedSettings.settings);
    }
  };

  return (
    <UserSettingsContext.Provider value={{ settings, saveSettings }}>
      {children}
    </UserSettingsContext.Provider>
  );
};

export const useUserSettings = (): UserSettingsContextProps => {
  const context = useContext(UserSettingsContext);
  if (!context) {
    throw new Error('useUserSettings must be used within a UserSettingsProvider');
  }
  return context;
};
