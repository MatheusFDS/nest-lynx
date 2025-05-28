// services/platformAdmin/userApi.ts
import { getApiUrl } from '../utils/apiUtils';

const API_BASE_URL = `${getApiUrl()}/platform-admin/users`;

export interface PlatformRole {
  id: string;
  name: string;
  isPlatformRole: boolean;
}

export interface PlatformTenant {
  id: string;
  name: string;
}

export interface PlatformUser {
  id: string;
  email: string;
  name: string;
  roleId: string;
  tenantId: string | null;
  role?: PlatformRole;
  tenant?: PlatformTenant | null;
  createdAt: string;
  updatedAt: string;
}

export interface PlatformCreateUserDto {
  email: string;
  password?: string;
  name: string;
  roleId: string;
}

export interface PlatformUpdateUserDto {
  email?: string;
  password?: string;
  name?: string;
  roleId?: string;
}

export const fetchPlatformUsers = async (token: string, tenantId?: string): Promise<PlatformUser[]> => {
  const url = tenantId ? `${API_BASE_URL}?tenantId=${tenantId}` : API_BASE_URL;
  console.log('[userApi] fetchPlatformUsers - URL:', url);
  const response = await fetch(url, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to fetch users' }));
    throw new Error(errorData.message || 'Failed to fetch users');
  }
  return response.json();
};

export const fetchPlatformUserById = async (token: string, userId: string): Promise<PlatformUser> => {
  console.log('[userApi] fetchPlatformUserById - userId:', userId);
  const response = await fetch(`${API_BASE_URL}/${userId}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to fetch user details' }));
    throw new Error(errorData.message || 'Failed to fetch user details');
  }
  return response.json();
};

export const createPlatformAdminUserOnPlatform = async (token: string, userData: PlatformCreateUserDto): Promise<PlatformUser> => {
  console.log('[userApi] createPlatformAdminUserOnPlatform - userData:', userData);
  const response = await fetch(`${API_BASE_URL}/platform-admin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to create platform admin user' }));
    throw new Error(errorData.message || 'Failed to create platform admin user');
  }
  return response.json();
};

// CORREÇÃO: tenantId deve ir na query string, não no body!
export const createTenantUserOnPlatform = async (token: string, userData: PlatformCreateUserDto, tenantId: string): Promise<PlatformUser> => {
  console.log('[userApi] createTenantUserOnPlatform - tenantId:', tenantId, 'userData:', userData);
  console.log('[userApi] tenantId type:', typeof tenantId);
  
  // Garantir que tenantId seja uma string válida
  if (!tenantId || typeof tenantId !== 'string') {
    throw new Error(`Invalid tenantId: expected string, got ${typeof tenantId} - ${JSON.stringify(tenantId)}`);
  }
  
  // Limpar tenantId
  const cleanTenantId = tenantId.trim();
  
  // Validar formato UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(cleanTenantId)) {
    throw new Error(`Invalid UUID format for tenantId: ${cleanTenantId}`);
  }
  
  // CORREÇÃO: tenantId precisa ir na query string E no body
  // Query string: usado pelo controller
  // Body: usado pela validação do DTO
  const url = `${API_BASE_URL}/tenant-user?tenantId=${encodeURIComponent(cleanTenantId)}`;
  console.log('[userApi] URL with tenantId in query:', url);
  
  // O body DEVE conter tenantId para passar na validação do DTO
  const requestBody = {
    email: userData.email,
    password: userData.password,
    name: userData.name,
    roleId: userData.roleId,
    tenantId: cleanTenantId  // ✅ Adicionar tenantId no body também
  };
  
  console.log('[userApi] requestBody (com tenantId para validação):', requestBody);
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(requestBody),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to create tenant user' }));
    console.error('[userApi] Error response:', errorData);
    console.error('[userApi] URL used:', url);
    console.error('[userApi] Request body used:', JSON.stringify(requestBody, null, 2));
    throw new Error(errorData.message || 'Failed to create tenant user');
  }
  return response.json();
};

export const updateUserByPlatformAdmin = async (token: string, userId: string, userData: PlatformUpdateUserDto): Promise<PlatformUser> => {
  console.log('[userApi] updateUserByPlatformAdmin - userId:', userId, 'userData:', userData);
  const response = await fetch(`${API_BASE_URL}/${userId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to update user' }));
    throw new Error(errorData.message || 'Failed to update user');
  }
  return response.json();
};

export const deleteUserByPlatformAdmin = async (token: string, userId: string): Promise<void> => {
  console.log('[userApi] deleteUserByPlatformAdmin - userId:', userId);
  const response = await fetch(`${API_BASE_URL}/${userId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to delete user' }));
    throw new Error(errorData.message || 'Failed to delete user');
  }
};