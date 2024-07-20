import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { UpdateTenantDto, UpdateRestrictedTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class TenantService {
  constructor() {}

  async getTenants(prisma: PrismaClient, tenantId: number) {
    return prisma.tenant.findMany({
      where: { id: tenantId },
    });
  }

  async updateTenant(prisma: PrismaClient, userId: number, tenantId: number, data: UpdateTenantDto) {
    console.log('updateTenant - userId:', userId, 'tenantId:', tenantId); // Logging para depuração
    console.log('updateTenant - data:', data); // Logging para depuração

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { tenant: true, role: true },
    });

    if (!user) {
      throw new ForbiddenException('User not found.');
    }

    if (user.tenantId !== tenantId) {
      throw new ForbiddenException('You can only update your own tenant.');
    }

    return prisma.tenant.update({
      where: { id: tenantId },
      data,
    });
  }

  async updateRestrictedTenant(prisma: PrismaClient, userId: number, tenantId: number, data: UpdateRestrictedTenantDto) {
    console.log('updateRestrictedTenant - userId:', userId, 'tenantId:', tenantId); // Logging para depuração
    console.log('updateRestrictedTenant - data:', data); // Logging para depuração

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user) {
      throw new ForbiddenException('User not found.');
    }

    if (user.role.name !== 'admin') {
      throw new ForbiddenException('Only admins can update restricted fields.');
    }

    return prisma.tenant.update({
      where: { id: tenantId },
      data,
    });
  }
}
