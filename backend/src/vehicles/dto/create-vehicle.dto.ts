import { IsString, IsUUID } from 'class-validator';

export class CreateVehicleDto {
  @IsString()
  model: string;

  @IsString()
  plate: string;

  @IsUUID()
  driverId: string;

  @IsUUID()
  categoryId: string;
}
