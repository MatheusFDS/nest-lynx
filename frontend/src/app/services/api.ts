import { getApiUrl } from '../utils/apiUtils'
import type {
  LoginCredentials,
  LoginResponse,
  User,
  CreateUserDto,
  UpdateUserDto,
  Driver,
  CreateDriverDto,
  UpdateDriverDto,
  Vehicle,
  CreateVehicleDto,
  UpdateVehicleDto,
  Order,
  Delivery,
  CreateDeliveryDto,
  UpdateDeliveryDto,
  Payment,
  CreatePaymentDto,
  UpdatePaymentDto,
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
  Direction,
  CreateDirectionDto,
  UpdateDirectionDto,
  Statistics,
  Tenant,
  UpdateTenantDto,
  MobileProfile,
  MobileRoute,
  ApiResponse,
  OptimizeRouteRequest,
  OptimizeRouteResponse,
  DistanceCalculationResponse
} from '../types/api'

class ApiService {
  private baseURL: string

  constructor() {
    this.baseURL = getApiUrl()
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`

    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (token && !endpoint.includes('/auth/')) {
      defaultHeaders.Authorization = `Bearer ${token}`
    }

    const headers = { ...defaultHeaders, ...options.headers }

    try {
      const response = await fetch(url, { ...options, headers })

      if (response.status === 401) {
        if (endpoint.includes('/auth/')) {
          const errorData = await response.json().catch(() => ({ message: 'Unauthorized' }))
          throw new Error(errorData.message || 'Unauthorized')
        } else {
          console.warn('Token expired, letting AuthContext handle refresh...')
          throw new Error('UNAUTHORIZED')
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      if (error instanceof Error && error.message === 'UNAUTHORIZED') {
        console.debug('Auth check failed (expected during initialization):', endpoint)
      } else {
        console.error('API Request Error:', error)
      }
      throw error
    }
  }

  private async get<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  private async post<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  private async patch<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  private async put<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  private async delete<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  private async upload<T = any>(endpoint: string, formData: FormData): Promise<T> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    const headers: HeadersInit = {}

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  }

  // ==============================================
  // AUTENTICAÇÃO
  // ==============================================

  login = (credentials: LoginCredentials): Promise<LoginResponse> => {
    return this.post<LoginResponse>('/auth/login', credentials)
  }

  refreshToken = (refreshToken: string): Promise<{ access_token: string }> => {
    return this.post('/auth/refresh-token', { refresh_token: refreshToken })
  }

  logout = async (): Promise<void> => {
    try {
      await this.post('/auth/logout')
    } catch (error) {
      console.debug('Logout backend failed (expected if token expired):', error instanceof Error ? error.message : 'Unknown error')
    }
  }

  // ==============================================
  // ROTAS E MAPAS
  // ==============================================

  optimizeRoute = (data: OptimizeRouteRequest): Promise<OptimizeRouteResponse> => {
    return this.post<OptimizeRouteResponse>('/routes/optimize', data)
  }

  calculateDistance = (origin: string, destination: string): Promise<DistanceCalculationResponse> => {
    return this.post<DistanceCalculationResponse>('/routes/calculate-distance', { origin, destination })
  }

  getRouteMap = (routeId: string): Promise<{ mapUrl: string }> => {
    return this.get<{ mapUrl: string }>(`/routes/map/${routeId}`)
  }

  getGoogleMapsApiKey = (): Promise<{ apiKey: string }> => {
    return this.get('/routes/config/maps-key');
  }

  geocodeAddresses = (addresses: string[]): Promise<Array<{
    address: string
    lat: number
    lng: number
    formatted_address: string
    success: boolean
    error?: string
  }>> => {
    return this.post('/routes/geocode', { addresses })
  }

  calculateInteractiveRoute = (data: {
    origin: { lat: number; lng: number }
    destination: { lat: number; lng: number }
    waypoints?: Array<{ lat: number; lng: number }>
  }): Promise<{
    distance: number
    duration: number
    polyline: string
    legs: Array<{
      distance: number
      duration: number
      start_address: string
      end_address: string
    }>
  }> => {
    return this.post('/routes/calculate-route', data)
  }

  generateStaticMap = (data: {
    markers?: Array<{ lat: number; lng: number; label?: string; color?: string }>
    path?: Array<{ lat: number; lng: number }>
    center?: { lat: number; lng: number }
    zoom?: number
    size?: string
    polyline?: string
  }): Promise<{ mapUrl: string }> => {
    return this.post('/routes/static-map', data)
  }


  // ==============================================
  // USUÁRIOS
  // ==============================================

  // GET /users
  getUsers = (): Promise<User[]> => {
    return this.get<User[]>('/users')
  }

  // GET /users/me
  getCurrentUser = (): Promise<User> => {
    return this.get<User>('/users/me')
  }

  // GET /users/:id
  getUser = (id: string): Promise<User> => {
    return this.get<User>(`/users/${id}`)
  }

  // POST /users
  createUser = (userData: CreateUserDto): Promise<User> => {
    return this.post<User>('/users', userData)
  }

  // PATCH /users/:id
  updateUser = (id: string, userData: UpdateUserDto): Promise<User> => {
    return this.patch<User>(`/users/${id}`, userData)
  }

  // DELETE /users/:id
  deleteUser = (id: string): Promise<void> => {
    return this.delete(`/users/${id}`)
  }

  // ==============================================
  // MOTORISTAS
  // ==============================================

  // GET /drivers
  getDrivers = (): Promise<Driver[]> => {
    return this.get<Driver[]>('/drivers')
  }

  // GET /drivers/available-users
  getAvailableUsers = (): Promise<User[]> => {
    return this.get<User[]>('/drivers/available-users')
  }

  // POST /drivers
  createDriver = (driverData: CreateDriverDto): Promise<Driver> => {
    return this.post<Driver>('/drivers', driverData)
  }

  // PATCH /drivers/:id
  updateDriver = (id: string, driverData: UpdateDriverDto): Promise<Driver> => {
    return this.patch<Driver>(`/drivers/${id}`, driverData)
  }

  // DELETE /drivers/:id
  deleteDriver = (id: string): Promise<void> => {
    return this.delete(`/drivers/${id}`)
  }

  // ==============================================
  // VEÍCULOS
  // ==============================================

  // GET /vehicles
  getVehicles = (): Promise<Vehicle[]> => {
    return this.get<Vehicle[]>('/vehicles')
  }

  // GET /vehicles/:id
  getVehicle = (id: string): Promise<Vehicle> => {
    return this.get<Vehicle>(`/vehicles/${id}`)
  }

  // POST /vehicles
  createVehicle = (vehicleData: CreateVehicleDto): Promise<Vehicle> => {
    return this.post<Vehicle>('/vehicles', vehicleData)
  }

  // PATCH /vehicles/:id
  updateVehicle = (id: string, vehicleData: UpdateVehicleDto): Promise<Vehicle> => {
    return this.patch<Vehicle>(`/vehicles/${id}`, vehicleData)
  }

  // DELETE /vehicles/:id
  deleteVehicle = (id: string): Promise<void> => {
    return this.delete(`/vehicles/${id}`)
  }

  // ==============================================
  // PEDIDOS
  // ==============================================

  // GET /orders
  getOrders = (): Promise<Order[]> => {
    return this.get<Order[]>('/orders')
  }

  // GET /orders/:id/history
  getOrderHistory = (id: string): Promise<any[]> => {
    return this.get<any[]>(`/orders/${id}/history`)
  }

  // POST /orders/upload
  uploadOrders = (orders: any[]): Promise<Order[]> => {
    return this.post<Order[]>('/orders/upload', orders)
  }

  // ==============================================
  // ENTREGAS/ROTEIROS
  // ==============================================

  // GET /delivery
  getDeliveries = (): Promise<Delivery[]> => {
    return this.get<Delivery[]>('/delivery')
  }

  // GET /delivery/:id
  getDelivery = (id: string): Promise<Delivery> => {
    return this.get<Delivery>(`/delivery/${id}`)
  }

  // POST /delivery
  createDelivery = (deliveryData: CreateDeliveryDto): Promise<Delivery> => {
    return this.post<Delivery>('/delivery', deliveryData)
  }

  calculateFreightPreview = (data: { orderIds: string[]; vehicleId: string }): Promise<{ calculatedFreight: number }> => {
    return this.post('/delivery/calculate-freight-preview', data);
  }

  // PATCH /delivery/:id
  updateDelivery = (id: string, deliveryData: UpdateDeliveryDto): Promise<Delivery> => {
    return this.patch<Delivery>(`/delivery/${id}`, deliveryData)
  }

  // DELETE /delivery/:id
  deleteDelivery = (id: string): Promise<void> => {
    return this.delete(`/delivery/${id}`)
  }

  // PATCH /delivery/:id/liberar
  liberarRoteiro = (id: string): Promise<ApiResponse> => {
    return this.patch<ApiResponse>(`/delivery/${id}/liberar`)
  }

  // PATCH /delivery/:id/rejeitar
  rejeitarRoteiro = (id: string, motivo: string): Promise<ApiResponse> => {
    return this.patch<ApiResponse>(`/delivery/${id}/rejeitar`, { motivo })
  }

  // PATCH /delivery/:id/remove-order/:orderId
  removeOrderFromDelivery = (deliveryId: string, orderId: string): Promise<ApiResponse> => {
    return this.patch<ApiResponse>(`/delivery/${deliveryId}/remove-order/${orderId}`)
  }

  // PATCH /delivery/order/:orderId/status
  updateOrderStatus = (
    orderId: string,
    status: string,
    motivoNaoEntrega?: string,
    codigoMotivoNaoEntrega?: string
  ): Promise<ApiResponse> => {
    return this.patch<ApiResponse>(`/delivery/order/${orderId}/status`, {
      status,
      motivoNaoEntrega,
      codigoMotivoNaoEntrega
    })
  }

  // ==============================================
  // PAGAMENTOS
  // ==============================================

  // GET /payments
  getPayments = (): Promise<Payment[]> => {
    return this.get<Payment[]>('/payments')
  }

  // GET /payments/:id
  getPayment = (id: string): Promise<Payment> => {
    return this.get<Payment>(`/payments/${id}`)
  }

  // POST /payments
  createPayment = (paymentData: CreatePaymentDto): Promise<Payment> => {
    return this.post<Payment>('/payments', paymentData)
  }

  // PATCH /payments/:id
  updatePayment = (id: string, paymentData: UpdatePaymentDto): Promise<Payment> => {
    return this.patch<Payment>(`/payments/${id}`, paymentData)
  }

  // PATCH /payments/:id/status
  updatePaymentStatus = (id: string, status: string): Promise<Payment> => {
    return this.patch<Payment>(`/payments/${id}/status`, { status })
  }

  // DELETE /payments/:id
  deletePayment = (id: string): Promise<void> => {
    return this.delete(`/payments/${id}`)
  }

  // POST /payments/group
  groupPayments = (paymentIds: string[]): Promise<Payment> => {
    return this.post<Payment>('/payments/group', { paymentIds })
  }

  // POST /payments/ungroup/:id
  ungroupPayments = (id: string): Promise<void> => {
    return this.post(`/payments/ungroup/${id}`)
  }

  // ==============================================
  // CATEGORIAS
  // ==============================================

  // GET /category
  getCategories = (): Promise<Category[]> => {
    return this.get<Category[]>('/category')
  }

  // GET /category/:id
  getCategory = (id: string): Promise<Category> => {
    return this.get<Category>(`/category/${id}`)
  }

  // POST /category
  createCategory = (categoryData: CreateCategoryDto): Promise<Category> => {
    return this.post<Category>('/category', categoryData)
  }

  // PATCH /category/:id
  updateCategory = (id: string, categoryData: UpdateCategoryDto): Promise<Category> => {
    return this.patch<Category>(`/category/${id}`, categoryData)
  }

  // DELETE /category/:id
  deleteCategory = (id: string): Promise<void> => {
    return this.delete(`/category/${id}`)
  }

  // ==============================================
  // DIREÇÕES/REGIÕES
  // ==============================================

  // GET /directions
  getDirections = (): Promise<Direction[]> => {
    return this.get<Direction[]>('/directions')
  }

  // GET /directions/:id
  getDirection = (id: string): Promise<Direction> => {
    return this.get<Direction>(`/directions/${id}`)
  }

  // POST /directions
  createDirection = (directionData: CreateDirectionDto): Promise<Direction> => {
    return this.post<Direction>('/directions', directionData)
  }

  // PATCH /directions/:id
  updateDirection = (id: string, directionData: UpdateDirectionDto): Promise<Direction> => {
    return this.patch<Direction>(`/directions/${id}`, directionData)
  }

  // DELETE /directions/:id
  deleteDirection = (id: string): Promise<void> => {
    return this.delete(`/directions/${id}`)
  }

  // ==============================================
  // ESTATÍSTICAS
  // ==============================================

  // GET /statistics
  getStatistics = (
    startDate: string,
    endDate: string,
    driverId?: string,
    includeDetails?: boolean
  ): Promise<Statistics> => {
    const params = new URLSearchParams({
      startDate,
      endDate,
      ...(driverId && { driverId }),
      ...(includeDetails !== undefined && { includeDetails: includeDetails.toString() })
    })
    return this.get<Statistics>(`/statistics?${params}`)
  }

  // ==============================================
  // TENANT
  // ==============================================

  // GET /tenant
  getTenant = (): Promise<Tenant> => {
    return this.get<Tenant>('/tenant')
  }

  // PUT /tenant/:tenantId
  updateTenant = (tenantId: string, tenantData: UpdateTenantDto): Promise<Tenant> => {
    return this.put<Tenant>(`/tenant/${tenantId}`, tenantData)
  }

  // ==============================================
  // ROLES
  // ==============================================

  // GET /roles
  getRoles = (): Promise<any[]> => {
    return this.get<any[]>('/roles')
  }

  // ==============================================
  // MOBILE (APP MOTORISTA)
  // ==============================================

  // GET /mobile/v1/profile
  getMobileProfile = (): Promise<MobileProfile> => {
    return this.get<MobileProfile>('/mobile/v1/profile')
  }

  // GET /mobile/v1/routes
  getMobileRoutes = (includeHistory?: boolean): Promise<ApiResponse<MobileRoute[]>> => {
    const params = includeHistory ? '?includeHistory=true' : ''
    return this.get<ApiResponse<MobileRoute[]>>(`/mobile/v1/routes${params}`)
  }

  // GET /mobile/v1/history
  getMobileHistory = (): Promise<ApiResponse<MobileRoute[]>> => {
    return this.get<ApiResponse<MobileRoute[]>>('/mobile/v1/history')
  }

  // GET /mobile/v1/financials/receivables
  getMobileReceivables = (): Promise<ApiResponse<{ totalAmount: number }>> => {
    return this.get<ApiResponse<{ totalAmount: number }>>('/mobile/v1/financials/receivables')
  }

  // GET /mobile/v1/routes/:id
  getMobileRouteDetails = (routeId: string): Promise<ApiResponse<MobileRoute>> => {
    return this.get<ApiResponse<MobileRoute>>(`/mobile/v1/routes/${routeId}`)
  }

  // GET /mobile/v1/deliveries/:id
  getMobileDeliveryDetails = (orderId: string): Promise<ApiResponse> => {
    return this.get<ApiResponse>(`/mobile/v1/deliveries/${orderId}`)
  }

  // PATCH /mobile/v1/orders/:id/status
  updateMobileOrderStatus = (
    orderId: string,
    status: string,
    motivoNaoEntrega?: string,
    codigoMotivoNaoEntrega?: string
  ): Promise<ApiResponse> => {
    return this.patch<ApiResponse>(`/mobile/v1/orders/${orderId}/status`, {
      status,
      motivoNaoEntrega,
      codigoMotivoNaoEntrega
    })
  }

  // POST /mobile/v1/orders/:id/proof
  uploadMobileProof = (orderId: string, file: File, description?: string): Promise<ApiResponse> => {
    const formData = new FormData()
    formData.append('file', file)
    if (description) {
      formData.append('description', description)
    }
    return this.upload<ApiResponse>(`/mobile/v1/orders/${orderId}/proof`, formData)
  }

  // GET /mobile/v1/orders/:id/proofs
  getMobileOrderProofs = (orderId: string): Promise<ApiResponse> => {
    return this.get<ApiResponse>(`/mobile/v1/orders/${orderId}/proofs`)
  }
}

export const api = new ApiService()