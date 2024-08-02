import { getApiUrl } from './utils/apiUtils';
import { Delivery } from '../types';

const API_URL = `${getApiUrl()}/delivery`;

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

  const deliveries = data.map((delivery: any) => ({
    ...delivery,
    orders: delivery.orders.map((order: any) => ({
      id: order.id,
      numero: order.numero,
      cliente: order.cliente,
      valor: order.valor,
      peso: order.peso,
      data: order.data,
      idCliente: order.idCliente,
      endereco: order.endereco,
      cidade: order.cidade,
      uf: order.uf,
      volume: order.volume,
      prazo: order.prazo,
      prioridade: order.prioridade,
      telefone: order.telefone,
      email: order.email,
      bairro: order.bairro,
      instrucoesEntrega: order.instrucoesEntrega,
      nomeContato: order.nomeContato,
      cpfCnpj: order.cpfCnpj,
      cep: order.cep,
      status: order.status,
      tenantId: order.tenantId,
      sorting: order.sorting,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    })),
    approvals: delivery.liberacoes.map((approval: any) => ({
      id: approval.id,
      deliveryId: approval.deliveryId,
      tenantId: approval.tenantId,
      action: approval.action,
      motivo: approval.motivo,
      userId: approval.userId,
      createdAt: approval.createdAt,
      userName: approval.User?.name || 'N/A',
    })),
  }));

  return deliveries;
};

export const addDelivery = async (token: string, data: any): Promise<any> => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Failed to add delivery:', errorData);
    throw new Error(errorData.message || 'Failed to add delivery');
  }

  return await response.json();
};

export const updateDelivery = async (token: string, id: string, data: any): Promise<void> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Failed to update delivery:', errorData);
    throw new Error('Failed to update delivery');
  }
};

export const deleteDelivery = async (token: string, id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Failed to delete delivery:', errorData);
    throw new Error('Failed to delete delivery');
  }
};

export const removeOrderFromDelivery = async (token: string, deliveryId: string, orderId: string): Promise<void> => {
  const response = await fetch(`${API_URL}/${deliveryId}/remove-order/${orderId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Failed to remove order from delivery:', errorData);
    throw new Error('Failed to remove order from delivery');
  }
};

export const releaseDelivery = async (token: string, id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/${id}/release`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Failed to release delivery:', errorData);
    throw new Error('Failed to release delivery');
  }

  return await response.json();
};

export const rejectRelease = async (token: string, id: string, motivo: string): Promise<void> => {
  const response = await fetch(`${API_URL}/${id}/reject`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ motivo }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Failed to reject delivery:', errorData);
    throw new Error('Failed to reject delivery');
  }

  return await response.json();
};
