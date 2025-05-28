import { getApiUrl } from '../utils/apiUtils'; // Ajuste o caminho para apiUtils se necessário

const API_BASE_URL = `${getApiUrl()}/platform-admin/tenants`;

// Defina interfaces para os DTOs se ainda não tiver no frontend
// Estas devem espelhar as CreateTenantDto e UpdateTenantDto do backend
export interface PlatformCreateTenantDto {
  name: string;
  email: string; // Email do primeiro admin do tenant
  address?: string;
  // Adicione outros campos que seu CreateTenantDto do backend espera
}

export interface PlatformUpdateTenantDto {
  name?: string;
  address?: string;
  minDeliveryPercentage?: number;
  minValue?: number;
  minOrders?: number;
  minPeso?: number;
  // Adicione outros campos que seu UpdateTenantDto do backend espera
}

export interface Tenant {
  id: string;
  name: string;
  address?: string | null;
  minDeliveryPercentage?: number | null;
  minValue?: number | null;
  minOrders?: number | null;
  minPeso?: number | null;
  createdAt: string; // Ou Date, dependendo de como você tratará
  updatedAt: string; // Ou Date
  // Adicione outros campos que o backend retorna para um Tenant
}

export const fetchPlatformTenants = async (token: string): Promise<Tenant[]> => {
  const response = await fetch(API_BASE_URL, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to fetch tenants' }));
    throw new Error(errorData.message || 'Failed to fetch tenants');
  }
  return response.json();
};

export const fetchPlatformTenantById = async (token: string, tenantId: string): Promise<Tenant> => {
  const response = await fetch(`${API_BASE_URL}/${tenantId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to fetch tenant details' }));
    throw new Error(errorData.message || 'Failed to fetch tenant details');
  }
  return response.json();
};

export const createPlatformTenant = async (token: string, tenantData: PlatformCreateTenantDto): Promise<Tenant> => {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(tenantData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to create tenant' }));
    throw new Error(errorData.message || 'Failed to create tenant');
  }
  return response.json();
};

export const updatePlatformTenant = async (token: string, tenantId: string, tenantData: PlatformUpdateTenantDto): Promise<Tenant> => {
  const response = await fetch(`${API_BASE_URL}/${tenantId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(tenantData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to update tenant' }));
    throw new Error(errorData.message || 'Failed to update tenant');
  }
  return response.json();
};

export const deletePlatformTenant = async (token: string, tenantId: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/${tenantId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to delete tenant' }));
    throw new Error(errorData.message || 'Failed to delete tenant');
  }
  // Delete geralmente não retorna corpo, ou retorna um status 204 ou um objeto de confirmação
};