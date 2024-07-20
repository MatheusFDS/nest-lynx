import { Controller, Get, Put, Body, Param, UseGuards, Req } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { UpdateTenantDto, UpdateRestrictedTenantDto } from './dto/update-tenant.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Request } from 'express';

@Controller('tenant')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Get()
  async getTenants(@Req() req: Request) {
    const tenantId = req.user.tenantId;
    const prisma = req.prisma; // Obtendo o PrismaClient configurado dinamicamente
    return this.tenantService.getTenants(prisma, tenantId);
  }

  @Put(':tenantId')
  async updateTenant(@Req() req: Request, @Param('tenantId') tenantId: string, @Body() updateTenantDto: UpdateTenantDto) {
    const userId = req.user.userId;
    const prisma = req.prisma; // Obtendo o PrismaClient configurado dinamicamente
    return this.tenantService.updateTenant(prisma, userId, parseInt(tenantId), updateTenantDto);
  }

  @Put('restricted/:tenantId')
  @Roles('admin')
  async updateRestrictedTenant(@Req() req: Request, @Param('tenantId') tenantId: string, @Body() updateRestrictedTenantDto: UpdateRestrictedTenantDto) {
    const userId = req.user.userId;
    const prisma = req.prisma; // Obtendo o PrismaClient configurado dinamicamente
    return this.tenantService.updateRestrictedTenant(prisma, userId, parseInt(tenantId), updateRestrictedTenantDto);
  }
}
