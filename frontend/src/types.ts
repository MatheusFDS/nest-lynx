import { ReactNode, useMemo, useState } from 'react';

// ========================================
// ENUMS
// ========================================
export enum OrderStatus { SEM_ROTA = 'Sem rota', EM_ROTA_AGUARDANDO_LIBERACAO = 'Em rota, aguardando liberação', EM_ROTA = 'Em rota', EM_ENTREGA = 'Em entrega', ENTREGUE = 'Entregue', NAO_ENTREGUE = 'Não entregue' }
export enum DeliveryStatus { A_LIBERAR = 'A liberar', INICIADO = 'Iniciado', FINALIZADO = 'Finalizado', REJEITADO = 'Rejeitado' }
export enum PaymentStatus { PENDENTE = 'Pendente', PAGO = 'Pago', BAIXADO = 'Baixado', CANCELADO = 'Cancelado' }
export enum UserStatus { ATIVO = 'Ativo', INATIVO = 'Inativo', BLOQUEADO = 'Bloqueado', PENDENTE = 'Pendente' }
export enum TenantStatus { ATIVO = 'Ativo', INATIVO = 'Inativo', SUSPENSO = 'Suspenso', TRIAL = 'Trial' }
export enum VehicleStatus { ATIVO = 'Ativo', INATIVO = 'Inativo', MANUTENCAO = 'Manutenção', DISPONIVEL = 'Disponível', EM_USO = 'Em uso' }
export enum OrderPriority { BAIXA = 'Baixa', NORMAL = 'Normal', ALTA = 'Alta', URGENTE = 'Urgente' }
export enum ApprovalAction { APPROVED = 'APPROVED', REJECTED = 'REJECTED', RE_APPROVAL_NEEDED = 'RE_APPROVAL_NEEDED' }
export enum UserRole { SUPER_ADMIN = 'superadmin', ADMIN = 'admin', MANAGER = 'manager', DRIVER = 'driver', OPERATOR = 'operator', VIEWER = 'viewer' }

// ========================================
// CONSTANTES DE STATUS (Completas)
// ========================================
export const ORDER_STATUS_ARRAYS = {
  NO_ROUTE: [OrderStatus.SEM_ROTA],
  IN_ROUTE: [OrderStatus.EM_ROTA_AGUARDANDO_LIBERACAO, OrderStatus.EM_ROTA, OrderStatus.EM_ENTREGA],
  FINAL: [OrderStatus.ENTREGUE, OrderStatus.NAO_ENTREGUE],
  ACTIVE: [OrderStatus.EM_ROTA_AGUARDANDO_LIBERACAO, OrderStatus.EM_ROTA, OrderStatus.EM_ENTREGA],
  DRIVER_UPDATABLE: [OrderStatus.EM_ROTA, OrderStatus.EM_ENTREGA]
};

export const DELIVERY_STATUS_ARRAYS = {
  ACTIVE: [DeliveryStatus.A_LIBERAR, DeliveryStatus.INICIADO],
  PENDING_ACTION: [DeliveryStatus.A_LIBERAR],
  FINAL: [DeliveryStatus.FINALIZADO, DeliveryStatus.REJEITADO],
  IN_PROGRESS: [DeliveryStatus.INICIADO]
};

export const PAYMENT_STATUS_ARRAYS = {
  PENDING: [PaymentStatus.PENDENTE],
  PAID: [PaymentStatus.PAGO, PaymentStatus.BAIXADO],
  UPDATABLE: [PaymentStatus.PENDENTE, PaymentStatus.BAIXADO]
};

export const STATUS_COLORS = {
  ORDER: {
    [OrderStatus.SEM_ROTA]: '#ff9800',
    [OrderStatus.EM_ROTA_AGUARDANDO_LIBERACAO]: '#ff5722',
    [OrderStatus.EM_ROTA]: '#2196f3',
    [OrderStatus.EM_ENTREGA]: '#03a9f4',
    [OrderStatus.ENTREGUE]: '#4caf50',
    [OrderStatus.NAO_ENTREGUE]: '#f44336',
  },
  DELIVERY: {
    [DeliveryStatus.A_LIBERAR]: '#ff9800',
    [DeliveryStatus.INICIADO]: '#2196f3',
    [DeliveryStatus.FINALIZADO]: '#4caf50',
    [DeliveryStatus.REJEITADO]: '#f44336',
  },
  PAYMENT: {
    [PaymentStatus.PENDENTE]: '#ff9800',
    [PaymentStatus.PAGO]: '#4caf50',
    [PaymentStatus.BAIXADO]: '#4caf50',
    [PaymentStatus.CANCELADO]: '#f44336',
  }
};

