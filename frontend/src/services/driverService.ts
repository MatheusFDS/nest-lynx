import axios from 'axios';
import { getApiUrl } from './utils/apiUtils';

const API_URL = getApiUrl();

export const fetchDrivers = async (token: string) => {
  const response = await axios.get(`${API_URL}/drivers`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const addDriver = async (token: string, driver: { name: string, license: string, cpf: string }) => {
  const response = await axios.post(`${API_URL}/drivers`, driver, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const updateDriver = async (token: string, id: number, driver: { name: string, license: string, cpf: string }) => {
  const response = await axios.patch(`${API_URL}/drivers/${id}`, driver, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const deleteDriver = async (token: string, id: number) => {
  const response = await axios.delete(`${API_URL}/drivers/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
