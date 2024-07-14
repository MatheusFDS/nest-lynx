import { Metadata } from '../types';

const API_URL = 'http://localhost:4000/metadata';

export const fetchMetadata = async (token: string): Promise<Metadata> => {
  const response = await fetch(`${API_URL}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch metadata');
  }

  const data: Metadata = await response.json();
  return data;
};

export const fetchFilteredData = async (
  token: string,
  table: string,
  columns: string[],
  filters: { [key: string]: string }
): Promise<any[]> => {
  const response = await fetch(`${API_URL}/data`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ table, columns, filters }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch filtered data');
  }

  const data: any[] = await response.json();
  return data;
};
