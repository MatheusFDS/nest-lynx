export class CreateOrderDto {
  numero: string;
  data: Date;
  idCliente: string;
  cliente: string;
  endereco: string;
  cidade: string;
  uf: string;
  peso: number;
  volume?: number;
  prazo?: string;
  prioridade?: string;
  telefone?: string;
  email?: string;
  bairro: string;
  valor: number;
  instrucoesEntrega?: string;
  nomeContato?: string;
  cpfCnpj: string;
  cep: string;
  status?: string;
  deliveryId?: number;
}
