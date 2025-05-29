// Proposta para: src/delivery/dto/create-delivery.dto.ts (Backend)
import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

class OrderReferenceDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsNumber()
  @IsOptional()
  sorting?: number;
}

export class CreateDeliveryDto {
  @IsString()
  @IsNotEmpty()
  motoristaId: string;

  @IsString()
  @IsNotEmpty()
  veiculoId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => OrderReferenceDto)
  orders: OrderReferenceDto[]; // Agora espera apenas {id, sorting}

  @IsString()
  @IsOptional()
  observacao?: string;

  // Os campos valorFrete, totalPeso, totalValor e tenantId
  // foram removidos, pois serão tratados pelo backend.
}