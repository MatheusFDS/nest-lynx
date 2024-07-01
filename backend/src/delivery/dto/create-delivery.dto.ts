import { IsNotEmpty, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDeliveryDto {
  @IsNotEmpty()
  @IsNumber()
  motoristaId: number;

  @IsNotEmpty()
  @IsNumber()
  veiculoId: number;

  @IsNotEmpty()
  @IsNumber()
  valorFrete: number;

  @IsNotEmpty()
  @IsNumber()
  totalPeso: number;

  @IsNotEmpty()
  @IsNumber()
  totalValor: number;

  @IsNotEmpty()
  @IsNumber()
  tenantId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Number)
  orders: number[];
}
