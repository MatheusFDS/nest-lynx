import { IsString, IsNumber, IsArray, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderDto } from '../../orders/dto/order.dto';

export class CreateDeliveryDto {
  @IsNotEmpty()
  @IsString()
  motoristaId: string;

  @IsNotEmpty()
  @IsString()
  veiculoId: string;

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
  @IsString()
  tenantId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderDto)
  orders: OrderDto[];
}
