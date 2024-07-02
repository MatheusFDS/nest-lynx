import { Delivery } from '../types';

const API_URL = 'http://localhost:4000/delivery';

export const fetchDeliveries = async (token: string): Promise<Delivery[]> => {
  const response = await fetch(API_URL, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch deliveries');
  }

  const data = await response.json();

  // Processar os dados para incluir os detalhes dos pedidos diretamente nas entregas
  const deliveries = data.map((delivery: any) => ({
    ...delivery,
    orders: delivery.orders.map((order: any) => ({
      id: order.id,
      numero: order.numero,
      cliente: order.cliente,
      valor: order.valor,
      peso: order.peso,
    })),
  }));

  return deliveries;
};

export const addDelivery = async (token: string, data: Partial<Delivery>): Promise<void> => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to add delivery');
  }
};

export const updateDelivery = async (token: string, id: number, data: Partial<Delivery>): Promise<void> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to update delivery');
  }
};

export const deleteDelivery = async (token: string, id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to delete delivery');
  }
};
