import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getApiUrl } from '../utils/apiUtils';
import type { 
  Order, 
  Delivery, 
  Driver, 
  Vehicle, 
  Category, 
  Direction, 
  Payment, 
  User, 
  Role,
  Tenant,
  CreateOrderForm,
  CreateDeliveryForm,
  UpdateDeliveryStatusForm,
  UpdateOrderStatusForm,
  OrderFilters,
  DeliveryFilters,
  PaymentFilters
} from '../../types';
import {
  OrderStatus, 
  DeliveryStatus, 
  PaymentStatus
} from '../../types';

declare module 'axios' {
  export interface AxiosRequestConfig {
    skipAuth?: boolean;
    skipErrorHandling?: boolean;
    _retry?: boolean;
  }
}

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success?: boolean;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

export interface ApiClientConfig {
  baseURL?: string;
  timeout?: number;
  retries?: number;
  enableRefreshToken?: boolean;
}

export interface RequestConfig extends AxiosRequestConfig {}

class TokenManager {
  private static readonly TOKEN_KEY = 'token';
  private static readonly REFRESH_TOKEN_KEY = 'refreshToken';

  static getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static setTokens(token: string, refreshToken?: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.TOKEN_KEY, token);
    if (refreshToken) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    }
  }

  static clearTokens(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  static isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  }
}

class ApiClient {
  private instance: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];

  constructor(config: ApiClientConfig = {}) {
    this.instance = axios.create({
      baseURL: config.baseURL || getApiUrl(),
      timeout: config.timeout || 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors(config);
  }

  private setupInterceptors(config: ApiClientConfig): void {
    this.instance.interceptors.request.use(
      (requestConfig: InternalAxiosRequestConfig) => {
        const token = TokenManager.getToken();
        
        if (token && !requestConfig.skipAuth) {
          requestConfig.headers.Authorization = `Bearer ${token}`;
        }

        return requestConfig;
      },
      (error) => Promise.reject(this.createApiError(error))
    );

    this.instance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as RequestConfig;

        if (
          error.response?.status === 401 &&
          config.enableRefreshToken !== false &&
          !originalRequest.skipAuth &&
          !originalRequest._retry
        ) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const newToken = await this.refreshToken();
            this.processQueue(null, newToken);
            
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            return this.instance(originalRequest);
          } catch (refreshError) {
            this.processQueue(refreshError, null);
            TokenManager.clearTokens();
            return Promise.reject(this.createApiError(refreshError));
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(this.createApiError(error));
      }
    );
  }

  private async refreshToken(): Promise<string> {
    const refreshToken = TokenManager.getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post(`${getApiUrl()}/auth/refresh-token`, {
      refresh_token: refreshToken,
    });

    const { access_token, refresh_token: newRefreshToken } = response.data;
    TokenManager.setTokens(access_token, newRefreshToken);
    
    return access_token;
  }

  private processQueue(error: any, token: string | null): void {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    
    this.failedQueue = [];
  }

  private createApiError(error: any): ApiError {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<any>;
      
      return {
        message: axiosError.response?.data?.message || axiosError.message || 'Network error',
        status: axiosError.response?.status,
        code: axiosError.code,
        details: axiosError.response?.data,
      };
    }

    return {
      message: error.message || 'Unknown error',
      details: error,
    };
  }

  async get<T = any>(url: string, config: RequestConfig = {}): Promise<T> {
    const response = await this.instance.get<T>(url, config);
    return response.data;
  }

  async post<T = any>(url: string, data?: any, config: RequestConfig = {}): Promise<T> {
    const response = await this.instance.post<T>(url, data, config);
    return response.data;
  }

  async put<T = any>(url: string, data?: any, config: RequestConfig = {}): Promise<T> {
    const response = await this.instance.put<T>(url, data, config);
    return response.data;
  }

  async patch<T = any>(url: string, data?: any, config: RequestConfig = {}): Promise<T> {
    const response = await this.instance.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string, config: RequestConfig = {}): Promise<T> {
    const response = await this.instance.delete<T>(url, config);
    return response.data;
  }

  createCrudService<T = any>(endpoint: string) {
    return {
      list: (params?: Record<string, any>): Promise<T[]> => {
        return this.get<T[]>(endpoint, { params });
      },
      getById: (id: string): Promise<T> => {
        return this.get<T>(`${endpoint}/${id}`);
      },
      create: (data: Partial<T>): Promise<T> => {
        return this.post<T>(endpoint, data);
      },
      update: (id: string, data: Partial<T>): Promise<T> => {
        return this.patch<T>(`${endpoint}/${id}`, data);
      },
      delete: (id: string): Promise<void> => {
        return this.delete<void>(`${endpoint}/${id}`);
      },
      createMany: (items: Partial<T>[]): Promise<T[]> => {
        return this.post<T[]>(`${endpoint}/batch`, items);
      },
      custom: {
        get: (path: string, params?: any): Promise<any> => {
          return this.get(`${endpoint}/${path}`, { params });
        },
        post: (path: string, data?: any): Promise<any> => {
          return this.post(`${endpoint}/${path}`, data);
        },
        patch: (path: string, data?: any): Promise<any> => {
          return this.patch(`${endpoint}/${path}`, data);
        },
      },
    };
  }

  setDefaultHeader(key: string, value: string): void {
    this.instance.defaults.headers.common[key] = value;
  }

  removeDefaultHeader(key: string): void {
    delete this.instance.defaults.headers.common[key];
  }

  getToken(): string | null {
    return TokenManager.getToken();
  }

  setTokens(token: string, refreshToken?: string): void {
    TokenManager.setTokens(token, refreshToken);
  }

  clearTokens(): void {
    TokenManager.clearTokens();
  }

  isAuthenticated(): boolean {
    const token = TokenManager.getToken();
    return token !== null && !TokenManager.isTokenExpired(token);
  }

  getRawInstance(): AxiosInstance {
    return this.instance;
  }
}

