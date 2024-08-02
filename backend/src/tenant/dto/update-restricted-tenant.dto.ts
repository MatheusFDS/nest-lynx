import { IsOptional, IsString, IsNumber } from 'class-validator';

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