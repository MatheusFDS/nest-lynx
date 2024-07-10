import { ReactNode } from "react";

export interface Category {
  id: number;
  name: string;
  valor: number;
  tenantId: number;
}

export interface Delivery {
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

export interface Order {
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
  valor: number; // Adicionando o valor do veículo
}
