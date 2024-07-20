import axios from 'axios';
import { getApiUrl } from './utils/apiUtils';

const API_URL = `${getApiUrl()}/user-settings`;

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
