// services/metadataService.ts
import { Metadata } from '../types';
import { getApiUrl } from './utils/apiUtils';

export const fetchMetadata = async (token: string): Promise<Metadata> => {
  const API_URL = getApiUrl() + '/metadata';

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
  const API_URL = getApiUrl() + '/metadata/data';

  const response = await fetch(`${API_URL}`, {
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
