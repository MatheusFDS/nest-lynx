// services/vehiclesService.ts
import axios from 'axios';
import { getApiUrl } from './utils/apiUtils';

const API_URL = `${getApiUrl()}/vehicles`;

export const fetchVehicles = async (token: string) => {
  const response = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const addVehicle = async (token: string, vehicle: { model: string; plate: string; driverId: string; categoryId: string }) => {
  const response = await axios.post(API_URL, vehicle, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateVehicle = async (token: string, id: string, vehicle: { model: string; plate: string; driverId: string; categoryId: string }) => {
  const response = await axios.patch(`${API_URL}/${id}`, vehicle, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const deleteVehicle = async (token: string, id: string) => {
  const response = await axios.delete(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
