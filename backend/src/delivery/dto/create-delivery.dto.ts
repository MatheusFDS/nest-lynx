import { IsNumber, IsArray, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderDto } from '../../orders/dto/order.dto';

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
  @Type(() => OrderDto)
  orders: OrderDto[];
}
