export interface Category {
    id: number;
    name: string;
    valor: number;
    tenantId: number;
  }
  
  export interface Delivery {
    id: number;
    deliveryId: number;
    amount: number;
    status: string;
    tenantId: number;
    motoristaId: number;
    createdAt: string;
    updatedAt: string;
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
    vehicles: Vehicle[];
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
  }
  
  export interface Payment {
    id: number;
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
    role: string;  // Adicionando a propriedade role
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
    createdAt: string;
    updatedAt: string;
  }
  