export class CreateUserDto {
  email: string;
  password: string;
  name: string; // Incluindo o campo name
  tenantId: number;
  roleId: number;
}