import { IsArray, IsInt } from 'class-validator';

export class CreateGroupPaymentDto {
  @IsArray()
  @IsInt({ each: true })
  paymentIds: number[];
}
