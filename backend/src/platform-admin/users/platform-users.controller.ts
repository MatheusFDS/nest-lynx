import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseUUIDPipe, Query } from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { CreateUserDto } from '../../users/dto/create-user.dto';
import { UpdateUserDto } from '../../users/dto/update-user.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';

@Controller('platform-admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('superadmin')
export class PlatformUsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('platform-admin')
  async createPlatformAdmin(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createPlatformAdminUser(createUserDto);
  }

  @Post('tenant-user')
  async createTenantUser(
    @Body() createUserDto: CreateUserDto,
    @Query('tenantId', ParseUUIDPipe) tenantId: string,
  ) {
    return this.usersService.create(createUserDto, tenantId);
  }

  @Get()
  async findAllUsers(@Query('tenantId') tenantId?: string) {
    if (tenantId) {
      return this.usersService.findAllUsersInTenantByPlatformAdmin(tenantId);
    }
    return this.usersService.findAllPlatformAdminUsers();
  }

  @Get(':userId')
  async findUserById(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.usersService.findUserByIdByPlatformAdmin(userId);
  }

  @Patch(':userId')
  async updateUser(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateUserByPlatformAdmin(userId, updateUserDto);
  }

  @Delete(':userId')
  async deleteUser(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.usersService.deleteUserByPlatformAdmin(userId);
  }
}