// src/services/auxiliaryService.ts
import { Tenant } from '../types';
import { getApiUrl } from './utils/apiUtils';

export const fetchOrders = async (token: string) => {
  const response = await fetch(`${getApiUrl()}/orders`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch orders');
  }

  return await response.json();
};

export const fetchDirections = async (token: string) => {
  const response = await fetch(`${getApiUrl()}/directions`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch directions');
  }

  return await response.json();
};

export const fetchDrivers = async (token: string) => {
  const response = await fetch(`${getApiUrl()}/drivers`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch drivers');
  }

  return await response.json();
};

export const fetchVehicles = async (token: string) => {
  const response = await fetch(`${getApiUrl()}/vehicles`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch vehicles');
  }

  return await response.json();
};

export const fetchCategories = async (token: string) => {
  const response = await fetch(`${getApiUrl()}/category`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }

  return await response.json();
};

export const fetchTenantData = async (token: string): Promise<Tenant[]> => {
  const response = await fetch(`${getApiUrl()}/tenant`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch tenant data');
  }

  const data: Tenant[] = await response.json();
  console.log('Tenant data:', data); // Log para verificar os dados retornados
  return data;
};
