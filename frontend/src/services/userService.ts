import axios from 'axios';
import { User, Role } from '../types';
import { getApiUrl } from './utils/apiUtils';

const API_URL = `${getApiUrl()}/users`;

export const fetchUsers = async (token: string): Promise<User[]> => {
  try {
    const response = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const addUser = async (token: string, user: User): Promise<User> => {
  try {
    const response = await axios.post(API_URL, user, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error adding user:', error);
    throw error;
  }
};

export const updateUser = async (token: string, id: string, user: User): Promise<User> => {
  try {
    const response = await axios.patch(`${API_URL}/${id}`, user, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const deleteUser = async (token: string, id: string): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

export const fetchRoles = async (token: string): Promise<Role[]> => {
  try {
    const response = await axios.get(`${getApiUrl()}/roles`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching roles:', error);
    throw error;
  }
};
