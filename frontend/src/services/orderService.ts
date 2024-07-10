import axios from 'axios';
import { Order } from '../types';

const API_URL = 'http://localhost:4000';

export const fetchOrders = async (token: string): Promise<Order[]> => {
  const response = await axios.get(`${API_URL}/orders`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const uploadOrders = async (token: string, orders: Order[]): Promise<void> => {
  await axios.post(`${API_URL}/orders/upload`, orders, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const fetchUserSettings = async (token: string): Promise<any> => {
  const response = await axios.get(`${API_URL}/user-settings`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const updateUserSettings = async (token: string, settings: any): Promise<void> => {
  await axios.put(`${API_URL}/user-settings`, { settings }, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};