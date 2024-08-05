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
   // console.log('getTenants - req.user:', req.user); // Log para verificar req.user
    const tenantId = req.user.tenantId;
    return this.tenantService.getTenants(tenantId);
  }

  @Put(':tenantId')
  async updateTenant(@Req() req: Request, @Param('tenantId') tenantId: string, @Body() updateTenantDto: UpdateTenantDto) {
   // console.log('updateTenant - req.user:', req.user); // Log para verificar req.user
//console.log('updateTenant - updateTenantDto:', updateTenantDto); // Log para verificar os dados recebidos
    const userId = req.user.userId;
    return this.tenantService.updateTenant(userId, tenantId, updateTenantDto);
  }

  @Put('restricted/:tenantId')
  @Roles('admin')
  async updateRestrictedTenant(@Req() req: Request, @Param('tenantId') tenantId: string, @Body() updateRestrictedTenantDto: UpdateRestrictedTenantDto) {
    const userId = req.user.userId;
    return this.tenantService.updateRestrictedTenant(userId, tenantId, updateRestrictedTenantDto);
  }
}
