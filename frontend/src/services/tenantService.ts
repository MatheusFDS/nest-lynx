import axios from 'axios';
import { Tenant } from '../types';
import { getApiUrl } from './utils/apiUtils';

const API_URL = `${getApiUrl()}/tenant`;

export const fetchTenants = async (token: string): Promise<Tenant[]> => {
  try {
    const response = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching tenants:', error);
    throw error;
  }
};

export const updateTenant = async (token: string, id: string, tenant: Tenant): Promise<Tenant> => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, tenant, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating tenant:', error);
    throw error;
  }
};
