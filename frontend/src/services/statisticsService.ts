// services/statisticsService.ts
import { getApiUrl } from './utils/apiUtils';

export const fetchStatistics = async (token: string, startDate: string, endDate: string) => {
  const API_URL = getApiUrl();
  
  try {
    const response = await fetch(`${API_URL}/statistics?startDate=${startDate}&endDate=${endDate}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch statistics');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching statistics:', error);
    throw error; // Re-throw the error after logging it
  }
};
