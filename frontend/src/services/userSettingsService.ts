// services/userSettingsService.ts
import axios from 'axios';

const API_URL = 'http://localhost:4000/user-settings'; // Ajuste a URL conforme necessário

export const getUserSettings = async (token: string) => {
  const response = await axios.get(API_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const updateUserSettings = async (token: string, settings: any) => {
  const response = await axios.put(API_URL, { settings }, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
