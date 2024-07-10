import { Tenant } from '../types';

const API_URL = 'http://localhost:4000';

export const fetchOrders = async (token: string) => {
  const response = await fetch(`${API_URL}/orders`, {
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
  const response = await fetch(`${API_URL}/directions`, {
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
  const response = await fetch(`${API_URL}/drivers`, {
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
  const response = await fetch(`${API_URL}/vehicles`, {
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
  const response = await fetch(`${API_URL}/category`, {
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

export const fetchTenantData = async (token: string): Promise<Tenant> => {
  const response = await fetch(`${API_URL}/tenant`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch tenant data');
  }

  return await response.json();
};