export const STATUS_LABELS = {
  ORDER: {
    [OrderStatus.SEM_ROTA]: 'Sem Rota',
    [OrderStatus.EM_ROTA_AGUARDANDO_LIBERACAO]: 'Aguardando Liberação',
    [OrderStatus.EM_ROTA]: 'Em Rota',
    [OrderStatus.EM_ENTREGA]: 'Em Entrega',
    [OrderStatus.ENTREGUE]: 'Entregue',
    [OrderStatus.NAO_ENTREGUE]: 'Não Entregue',
  },
  DELIVERY: {
    [DeliveryStatus.A_LIBERAR]: 'A Liberar',
    [DeliveryStatus.INICIADO]: 'Iniciado',
    [DeliveryStatus.FINALIZADO]: 'Finalizado',
    [DeliveryStatus.REJEITADO]: 'Rejeitado',
  },
  PAYMENT: {
    [PaymentStatus.PENDENTE]: 'Pendente',
    [PaymentStatus.PAGO]: 'Pago',
    [PaymentStatus.BAIXADO]: 'Baixado',
    [PaymentStatus.CANCELADO]: 'Cancelado',
  }
};

// ========================================
// CLASSE HELPER
// ========================================
export class StatusHelper {
  static isToday(date: string | Date): boolean { const today = new Date(); const targetDate = new Date(date); return today.toDateString() === targetDate.toDateString(); }
  static isThisMonth(date: string | Date): boolean { const today = new Date(); const targetDate = new Date(date); return today.getMonth() === targetDate.getMonth() && today.getFullYear() === targetDate.getFullYear(); }
  static getDaysAgo(date: string | Date): number { const today = new Date(); const targetDate = new Date(date); const diffTime = today.getTime() - targetDate.getTime(); return Math.floor(diffTime / (1000 * 60 * 60 * 24)); }
  static getHoursAgo(date: string | Date): number { const now = new Date(); const targetDate = new Date(date); const diffTime = now.getTime() - targetDate.getTime(); return Math.floor(diffTime / (1000 * 60 * 60)); }
  static isOrderUrgent(order: { status: string; prioridade?: string; data: string }): boolean { const diasAtraso = this.getDaysAgo(order.data); return order.status === OrderStatus.SEM_ROTA && (order.prioridade === OrderPriority.ALTA || order.prioridade === OrderPriority.URGENTE || diasAtraso >= 2); }
  static isDeliveryDelayed(delivery: { status: string; dataInicio: string }): boolean { if (![DeliveryStatus.INICIADO, DeliveryStatus.A_LIBERAR].includes(delivery.status as DeliveryStatus)) { return false; } return this.getHoursAgo(delivery.dataInicio) >= 8; }
  static isDriverActive(driverId: string, deliveries: Array<{ motoristaId: string; status: string }>): boolean { return deliveries.some(delivery => delivery.motoristaId === driverId && [DeliveryStatus.INICIADO, DeliveryStatus.A_LIBERAR].includes(delivery.status as DeliveryStatus)); }
  static isPaymentDueToday(payment: { status: string; createdAt: string }): boolean { return payment.status === PaymentStatus.PENDENTE && this.isToday(payment.createdAt); }
}

