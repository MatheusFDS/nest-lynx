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
}

export class UpdateRestrictedTenantDto {
  @IsOptional()
  @IsString()
  databaseUrl?: string;

  @IsOptional()
  @IsString()
  schema?: string;

  @IsOptional()
  @IsNumber()
  port?: number;
}