export const apiClient = new ApiClient({
  enableRefreshToken: true,
  timeout: 15000,
});

export const ordersService = {
  ...apiClient.createCrudService<Order>('/orders'),
  upload: (orders: Order[]) => apiClient.post('/orders/upload', orders),
  getHistory: (orderId: string) => apiClient.get(`/orders/${orderId}/history`),
  getByStatus: (status: OrderStatus) => 
    apiClient.get<Order[]>('/orders', { params: { status } }),
  getUrgent: () => 
    apiClient.get<Order[]>('/orders', { 
      params: { 
        status: OrderStatus.SEM_ROTA,
        urgent: true 
      } 
    }),
  getWithoutRoute: () => 
    apiClient.get<Order[]>('/orders', { 
      params: { status: OrderStatus.SEM_ROTA } 
    }),
  updateStatus: (orderId: string, data: UpdateOrderStatusForm) =>
    apiClient.patch(`/orders/${orderId}/status`, data),
};

export const deliveriesService = {
  ...apiClient.createCrudService<Delivery>('/delivery'),
  release: (id: string) => apiClient.patch(`/delivery/${id}/release`),
  reject: (id: string, motivo: string) => apiClient.patch(`/delivery/${id}/reject`, { motivo }),
  getByStatus: (status: DeliveryStatus) => 
    apiClient.get<Delivery[]>('/delivery', { params: { status } }),
  getPendingApproval: () => 
    apiClient.get<Delivery[]>('/delivery', { 
      params: { status: DeliveryStatus.A_LIBERAR } 
    }),
  getInProgress: () => 
    apiClient.get<Delivery[]>('/delivery', { 
      params: { status: DeliveryStatus.INICIADO } 
    }),
  getDelayed: () => 
    apiClient.get<Delivery[]>('/delivery', { 
      params: { 
        status: DeliveryStatus.INICIADO,
        delayed: true 
      } 
    }),
  removeOrder: (deliveryId: string, orderId: string) => 
    apiClient.patch(`/delivery/${deliveryId}/remove-order/${orderId}`),
  updateStatus: (id: string, data: UpdateDeliveryStatusForm) =>
    apiClient.patch(`/delivery/${id}/status`, data),
};

export const driversService = {
  ...apiClient.createCrudService<Driver>('/drivers'),
  getAvailableUsers: () => apiClient.get('/drivers/available-users'),
  getActive: () => apiClient.get<Driver[]>('/drivers', { params: { active: true } }),
};

export const vehiclesService = {
  ...apiClient.createCrudService<Vehicle>('/vehicles'),
  getAvailable: () => apiClient.get<Vehicle[]>('/vehicles', { params: { available: true } }),
};

export const categoriesService = apiClient.createCrudService<Category>('/category');

export const directionsService = apiClient.createCrudService<Direction>('/directions');

