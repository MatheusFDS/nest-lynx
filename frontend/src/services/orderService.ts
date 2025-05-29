import axios from 'axios';
import { Order, OrderHistoryEvent } from '../types';
import { getApiUrl } from './utils/apiUtils';

export const fetchOrders = async (token: string): Promise<Order[]> => {
  const API_URL = getApiUrl() + '/orders';

  const response = await axios.get(API_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const uploadOrders = async (token: string, orders: Order[]): Promise<void> => {
  const API_URL = getApiUrl() + '/orders/upload';

  await axios.post(API_URL, orders, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const fetchUserSettings = async (token: string): Promise<any> => {
  const API_URL = getApiUrl() + '/user-settings';

  const response = await axios.get(API_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const updateUserSettings = async (token: string, settings: any): Promise<void> => {
  const API_URL = getApiUrl() + '/user-settings';

  await axios.put(API_URL, { settings }, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};


export const fetchOrderHistory = async (token: string, orderId: string): Promise<OrderHistoryEvent[]> => {
  // Este endpoint é um EXEMPLO, você precisará criá-lo no seu backend
  const API_URL = `${getApiUrl()}/orders/${orderId}/history`;

  const response = await axios.get(API_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data; // Espera-se que o backend retorne um array de OrderHistoryEvent
};