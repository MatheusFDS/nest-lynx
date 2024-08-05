import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('vehicles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  async create(@Body() createVehicleDto: CreateVehicleDto, @Req() req) {
    const tenantId = req.user.tenantId;
    return this.vehiclesService.create(createVehicleDto, tenantId);
  }

  @Get()
  async findAll(@Req() req) {
    const tenantId = req.user.tenantId;
    return this.vehiclesService.findAll(tenantId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req) {
    const tenantId = req.user.tenantId;
    return this.vehiclesService.findOne(id, tenantId);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateVehicleDto: UpdateVehicleDto, @Req() req) {
    const tenantId = req.user.tenantId;
    return this.vehiclesService.update(id, updateVehicleDto, tenantId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req) {
    const tenantId = req.user.tenantId;
    return this.vehiclesService.remove(id, tenantId);
  }
}
