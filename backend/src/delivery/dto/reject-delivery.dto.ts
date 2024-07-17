import { IsString } from 'class-validator';

export class RejectDeliveryDto {
  @IsString()
  motivo: string;
}
