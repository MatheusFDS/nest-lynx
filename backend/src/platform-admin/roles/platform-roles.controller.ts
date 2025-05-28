import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { RolesService } from '../../roles/roles.service';
import { CreateRoleDto } from '../../roles/dto/create-role.dto';
// Se você criar um UpdateRoleDto:
// import { UpdateRoleDto } from '../../roles/dto/update-role.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';

@Controller('platform-admin/roles')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('superadmin')
export class PlatformRolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  async createRole(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.createRoleForPlatform(createRoleDto);
  }

  @Get()
  async findAllRoles() {
    return this.rolesService.findAllForPlatformAdmin();
  }

  @Get(':roleId')
  async findRoleById(@Param('roleId', ParseUUIDPipe) roleId: string) {
    return this.rolesService.findRoleByIdForPlatformAdmin(roleId);
  }

  @Patch(':roleId')
  async updateRole(
    @Param('roleId', ParseUUIDPipe) roleId: string,
    @Body() updateRoleDto: CreateRoleDto, // Ou UpdateRoleDto se criado
  ) {
    return this.rolesService.updateRoleForPlatformAdmin(roleId, updateRoleDto);
  }

  @Delete(':roleId')
  async deleteRole(@Param('roleId', ParseUUIDPipe) roleId: string) {
    return this.rolesService.deleteRoleForPlatformAdmin(roleId);
  }
}