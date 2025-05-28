import { Injectable, ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class TenantService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
  ) {}

  async getTenants(requestingUserTenantId: string) {
    return this.prisma.tenant.findUnique({
      where: { id: requestingUserTenantId },
    });
  }

  async updateTenant(requestingUserId: string, tenantToUpdateId: string, data: UpdateTenantDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: requestingUserId },
      select: { tenantId: true }
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    if (user.tenantId !== tenantToUpdateId) {
      throw new ForbiddenException('You can only update your own tenant.');
    }

    try {
      return this.prisma.tenant.update({
        where: { id: tenantToUpdateId },
        data,
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Tenant with ID ${tenantToUpdateId} not found.`);
      }
      throw new BadRequestException('Error updating tenant in database');
    }
  }

async createTenantByPlatformAdmin(createTenantDto: CreateTenantDto, prismaTx?: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">) {
    const { name, email: adminEmail, address, ...restOfTenantData } = createTenantDto;
    const prismaClient = prismaTx || this.prisma;

    const tenantAdminRole = await prismaClient.role.findUnique({
      where: { name: 'admin' },
    });

    if (!tenantAdminRole) {
      throw new BadRequestException('Default tenant admin role (admin) not found.');
    }
    
    const newTenant = await prismaClient.tenant.create({
      data: {
        name,
        address,
        ...restOfTenantData
      },
    });

    const initialAdminPassword = 'TemporaryPassword123!';

    const adminUserData: CreateUserDto = {
      email: adminEmail,
      password: initialAdminPassword,
      name: `${name} Admin`,
      roleId: tenantAdminRole.id,
      tenantId: newTenant.id, // Correção: Adicionado tenantId para satisfazer CreateUserDto
    };
    
    if (prismaTx) {
        await this.usersService.createWithinTransaction(adminUserData, newTenant.id, prismaTx);
    } else {
        await this.usersService.create(adminUserData, newTenant.id);
    }

    return newTenant;
  }


  async createTenantByPlatformAdminWithTransaction(createTenantDto: CreateTenantDto) {
    return this.prisma.$transaction(async (tx) => {
        return this.createTenantByPlatformAdmin(createTenantDto, tx);
    });
  }

  async getAllTenantsByPlatformAdmin() {
    return this.prisma.tenant.findMany();
  }

  async getTenantByIdByPlatformAdmin(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${tenantId} not found.`);
    }
    return tenant;
  }

  async updateTenantByPlatformAdmin(tenantId: string, updateTenantDto: UpdateTenantDto) {
    try {
      return await this.prisma.tenant.update({
        where: { id: tenantId },
        data: updateTenantDto,
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Tenant with ID ${tenantId} not found.`);
      }
      throw new BadRequestException('Error updating tenant.');
    }
  }

  async deleteTenantByPlatformAdmin(tenantId: string) {
    try {
      return await this.prisma.tenant.delete({
        where: { id: tenantId },
      });
    } catch (error) {
       if (error.code === 'P2025') {
        throw new NotFoundException(`Tenant with ID ${tenantId} not found.`);
      } else if (error.code === 'P2003' || error.code === 'P2014' ) {
        throw new BadRequestException(`Cannot delete tenant with ID ${tenantId} due to existing related records.`);
      }
      throw new BadRequestException('Error deleting tenant.');
    }
  }
}