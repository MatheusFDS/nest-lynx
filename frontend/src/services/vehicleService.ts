import axios from 'axios';

const API_URL = 'http://localhost:4000';

export const fetchVehicles = async (token: string) => {
  const response = await axios.get(`${API_URL}/vehicles`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const addVehicle = async (token: string, vehicle: { model: string; plate: string; driverId: number; categoryId: number }) => {
  const response = await axios.post(`${API_URL}/vehicles`, vehicle, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateVehicle = async (token: string, id: number, vehicle: { model: string; plate: string; driverId: number; categoryId: number }) => {
  const response = await axios.patch(`${API_URL}/vehicles/${id}`, vehicle, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const deleteVehicle = async (token: string, id: number) => {
  const response = await axios.delete(`${API_URL}/vehicles/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
