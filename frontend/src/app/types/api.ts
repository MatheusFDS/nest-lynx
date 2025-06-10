// Tipos de Autenticação
export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
  user: {
    id: string
    name: string
    email: string
    role: string
    tenantId: string
    driverId?: string
  }
}

// Tipos de Usuário
export interface User {
  id: string
  name: string
  email: string
  role: string
  tenantId: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateUserDto {
  name: string
  email: string
  password: string
  roleId: string
}

export interface UpdateUserDto {
  name?: string
  email?: string
  password?: string
  roleId?: string
  isActive?: boolean
}

// Tipos de Motorista
export interface Driver {
  id: string
  name: string
  license: string
  cpf: string
  userId?: string
  tenantId: string
  User?: {
    id: string
    name: string
    email: string
  }
}

export interface CreateDriverDto {
  name: string
  license: string
  cpf: string
  userId?: string
}

export interface UpdateDriverDto {
  name?: string
  license?: string
  cpf?: string
  userId?: string
}

// Tipos de Veículo
export interface Vehicle {
  id: string
  model: string
  plate: string
  driverId: string
  categoryId: string
  tenantId: string
  Category?: {
    id: string
    name: string
    valor: number
  }
}

export interface CreateVehicleDto {
  model: string
  plate: string
  driverId: string
  categoryId: string
}

export interface UpdateVehicleDto {
  model?: string
  plate?: string
  driverId?: string
  categoryId?: string
}

// Tipos de Pedido
export interface Order {
  id: string
  numero: string
  data: string
  cliente: string
  endereco: string
  cidade: string
  uf: string
  cep: string
  telefone: string
  email: string
  valor: number
  peso: number
  status: string
  deliveryId?: string
  tenantId: string
  sorting?: number
  instrucoesEntrega?: string
  motivoNaoEntrega?: string
  startedAt?: string
  completedAt?: string
}

// Tipos de Entrega/Roteiro
export interface Delivery {
  id: string
  motoristaId: string
  veiculoId: string
  valorFrete: number
  totalPeso: number
  totalValor: number
  status: string
  dataInicio: string
  dataFim?: string
  observacao: string
  tenantId: string
  Driver?: Driver
  Vehicle?: Vehicle
  orders?: Order[]
}

export interface CreateDeliveryDto {
  motoristaId: string
  veiculoId: string
  orders: Array<{ id: string; sorting?: number }>
  observacao?: string
  dataInicio?: string
}

export interface UpdateDeliveryDto {
  motoristaId?: string
  veiculoId?: string
  orders?: Array<{ id: string; sorting?: number }>
  observacao?: string
  dataInicio?: string
  status?: string
}

// Tipos de Pagamento
export interface Payment {
  id: string
  amount: number
  status: string
  motoristaId: string
  isGroup: boolean
  groupedPaymentId?: string
  tenantId: string
  Driver?: Driver
}

export interface CreatePaymentDto {
  deliveryId?: string
  amount: number
  status?: string
  motoristaId: string
}

export interface UpdatePaymentDto {
  amount?: number
  status?: string
}

// Tipos de Categoria
export interface Category {
  id: string
  name: string
  valor: number
  tenantId: string
}

export interface CreateCategoryDto {
  name: string
  valor: number
}

export interface UpdateCategoryDto {
  name?: string
  valor?: number
}

// Tipos de Estatísticas
export interface Statistics {
  ordersInRoute: number
  ordersFinalized: number
  ordersPending: number
  freightsToPay: number
  freightsPaid: number
  deliveriesInRoute: number
  deliveriesFinalized: number
  notesByRegion: Array<{ region: string; count: number }>
  avgOrdersPerDriver: Array<{ driverId: string; average: number }>
  avgValueNotesPerDriver: Array<{ driverId: string; average: number }>
  avgWeightPerDriver: Array<{ driverId: string; average: number }>
}

// Tipos de Tenant
export interface Tenant {
  id: string
  name: string
  address: string
  minValue?: number
  minPeso?: number
  minOrders?: number
  minDeliveryPercentage?: number
}

export interface UpdateTenantDto {
  name?: string
  address?: string
  minValue?: number
  minPeso?: number
  minOrders?: number
  minDeliveryPercentage?: number
}

// Tipos Mobile
export interface MobileProfile {
  data: {
    id: string
    name: string
    email: string
    phone: string
    vehicle: string
    plate: string
    companyName: string
    tenantId: string
    driverId: string | null
  }
  success: boolean
  message: string
}

export interface MobileRoute {
  id: string
  date: string
  status: string
  totalValue: number
  freightValue: number
  paymentStatus: 'pago' | 'nao_pago'
  observacao: string
  vehicle: string
  driverName: string
  deliveries: Array<{
    id: string
    customerName: string
    address: string
    phone: string
    value: number
    status: string
    items: string[]
    paymentMethod: string
    notes: string
    numeroPedido: string
    sorting: number
    hasProof: boolean
    proofCount: number
  }>
}

// Tipos de Resposta da API
export interface ApiResponse<T = any> {
  data?: T
  message?: string
  success?: boolean
  error?: string
}