import { ReactNode } from "react";

export interface Category {
  precoPorKM: any;
  id: string;
  name: string;
  valor: number;
  tenantId: string;
}

export interface Delivery {
  user: any;
  region: any;
  Vehicle: Vehicle;
  Driver: Driver;
  dataFim: string | number | Date;
  dataInicio: string | number | Date;
  id: string;
  motoristaId: string;
  veiculoId: string;
  valorFrete: number;
  totalPeso: number;
  totalValor: number;
  tenantId: string;
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
  id: string;
  rangeInicio: string;
  rangeFim: string;
  valorDirecao: number;
  regiao: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Driver {
  id: string;
  name: string;
  license: string;
  cpf: string;
  tenantId: string;
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
  directionId: string;
  sorting: number;
  address: any;
  lat: number;
  lng: number;
  estado: any;
  logradouro: any;
  motorista: ReactNode;
  dataFinalizacao: string | number | Date;
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
  deliveryId: string | null;
  tenantId: string;
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
  id: string;
  deliveryId: string;
  tenantId: string;
  action: string; // 'approved' ou 'rejected'
  motivo?: string; // Campo opcional para motivo de rejeição
  userId: string;
  createdAt: string;
  userName?: string; // Adicionado para exibir o nome do usuário
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
  Driver: Driver;
  paymentDeliveries: {
    delivery: Delivery;
  }[];
}

export interface User {
  id: string;
  email: string;
  roleId: string;
  name: string;
  password: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  name: string;
}

export interface Tenant {
  password: string;
  user: string;
  minDeliveryPercentage: number;
  id: string;
  name: string;
  address?: string;
  minValue:             number;
  minOrders:            number;
  minPeso:             number;
}

export interface Vehicle {
  id: string;
  model: string;
  plate: string;
  driverId: string;
  tenantId: string;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
  valor: number; // Adicionado o valor do veículo
}
