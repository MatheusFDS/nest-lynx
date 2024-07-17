import { ReactNode } from "react";

export interface Category {
  precoPorKM: any;
  id: number;
  name: string;
  valor: number;
  tenantId: number;
}

export interface Delivery {
  user: any;
  region: any;
  Vehicle: Vehicle;
  Driver: Driver;
  dataFim: string | number | Date;
  dataInicio: string | number | Date;
  id: number;
  motoristaId: number;
  veiculoId: number;
  valorFrete: number;
  totalPeso: number;
  totalValor: number;
  tenantId: number;
  orders: Order[];
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
  dataLiberacao?: Date;
  liberador?: string; 
  motivo?: string; 
  liberacoes: Approval[]; // Adicionado para relação com Approval
}

export interface Direction {
  id: number;
  rangeInicio: string;
  rangeFim: string;
  valorDirecao: string;
  regiao: string;
  tenantId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Driver {
  id: number;
  name: string;
  license: string;
  cpf: string;
  tenantId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  column_name: string;
  data_type: string;
}

export interface Metadata {
  [table: string]: Column[];
}

export interface Order {
  directionId: any;
  sorting: number;
  address: any;
  lat: number;
  lng: number;
  estado: any;
  logradouro: any;
  motorista: ReactNode;
  dataFinalizacao: string | number | Date;
  id: number;
  numero: string;
  data: string;
  idCliente: string;
  cliente: string;
  endereco: string;
  cidade: string;
  uf: string;
  peso: number;
  volume: number;
  prazo: string;
  prioridade: string;
  telefone: string;
  email: string;
  bairro: string;
  valor: number;
  instrucoesEntrega: string;
  nomeContato: string;
  cpfCnpj: string;
  cep: string;
  status: string;
  deliveryId: number | null;
  tenantId: number;
  createdAt: string;
  updatedAt: string;
  Delivery?: {
    dataFim: string;
    Driver?: {
      name: string;
    };
  };
}

export interface Approval {
  id: number;
  deliveryId: number;
  tenantId: number;
  action: string; // 'approved' ou 'rejected'
  motivo?: string; // Campo opcional para motivo de rejeição
  userId: number;
  createdAt: string;
  userName?: string; // Adicionado para exibir o nome do usuário
}

export interface Payment {
  id: number;
  amount: number;
  status: string;
  tenantId: number;
  motoristaId: number;
  createdAt: string;
  updatedAt: string;
  isGroup: boolean;
  groupedPaymentId: number | null;
  Driver: Driver;
  paymentDeliveries: {
    delivery: Delivery;
  }[];
}

export interface User {
  id: number;
  email: string;
  role: string;
  name: string;
  tenantId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Tenant {
  minDeliveryPercentage: number;
  id: number;
  name: string;
  minDeliveryValue: number;
  address?: string;
  domain?: string;
  databaseSchema?: string;
  port?: number;
  databaseUrl?: string;
}

export interface Vehicle {
  id: number;
  model: string;
  plate: string;
  driverId: number;
  tenantId: number;
  categoryId: number;
  createdAt: string;
  updatedAt: string;
  valor: number; // Adicionado o valor do veículo
}
