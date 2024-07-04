// create a new file named order.dto.ts or add it in the same file

import { IsNumber, IsString } from 'class-validator';

export class OrderDto {
  @IsNumber()
  id: number;

  @IsString()
  cliente: string;

  @IsString()
  numero: string;
}
