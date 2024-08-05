import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateTenantDto } from './dto/update-tenant.dto';

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
      include: { tenant: true },
    });

    if (!user) {
      throw new ForbiddenException('User not found.');
    }

    if (user.tenantId !== tenantId) {
      throw new ForbiddenException('You can only update your own tenant.');
    }

    try {
      return this.prisma.tenant.update({
        where: { id: tenantId },
        data,
      });
    } catch (error) {
      console.error('Error updating tenant in database:', error);
      throw new BadRequestException('Error updating tenant in database');
    }
  }
}
