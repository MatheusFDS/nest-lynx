import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles('admin')
  async create(@Body() createUserDto: CreateUserDto, @Req() req) {
    const tenantId = req.user.tenantId;
    return this.usersService.create(createUserDto, tenantId);
  }

  @Get()
  @Roles('admin')
  async findAll(@Req() req) {
    const tenantId = req.user.tenantId;
    return this.usersService.findAll(tenantId);
  }

  @Get(':id')
  @Roles('admin')
  async findOne(@Param('id') id: string, @Req() req) {
    const tenantId = req.user.tenantId;
    return this.usersService.findOne(+id, tenantId);
  }

  @Patch(':id')
  @Roles('admin')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Req() req) {
    const tenantId = req.user.tenantId;
    return this.usersService.update(+id, updateUserDto, tenantId);
  }

  @Delete(':id')
  @Roles('admin')
  async remove(@Param('id') id: string, @Req() req) {
    const tenantId = req.user.tenantId;
    return this.usersService.remove(+id, tenantId);
  }
}
