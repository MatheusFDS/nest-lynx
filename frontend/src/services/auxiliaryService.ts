// src/services/auxiliaryService.ts

export const fetchOrders = async (token: string) => {
  const response = await fetch('http://localhost:4000/orders', {
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
  const response = await fetch('http://localhost:4000/directions', {
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
  const response = await fetch('http://localhost:4000/drivers', {
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
  const response = await fetch('http://localhost:4000/vehicles', {
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
  const response = await fetch('http://localhost:4000/category', {
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
