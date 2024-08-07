import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateTenantDto, UpdateRestrictedTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class TenantService {
  constructor(private prisma: PrismaService) {}

  async getTenants(tenantId: string) {
    return this.prisma.tenant.findMany({
      where: { id: tenantId },
    });
  }

  async updateTenant(userId: string, tenantId: string, data: UpdateTenantDto) {
    
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { tenant: true, role: true },
    });

    if (!user) {
      throw new ForbiddenException('User not found.');
    }

    if (user.tenantId !== tenantId) {
      throw new ForbiddenException('You can only update your own tenant.');
    }

    return this.prisma.tenant.update({
      where: { id: tenantId },
      data,
    });
  }

  async updateRestrictedTenant(userId: string, tenantId: string, data: UpdateRestrictedTenantDto) {
   
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user) {
      throw new ForbiddenException('User not found.');
    }

    if (user.role.name !== 'admin') {
      throw new ForbiddenException('Only admins can update restricted fields.');
    }

    return this.prisma.tenant.update({
      where: { id: tenantId },
      data,
    });
  }
}
