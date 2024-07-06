import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';

export class CreatePaymentDto {
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  status: string;

  @IsNumber()
  @IsNotEmpty()
  tenantId: number;

  @IsNumber()
  @IsNotEmpty()
  motoristaId: number;

  @IsNumber()
  @IsOptional()
  deliveryId?: number;
}
