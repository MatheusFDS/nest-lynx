import { Controller, Post, Body, UseGuards, Req, Get } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';

@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createVehicleDto: CreateVehicleDto, @Req() req) {
    const tenantId = req.user.tenantId;
    return this.vehiclesService.create(createVehicleDto, tenantId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Req() req) {
    const tenantId = req.user.tenantId;
    return this.vehiclesService.findAll(tenantId);
  }
}
