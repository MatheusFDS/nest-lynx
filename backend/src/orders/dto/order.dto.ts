import { IsNumber, IsOptional, IsString } from 'class-validator';

export class OrderDto {
  @IsNumber()
  id: number;

  @IsString()
  cliente: string;

  @IsString()
  numero: string;

  @IsOptional()
  @IsNumber()
  sorting?: number; 
}
