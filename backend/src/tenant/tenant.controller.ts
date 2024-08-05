import { Controller, Get, Put, Body, Param, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { UpdateTenantDto } from './dto/update-tenant.dto';
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
    return this.tenantService.getTenants(tenantId);
  }

  @Put(':tenantId')
  @Roles('admin')
  async updateTenant(@Req() req: Request, @Param('tenantId') tenantId: string, @Body() updateTenantDto: UpdateTenantDto) {
    const userId = req.user.userId;
    try {
      return this.tenantService.updateTenant(userId, tenantId, updateTenantDto);
    } catch (error) {
      console.error('Error updating tenant:', error);
      throw new BadRequestException('Error updating tenant');
    }
  }
}