// ========================================
// INTERFACES
// ========================================
export interface UserSummary { id: string; name: string; email?: string; }
export interface Approval { id: string; deliveryId: string; tenantId: string; action: ApprovalAction | string; motivo?: string; userId: string; createdAt: string; User?: UserSummary; userName?: string; }
export interface Category { id: string; name: string; valor: number; tenantId: string; precoPorKM?: any; }
export interface Vehicle { id: string; model: string; plate: string; driverId: string; tenantId: string; categoryId: string; status?: VehicleStatus | string; Category?: Category; createdAt: string; updatedAt: string; valor?: number; }
export interface Driver { id: string; name: string; license: string; cpf: string; tenantId: string; userId?: string; status?: UserStatus | string; User?: UserSummary; createdAt?: string; updatedAt?: string; }
export interface Order { id: string; numero: string; data: string; idCliente: string; cliente: string; endereco: string; cidade: string; uf: string; peso: number; volume: number; prazo?: string; prioridade?: OrderPriority | string; telefone: string; email?: string; bairro: string; valor: number; instrucoesEntrega?: string; nomeContato?: string; cpfCnpj: string; cep: string; status: OrderStatus | string; motivoNaoEntrega?: string; codigoMotivoNaoEntrega?: string; deliveryId: string | null; tenantId: string; driverId?: string | null; sorting: number | null; startedAt?: string | null; completedAt?: string | null; createdAt: string; updatedAt: string; directionId?: string; lat?: number; lng?: number; estado?: any; logradouro?: any; motorista?: ReactNode; dataFinalizacao?: string | number | Date; Delivery?: { id?: string; status?: DeliveryStatus | string; dataFim?: string; Driver?: { name: string; }; }; }
export interface Delivery { id: string; motoristaId: string; veiculoId: string; valorFrete: number; totalPeso: number; totalValor: number; dataInicio: string; dataFim?: string | null; status: DeliveryStatus | string; tenantId: string; dataLiberacao?: string | null; observacao?: string; createdAt: string; updatedAt: string; orders: Order[]; Driver?: Driver; Vehicle?: Vehicle; approvals: Approval[]; user?: any; region?: any; liberador?: string; motivo?: string; }
export interface Direction { id: string; rangeInicio: string; rangeFim: string; valorDirecao: number; regiao: string; tenantId: string; createdAt: string; updatedAt: string; }
export interface Payment { id: string; amount: number; status: PaymentStatus | string; tenantId: string; motoristaId: string; createdAt: string; updatedAt: string; isGroup: boolean; groupedPaymentId: string | null; description?: string; value?: number; deliveryIds?: string[]; Driver?: Driver; paymentDeliveries?: { delivery?: Delivery; }[]; }
export interface User { id: string; email: string; roleId?: string; name: string; password?: string; tenantId?: string; status?: UserStatus | string; role?: Role; isActive?: boolean; createdAt?: string; updatedAt?: string; }
export interface Role { id: string; name: UserRole | string; displayName?: string; isPlatformRole?: boolean; permissions?: string[]; }
export interface Tenant { id: string; name: string; address?: string; status?: TenantStatus | string; minDeliveryPercentage?: number | null; minValue?: number | null; minOrders?: number | null; minPeso?: number | null; password?: string; user?: string; createdAt?: string; updatedAt?: string; }
export interface OrderHistoryEvent { id: string; timestamp: string; eventType: string; description: string; user?: string; details?: { oldStatus?: OrderStatus | string; newStatus?: OrderStatus | string; reason?: string; proofUrl?: string; deliveryId?: string; driverName?: string; vehiclePlate?: string; finalStatus?: OrderStatus | string; deliveryStatus?: DeliveryStatus | string; motivoNaoEntrega?: string; codigoMotivoNaoEntrega?: string; approvalAction?: ApprovalAction | string; approvalReason?: string; orderNumber?: string; }; }
export interface AvailableUser { id: string; name: string; email: string; status?: UserStatus | string; }
export interface AlertCardProps { icon: React.ReactNode; title: string; count: number; subtitle: string; color?: 'warning' | 'error' | 'success' | 'info'; urgent?: boolean; onClick?: () => void; }
export interface Column { column_name: string; data_type: string; }
export interface Metadata { [table: string]: Column[]; }
export interface StatsCardProps { icon: React.ReactElement; title: string; value: string | number; subtitle?: string; trend?: number; color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'primary' | 'success' | 'warning' | 'error' | 'secondary'; }
export interface OrderFilters { status?: OrderStatus | OrderStatus[]; prioridade?: OrderPriority | OrderPriority[]; dateFrom?: string; dateTo?: string; driverId?: string; urgent?: boolean; withoutRoute?: boolean; }
export interface DeliveryFilters { status?: DeliveryStatus | DeliveryStatus[]; driverId?: string; dateFrom?: string; dateTo?: string; delayed?: boolean; pendingApproval?: boolean; }
export interface PaymentFilters { status?: PaymentStatus | PaymentStatus[]; driverId?: string; dateFrom?: string; dateTo?: string; dueToday?: boolean; grouped?: boolean; }
export interface CreateOrderForm { numero: string; data: string; cliente: string; endereco: string; cidade: string; uf: string; cep: string; peso: number; volume: number; valor: number; prioridade?: OrderPriority; telefone: string; email?: string; bairro: string; instrucoesEntrega?: string; nomeContato?: string; cpfCnpj: string; }
export interface CreateDeliveryForm { motoristaId: string; veiculoId: string; orderIds: string[]; dataInicio?: string; observacao?: string; }
export interface UpdateDeliveryStatusForm { status: DeliveryStatus; motivo?: string; }
export interface UpdateOrderStatusForm { status: OrderStatus; motivoNaoEntrega?: string; codigoMotivoNaoEntrega?: string; }
export interface ApiResponse<T = any> { data: T; message?: string; success?: boolean; }
export interface PaginatedResponse<T> extends ApiResponse<T[]> { pagination: { page: number; limit: number; total: number; totalPages: number; }; }
export interface ApiError { message: string; status?: number; code?: string; details?: any; }
export type EntityType = 'orders' | 'deliveries' | 'drivers' | 'vehicles' | 'payments' | 'users' | 'roles' | 'tenants';
export interface CrudHookOptions { globalLoading?: boolean; autoRefresh?: boolean; refreshInterval?: number; filters?: any; }
export interface DashboardMetrics { pedidosUrgentes: Order[]; entregasAtrasadas: Delivery[]; roteirosParaLiberar: Delivery[]; pagamentosHoje: Payment[]; entregasAndamento: Delivery[]; pedidosSemRota: Order[]; motoristasAtivos: Driver[]; receitaHoje: number; receitaMes: number; pagamentosAFazer: number; taxaEntregaNoPrazo: number; tempoMedioEntrega: number; satisfacaoCliente: number; }

