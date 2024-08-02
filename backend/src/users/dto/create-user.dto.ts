import { IsString, IsEmail, IsUUID } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  name: string; // Incluindo o campo name

  @IsUUID()
  tenantId: string;

  @IsUUID()
  roleId: string;
}
