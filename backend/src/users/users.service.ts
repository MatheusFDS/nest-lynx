import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { Prisma, PrismaClient } from '@prisma/client';

type PrismaTransactionalClient = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;

@Injectable()
export class UsersService {
  activate(id: string, tenantId: any) {
    throw new Error('Method not implemented.');
  }
  constructor(private prisma: PrismaService) {}

  async create(data: CreateUserDto, tenantId: string) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
        tenantId,
      },
    });
  }

  async createWithinTransaction(data: CreateUserDto, tenantId: string, prismaTx: PrismaTransactionalClient) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return prismaTx.user.create({
      data: {
        ...data,
        password: hashedPassword,
        tenantId,
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.user.findMany({ where: { tenantId } });
  }

  async findOne(id: string, tenantId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user || user.tenantId !== tenantId) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado no tenant ${tenantId}`);
    }
    return user;
  }

  async update(id: string, data: UpdateUserDto, tenantId: string) {
    const userToUpdate = await this.prisma.user.findUnique({ where: { id } });

    if (!userToUpdate || userToUpdate.tenantId !== tenantId) {
      throw new BadRequestException('Usuário não encontrado ou não pertence a este tenant');
    }

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, tenantId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user || user.tenantId !== tenantId) {
      throw new BadRequestException('Usuário não encontrado ou não pertence a este tenant');
    }

    return this.prisma.$transaction(async (prismaTx) => {
      await prismaTx.userSettings.deleteMany({
        where: { userId: id },
      });
      return prismaTx.user.delete({
        where: { id },
      });
    });
  }

  async createPlatformAdminUser(data: CreateUserDto, prismaTx?: PrismaTransactionalClient) {
    const prismaClient = prismaTx || this.prisma;
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    const platformAdminRole = await prismaClient.role.findUnique({
        where: { name: 'superadmin' }
    });

    if(!platformAdminRole) {
        throw new BadRequestException('Role superadmin não encontrada.');
    }
    if(data.roleId !== platformAdminRole.id) {
        throw new BadRequestException('Usuário da plataforma deve ter a role superadmin.');
    }

    return prismaClient.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        roleId: data.roleId,
        tenantId: null,
      },
    });
  }

  async findAllPlatformAdminUsers() {
    return this.prisma.user.findMany({
      where: { tenantId: null, role: { isPlatformRole: true } },
      include: { role: true }
    });
  }
  
  async findAllUsersInTenantByPlatformAdmin(targetTenantId: string) {
    return this.prisma.user.findMany({
      where: { tenantId: targetTenantId },
      include: { role: true }
    });
  }

  async findUserByIdByPlatformAdmin(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true, tenant: true }
    });
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${userId} não encontrado.`);
    }
    return user;
  }

  async updateUserByPlatformAdmin(userId: string, data: UpdateUserDto) {
    const userToUpdate = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!userToUpdate) {
      throw new NotFoundException(`Usuário com ID ${userId} não encontrado.`);
    }

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    
    if (data.tenantId !== undefined && userToUpdate.tenantId !== data.tenantId) {
        throw new BadRequestException('Não é permitido alterar o tenantId de um usuário por este método.');
    }
    if (data.tenantId === undefined) {
        delete data.tenantId; 
    }


    return this.prisma.user.update({
      where: { id: userId },
      data,
    });
  }

 async deleteUserByPlatformAdmin(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${userId} não encontrado.`);
    }

    return this.prisma.$transaction(async (prismaTx) => {
      await prismaTx.userSettings.deleteMany({
        where: { userId: userId }, // Correção: era 'id', mudou para 'userId'
      });
      return prismaTx.user.delete({
        where: { id: userId },
      });
    });
  }
}
