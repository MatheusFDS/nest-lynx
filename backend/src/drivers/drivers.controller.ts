import { Controller, Post, Body, UseGuards, Req, Get } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DriversService } from './drivers.service';
import { CreateDriverDto } from './dto/create-driver.dto';

@Controller('drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createDriverDto: CreateDriverDto, @Req() req) {
    const tenantId = req.user.tenantId;
    return this.driversService.create(createDriverDto, tenantId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Req() req) {
    const tenantId = req.user.tenantId;
    return this.driversService.findAll(tenantId);
  }
}
