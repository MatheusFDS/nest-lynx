import { ReactNode } from "react";

export interface Category {
  id: number;
  name: string;
  valor: number;
  tenantId: number;
}

// types.ts
export interface Delivery {
  dataFim: string | number | Date;
  dataInicio: string | number | Date;
  id: any;

  motoristaId: number;
  veiculoId: number;
  valorFrete: number;
  totalPeso: number;
  totalValor: number;
  tenantId: number;
  orders: {
    endereco: any;
    cep: string;
    peso: any;
    valor: any;
    cliente: any;
    numero: any; id: number 
}[];
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
  deliveryId: number;
  amount: number;
  status: string;
  tenantId: number;
  motoristaId: number;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: number;
  email: string;
  role: string;
  tenantId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  id: number;
  model: string;
  plate: string;
  driverId: number;
  tenantId: number;
  categoryId: number;
  createdAt: number;
  updatedAt: number;
  valor: number; // Adicionando o valor do veículo
}
