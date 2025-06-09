// frontend/src/types.ts
import { ReactNode } from "react";

export interface UserSummary {
  id: string;
  name: string;
  email?: string;
}

export interface Approval {
  id: string;
  deliveryId: string;
  tenantId: string;
  action: string;
  motivo?: string;
  userId: string;
  createdAt: string;
  User?: UserSummary;
  userName?: string;
}

export interface Category {
  id: string;
  name: string;
  valor: number;
  tenantId: string;
  precoPorKM?: any;
}

export interface Vehicle {
  id: string;
  model: string;
  plate: string;
  driverId: string;
  tenantId: string;
  categoryId: string;
  Category?: Category;
  createdAt: string;
  updatedAt: string;
  valor?: number;
}

export interface Driver {
  id: string;
  name: string;
  license: string;
  cpf: string;
  tenantId: string;
  userId?: string;
  User?: UserSummary;
  createdAt?: string;
  updatedAt?: string;
}

export interface Order {
  id: string;
  numero: string;
  data: string;
  idCliente: string;
  cliente: string;
  endereco: string;
  cidade: string;
  uf: string;
  peso: number;
  volume: number;
  prazo?: string;
  prioridade?: string;
  telefone: string;
  email?: string;
  bairro: string;
  valor: number;
  instrucoesEntrega?: string;
  nomeContato?: string;
  cpfCnpj: string;
  cep: string;
  status: string;
  motivoNaoEntrega?: string;
  codigoMotivoNaoEntrega?: string;
  deliveryId: string | null;
  tenantId: string;
  driverId?: string | null;
  sorting: number | null; // Permitindo null aqui, pois o backend (Prisma) permite
  startedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  directionId?: string;
  lat?: number;
  lng?: number;
  estado?: any;
  logradouro?: any;
  motorista?: ReactNode;
  dataFinalizacao?: string | number | Date;
  Delivery?: {
    dataFim?: string;
    Driver?: {
      name: string;
    };
  };
}

export interface Delivery {
  id: string;
  motoristaId: string;
  veiculoId: string;
  valorFrete: number;
  totalPeso: number;
  totalValor: number;
  dataInicio: string;
  dataFim?: string | null;
  status: string;
  tenantId: string;
  dataLiberacao?: string | null;
  observacao?: string;
  createdAt: string;
  updatedAt: string;
  orders: Order[];
  Driver?: Driver;
  Vehicle?: Vehicle;
  approvals: Approval[]; // Alterado de 'liberacoes' para 'approvals' para consistência com o backend
  user?: any;
  region?: any;
  liberador?: string;
  motivo?: string;
}

export interface Direction {
  id: string;
  rangeInicio: string;
  rangeFim: string;
  valorDirecao: number;
  regiao: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  amount: number;
  status: string;
  tenantId: string;
  motoristaId: string;
  createdAt: string;
  updatedAt: string;
  isGroup: boolean;
  groupedPaymentId: string | null;
  Driver?: Driver;
  paymentDeliveries?: {
    delivery?: Delivery;
  }[];
}

export interface User { // Usuário do sistema para o frontend web/admin
  id: string;
  email: string;
  roleId?: string;
  name: string;
  password?: string;
  tenantId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Role {
  id: string;
  name: string;
}

export interface Tenant {
  id: string;
  name: string;
  address?: string;
  minDeliveryPercentage?: number | null;
  minValue?: number | null;
  minOrders?: number | null;
  minPeso?: number | null;
  password?: string;
  user?: string;
}

export interface OrderHistoryEvent {
  id: string;
  timestamp: string;
  eventType: string;
  description: string;
  user?: string;
  details?: {
    oldStatus?: string;
    newStatus?: string;
    reason?: string;
    proofUrl?: string;
    deliveryId?: string;
    driverName?: string;
    vehiclePlate?: string;
    finalStatus?: string;
    deliveryStatus?: string;
    motivoNaoEntrega?: string;
    codigoMotivoNaoEntrega?: string;
    approvalAction?: string;
    approvalReason?: string;
    orderNumber?: string;
  };
}

export interface AvailableUser {
  id: string;
  name: string;
  email: string;
}

export interface AlertCardProps {
  icon: React.ReactNode;
  title: string;
  count: number;
  subtitle: string;
  color?: 'warning' | 'error' | 'success' | 'info';
  urgent?: boolean;
  onClick?: () => void;
}

export interface Column {
  column_name: string;
  data_type: string;
}

export interface Metadata {
  [table: string]: Column[];
}

export interface StatsCardProps {
  icon: React.ReactElement;
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' |  'primary' | 'success' | 'warning' | 'error' | 'secondary';
}