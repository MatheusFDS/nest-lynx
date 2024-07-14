import { IsNumber, IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateOrderDto {
  @IsNotEmpty()
  @IsString()
  numero: string;

  @IsNotEmpty()
  data: Date;

  @IsNotEmpty()
  @IsString()
  idCliente: string;

  @IsNotEmpty()
  @IsString()
  cliente: string;

  @IsNotEmpty()
  @IsString()
  endereco: string;

  @IsNotEmpty()
  @IsString()
  cidade: string;

  @IsNotEmpty()
  @IsString()
  uf: string;

  @IsNotEmpty()
  @IsNumber()
  peso: number;

  @IsOptional()
  @IsNumber()
  volume?: number;

  @IsOptional()
  @IsString()
  prazo?: string;

  @IsOptional()
  @IsString()
  prioridade?: string;

  @IsOptional()
  @IsString()
  telefone?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsNotEmpty()
  @IsString()
  bairro: string;

  @IsNotEmpty()
  @IsNumber()
  valor: number;

  @IsOptional()
  @IsString()
  instrucoesEntrega?: string;

  @IsOptional()
  @IsString()
  nomeContato?: string;

  @IsNotEmpty()
  @IsString()
  cpfCnpj: string;

  @IsNotEmpty()
  @IsString()
  cep: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsNumber()
  deliveryId?: number;

  @IsOptional()
  @IsNumber()
  sorting?: number; 
}
