// src/services/userService.ts

import axios from 'axios';
import { User, Role } from '../types';
import { getApiUrl } from './utils/apiUtils';

const API_URL = `${getApiUrl()}/users`;

// Criação de uma instância do axios com interceptores para adicionar o cabeçalho de autenticação
const apiClient = (token: string) =>
  axios.create({
    baseURL: getApiUrl(),
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const fetchCurrentUser = async (token: string): Promise<User> => {
  try {
    const response = await apiClient(token).get('/users/me');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching current user:', error.message);
    throw new Error(error.response?.data?.message || 'Erro ao buscar usuário atual.');
  }
};

export const fetchUsers = async (token: string): Promise<User[]> => {
  try {
    const response = await apiClient(token).get('/users');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching users:', error.message);
    throw new Error(error.response?.data?.message || 'Erro ao buscar usuários.');
  }
};

export const fetchUserById = async (token: string, id: string): Promise<User> => {
  try {
    const response = await apiClient(token).get(`/users/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching user by ID:', error.message);
    throw new Error(error.response?.data?.message || 'Erro ao buscar usuário.');
  }
};

export const addUser = async (token: string, user: User): Promise<User> => {
  try {
    const response = await apiClient(token).post('/users', user);
    return response.data;
  } catch (error: any) {
    console.error('Error adding user:', error.message);
    throw new Error(error.response?.data?.message || 'Erro ao adicionar usuário.');
  }
};

export const updateUser = async (token: string, id: string, user: Partial<User>): Promise<User> => {
  try {
    const response = await apiClient(token).patch(`/users/${id}`, user);
    return response.data;
  } catch (error: any) {
    console.error('Error updating user:', error.message);
    throw new Error(error.response?.data?.message || 'Erro ao atualizar usuário.');
  }
};

export const deleteUser = async (token: string, id: string): Promise<void> => {
  try {
    await apiClient(token).delete(`/users/${id}`);
  } catch (error: any) {
    console.error('Error deleting user:', error.message);
    throw new Error(error.response?.data?.message || 'Erro ao excluir usuário.');
  }
};

export const fetchRoles = async (token: string): Promise<Role[]> => {
  try {
    const response = await apiClient(token).get('/roles');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching roles:', error.message);
    throw new Error(error.response?.data?.message || 'Erro ao buscar papéis.');
  }
};
