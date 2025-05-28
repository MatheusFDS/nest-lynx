// services/platformAdmin/roleApi.ts
import { getApiUrl } from '../utils/apiUtils'; // Ajuste o caminho se necessário

const API_BASE_URL = `${getApiUrl()}/platform-admin/roles`;

export interface PlatformRole {
  id: string;
  name: string;
  description?: string | null;
  isPlatformRole: boolean;
  // Outros campos que sua API de role possa retornar
  createdAt?: string;
  updatedAt?: string;
}

// Esta DTO deve espelhar a CreateRoleDto do backend
export interface PlatformCreateRoleDto {
  name: string;
  description?: string;
  isPlatformRole: boolean;
}

// Esta DTO deve espelhar uma possível UpdateRoleDto do backend
// Usaremos Partial para campos opcionais na atualização
export type PlatformUpdateRoleDto = Partial<PlatformCreateRoleDto>;


export const fetchPlatformRoles = async (token: string): Promise<PlatformRole[]> => {
  const response = await fetch(API_BASE_URL, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to fetch roles' }));
    throw new Error(errorData.message || 'Failed to fetch roles');
  }
  return response.json();
};

export const fetchRoleByIdForPlatformAdmin = async (token: string, roleId: string): Promise<PlatformRole> => {
  const response = await fetch(`${API_BASE_URL}/${roleId}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to fetch role details' }));
    throw new Error(errorData.message || 'Failed to fetch role details');
  }
  return response.json();
};

export const createPlatformRole = async (token: string, roleData: PlatformCreateRoleDto): Promise<PlatformRole> => {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(roleData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to create role' }));
    throw new Error(errorData.message || 'Failed to create role');
  }
  return response.json();
};

export const updatePlatformRole = async (token: string, roleId: string, roleData: PlatformUpdateRoleDto): Promise<PlatformRole> => {
  const response = await fetch(`${API_BASE_URL}/${roleId}`, {
    method: 'PATCH', // Ou PUT, dependendo da sua API backend
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(roleData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to update role' }));
    throw new Error(errorData.message || 'Failed to update role');
  }
  return response.json();
};

export const deletePlatformRole = async (token: string, roleId: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/${roleId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to delete role' }));
    throw new Error(errorData.message || 'Failed to delete role');
  }
};