import { getApiUrl } from './utils/apiUtils';

export const fetchStatistics = async (token: string, startDate: string, endDate: string) => {
  const API_URL = getApiUrl();
  const response = await fetch(`${API_URL}/statistics?start=${startDate}&end=${endDate}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch statistics');
  }

  return await response.json();
};
