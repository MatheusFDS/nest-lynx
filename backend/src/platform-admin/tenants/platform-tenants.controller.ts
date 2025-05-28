import { Controller, Post, Get, Param, Body, UseGuards, Put, Delete, ParseUUIDPipe } from '@nestjs/common';
import { TenantService } from '../../tenant/tenant.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { CreateTenantDto } from '../../tenant/dto/create-tenant.dto';
import { UpdateTenantDto } from '../../tenant/dto/update-tenant.dto';

@Controller('platform-admin/tenants')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('superadmin')
export class PlatformTenantsController {
  constructor(private readonly tenantService: TenantService) {}

  @Post()
  async createTenant(@Body() createTenantDto: CreateTenantDto) {
    return this.tenantService.createTenantByPlatformAdminWithTransaction(createTenantDto);
  }

  @Get()
  async getAllTenants() {
    return this.tenantService.getAllTenantsByPlatformAdmin();
  }

  @Get(':tenantId')
  async getTenantById(@Param('tenantId', ParseUUIDPipe) tenantId: string) {
    return this.tenantService.getTenantByIdByPlatformAdmin(tenantId);
  }

  @Put(':tenantId')
  async updateTenant(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Body() updateTenantDto: UpdateTenantDto,
  ) {
    return this.tenantService.updateTenantByPlatformAdmin(tenantId, updateTenantDto);
  }

  @Delete(':tenantId')
  async deleteTenant(@Param('tenantId', ParseUUIDPipe) tenantId: string) {
    return this.tenantService.deleteTenantByPlatformAdmin(tenantId);
  }
}