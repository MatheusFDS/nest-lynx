import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';

export class UpdateTenantDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsNumber()
  minDeliveryPercentage?: number;  // Certifique-se de que isso está validado como número

  @IsOptional()
  @IsNumber()
  minValue?: number;

  @IsOptional()
  @IsNumber()
  minOrders?: number;

  @IsOptional()
  @IsNumber()
  minPeso?: number;
}
