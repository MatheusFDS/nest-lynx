// services/directionsService.ts
import { Direction } from '../types';
import { getApiUrl } from './utils/apiUtils';

const API_URL = `${getApiUrl()}/directions`;

export const fetchDirections = async (token: string): Promise<Direction[]> => {
  const response = await fetch(API_URL, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch directions');
  }

  return response.json();
};

export const addDirection = async (token: string, newDirection: Partial<Direction>): Promise<void> => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(newDirection),
  });

  if (!response.ok) {
    throw new Error('Failed to add direction');
  }
};

export const updateDirection = async (token: string, id: string, updatedDirection: Partial<Direction>): Promise<void> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updatedDirection),
  });

  if (!response.ok) {
    throw new Error('Failed to update direction');
  }
};

export const deleteDirection = async (token: string, id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to delete direction');
  }
};