// ========================================
// HOOKS
// ========================================
export const useOrderFilters = (initialFilters?: Partial<OrderFilters>) => {
  const [filters, setFilters] = useState<OrderFilters>(initialFilters || {});
  const queryParams = useMemo(() => { const params: Record<string, any> = {}; if (filters.status) { params.status = Array.isArray(filters.status) ? filters.status.join(',') : filters.status; } if (filters.prioridade) { params.prioridade = Array.isArray(filters.prioridade) ? filters.prioridade.join(',') : filters.prioridade; } if (filters.dateFrom) params.dateFrom = filters.dateFrom; if (filters.dateTo) params.dateTo = filters.dateTo; if (filters.driverId) params.driverId = filters.driverId; if (filters.urgent) params.urgent = filters.urgent; if (filters.withoutRoute) params.withoutRoute = filters.withoutRoute; return params; }, [filters]);
  const updateFilter = <K extends keyof OrderFilters>(key: K, value: OrderFilters[K]) => { setFilters(prev => ({ ...prev, [key]: value })); };
  const clearFilters = () => { setFilters(initialFilters || {}); };
  const hasActiveFilters = Object.keys(filters).length > 0;
  return { filters, queryParams, updateFilter, clearFilters, hasActiveFilters, setFilters };
};

export const useDeliveryFilters = (initialFilters?: Partial<DeliveryFilters>) => {
  const [filters, setFilters] = useState<DeliveryFilters>(initialFilters || {});
  const queryParams = useMemo(() => { const params: Record<string, any> = {}; if (filters.status) { params.status = Array.isArray(filters.status) ? filters.status.join(',') : filters.status; } if (filters.driverId) params.driverId = filters.driverId; if (filters.dateFrom) params.dateFrom = filters.dateFrom; if (filters.dateTo) params.dateTo = filters.dateTo; if (filters.delayed) params.delayed = filters.delayed; if (filters.pendingApproval) params.pendingApproval = filters.pendingApproval; return params; }, [filters]);
  const updateFilter = <K extends keyof DeliveryFilters>(key: K, value: DeliveryFilters[K]) => { setFilters(prev => ({ ...prev, [key]: value })); };
  const clearFilters = () => { setFilters(initialFilters || {}); };
  const hasActiveFilters = Object.keys(filters).length > 0;
  return { filters, queryParams, updateFilter, clearFilters, hasActiveFilters, setFilters };
};

export const usePaymentFilters = (initialFilters?: Partial<PaymentFilters>) => {
  const [filters, setFilters] = useState<PaymentFilters>(initialFilters || {});
  const queryParams = useMemo(() => { const params: Record<string, any> = {}; if (filters.status) { params.status = Array.isArray(filters.status) ? filters.status.join(',') : filters.status; } if (filters.driverId) params.driverId = filters.driverId; if (filters.dateFrom) params.dateFrom = filters.dateFrom; if (filters.dateTo) params.dateTo = filters.dateTo; if (filters.dueToday) params.dueToday = filters.dueToday; if (filters.grouped) params.grouped = filters.grouped; return params; }, [filters]);
  const updateFilter = <K extends keyof PaymentFilters>(key: K, value: PaymentFilters[K]) => { setFilters(prev => ({ ...prev, [key]: value })); };
  const clearFilters = () => { setFilters(initialFilters || {}); };
  const hasActiveFilters = Object.keys(filters).length > 0;
  return { filters, queryParams, updateFilter, clearFilters, hasActiveFilters, setFilters };
};