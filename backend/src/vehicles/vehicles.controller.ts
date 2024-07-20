import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Request } from 'express';

@Controller('vehicles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  @Roles('admin')
  async create(@Body() createVehicleDto: CreateVehicleDto, @Req() req: Request) {
    const prisma = req.prisma; // Obtendo o PrismaClient configurado dinamicamente
    const tenantId = req.user.tenantId;
    return this.vehiclesService.create(prisma, createVehicleDto, tenantId);
  }

  @Get()
  async findAll(@Req() req: Request) {
    const prisma = req.prisma; // Obtendo o PrismaClient configurado dinamicamente
    const tenantId = req.user.tenantId;
    return this.vehiclesService.findAll(prisma, tenantId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: Request) {
    const prisma = req.prisma; // Obtendo o PrismaClient configurado dinamicamente
    const tenantId = req.user.tenantId;
    return this.vehiclesService.findOne(prisma, +id, tenantId);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateVehicleDto: UpdateVehicleDto, @Req() req: Request) {
    const prisma = req.prisma; // Obtendo o PrismaClient configurado dinamicamente
    const tenantId = req.user.tenantId;
    return this.vehiclesService.update(prisma, +id, updateVehicleDto, tenantId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Request) {
    const prisma = req.prisma; // Obtendo o PrismaClient configurado dinamicamente
    const tenantId = req.user.tenantId;
    return this.vehiclesService.remove(prisma, +id, tenantId);
  }
}
