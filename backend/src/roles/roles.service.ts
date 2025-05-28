import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
// Se você criar um UpdateRoleDto, importe-o aqui
// import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async createRoleForPlatform(createRoleDto: CreateRoleDto) {
    const existingRole = await this.prisma.role.findUnique({
      where: { name: createRoleDto.name },
    });

    if (existingRole) {
      throw new BadRequestException(`Role com nome '${createRoleDto.name}' já existe.`);
    }

    return this.prisma.role.create({
      data: createRoleDto,
    });
  }

  async findAll() {
    return this.prisma.role.findMany({
        where: { isPlatformRole: false } // Modificado para retornar apenas roles de tenant por padrão
    });
  }

  async findAllForPlatformAdmin() {
    return this.prisma.role.findMany();
  }

  async findRoleByIdForPlatformAdmin(roleId: string) {
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });
    if (!role) {
      throw new NotFoundException(`Role com ID ${roleId} não encontrada.`);
    }
    return role;
  }

  async updateRoleForPlatformAdmin(roleId: string, updateRoleDto: CreateRoleDto /* ou UpdateRoleDto */) {
    const roleExists = await this.prisma.role.findUnique({
        where: { id: roleId },
    });
    if (!roleExists) {
        throw new NotFoundException(`Role com ID ${roleId} não encontrada.`);
    }

    if (updateRoleDto.name && updateRoleDto.name !== roleExists.name) {
        const anotherRoleWithSameName = await this.prisma.role.findUnique({
            where: { name: updateRoleDto.name },
        });
        if (anotherRoleWithSameName) {
            throw new BadRequestException(`Outra role com nome '${updateRoleDto.name}' já existe.`);
        }
    }

    try {
      return await this.prisma.role.update({
        where: { id: roleId },
        data: updateRoleDto,
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Role com ID ${roleId} não encontrada.`);
      }
      throw new BadRequestException('Erro ao atualizar a role.');
    }
  }

  async deleteRoleForPlatformAdmin(roleId: string) {
    const role = await this.prisma.role.findUnique({
        where: { id: roleId },
        include: { users: true }
    });

    if (!role) {
      throw new NotFoundException(`Role com ID ${roleId} não encontrada.`);
    }

    if (role.users && role.users.length > 0) {
        throw new BadRequestException(`Role com ID ${roleId} não pode ser deletada pois está associada a ${role.users.length} usuário(s).`);
    }

    try {
      return await this.prisma.role.delete({
        where: { id: roleId },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Role com ID ${roleId} não encontrada.`);
      }
      throw new BadRequestException('Erro ao deletar a role.');
    }
  }
}