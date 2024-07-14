// services/directionsService.ts
import { Direction } from '../types';

export const fetchDirections = async (token: string): Promise<Direction[]> => {
  const response = await fetch('http://localhost:4000/directions', {
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

export const addDirection = async (token: string, newDirection: Partial<Direction>) => {
  const response = await fetch('http://localhost:4000/directions', {
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

export const updateDirection = async (token: string, id: number, updatedDirection: Partial<Direction>) => {
  const response = await fetch(`http://localhost:4000/directions/${id}`, {
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

export const deleteDirection = async (token: string, id: number) => {
  const response = await fetch(`http://localhost:4000/directions/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to delete direction');
  }
};