export const paymentsService = {
  ...apiClient.createCrudService<Payment>('/payments'),
  group: (paymentIds: string[]) => apiClient.post('/payments/group', { paymentIds }),
  ungroup: (paymentId: string) => apiClient.post(`/payments/ungroup/${paymentId}`),
  getByStatus: (status: PaymentStatus) => 
    apiClient.get<Payment[]>('/payments', { params: { status } }),
  getPending: () => 
    apiClient.get<Payment[]>('/payments', { 
      params: { status: PaymentStatus.PENDENTE } 
    }),
  getDueToday: () => 
    apiClient.get<Payment[]>('/payments', { 
      params: { 
        status: PaymentStatus.PENDENTE,
        dueToday: true 
      } 
    }),
  updateStatus: (id: string, status: PaymentStatus) => 
    apiClient.patch(`/payments/${id}`, { status }),
};

export const usersService = {
  ...apiClient.createCrudService<User>('/users'),
  getCurrentUser: () => apiClient.get<User>('/users/me'),
  updateProfile: (data: Partial<User>) => apiClient.patch('/users/me', data),
};

export const rolesService = apiClient.createCrudService<Role>('/roles');

export const tenantsService = apiClient.createCrudService<Tenant>('/tenant');

export const statisticsService = {
  get: (startDate: string, endDate: string) => 
    apiClient.get('/statistics', { params: { startDate, endDate } }),
  getDashboard: () => apiClient.get('/statistics/dashboard'),
  getByStatus: (type: 'orders' | 'deliveries' | 'payments', status: string) =>
    apiClient.get(`/statistics/${type}`, { params: { status } }),
};

export const platformAdminService = {
  tenants: apiClient.createCrudService('/platform-admin/tenants'),
  users: {
    ...apiClient.createCrudService('/platform-admin/users'),
    createPlatformAdmin: (data: any) => apiClient.post('/platform-admin/users/platform-admin', data),
    createTenantUser: (data: any, tenantId: string) => 
      apiClient.post(`/platform-admin/users/tenant-user?tenantId=${tenantId}`, { ...data, tenantId }),
  },
  roles: apiClient.createCrudService('/platform-admin/roles'),
};

export const filterHelpers = {
  ordersToParams: (filters: OrderFilters): Record<string, any> => {
    const params: Record<string, any> = {};
    if (filters.status) {
      params.status = Array.isArray(filters.status) ? filters.status.join(',') : filters.status;
    }
    if (filters.prioridade) {
      params.prioridade = Array.isArray(filters.prioridade) ? filters.prioridade.join(',') : filters.prioridade;
    }
    if (filters.dateFrom) params.dateFrom = filters.dateFrom;
    if (filters.dateTo) params.dateTo = filters.dateTo;
    if (filters.driverId) params.driverId = filters.driverId;
    if (filters.urgent) params.urgent = filters.urgent;
    if (filters.withoutRoute) params.withoutRoute = filters.withoutRoute;
    return params;
  },
  
  deliveriesToParams: (filters: DeliveryFilters): Record<string, any> => {
    const params: Record<string, any> = {};
    if (filters.status) {
      params.status = Array.isArray(filters.status) ? filters.status.join(',') : filters.status;
    }
    if (filters.driverId) params.driverId = filters.driverId;
    if (filters.dateFrom) params.dateFrom = filters.dateFrom;
    if (filters.dateTo) params.dateTo = filters.dateTo;
    if (filters.delayed) params.delayed = filters.delayed;
    if (filters.pendingApproval) params.pendingApproval = filters.pendingApproval;
    return params;
  },
  
  paymentsToParams: (filters: PaymentFilters): Record<string, any> => {
    const params: Record<string, any> = {};
    if (filters.status) {
      params.status = Array.isArray(filters.status) ? filters.status.join(',') : filters.status;
    }
    if (filters.driverId) params.driverId = filters.driverId;
    if (filters.dateFrom) params.dateFrom = filters.dateFrom;
    if (filters.dateTo) params.dateTo = filters.dateTo;
    if (filters.dueToday) params.dueToday = filters.dueToday;
    if (filters.grouped) params.grouped = filters.grouped;
    return params;
  }
};

export default apiClient;

export const createLegacyService = (endpoint: string) => ({
  fetch: (token: string) => {
    return apiClient.get(endpoint);
  },
  add: (token: string, data: any) => {
    return apiClient.post(endpoint, data);
  },
  update: (token: string, id: string, data: any) => {
    return apiClient.patch(`${endpoint}/${id}`, data);
  },
  delete: (token: string, id: string) => {
    return apiClient.delete(`${endpoint}/${id}`);
  },
});