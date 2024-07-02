import { Controller, Post, Body, UseGuards, Req, Get, Patch, Delete, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DriversService } from './drivers.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';

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

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDriverDto: UpdateDriverDto, @Req() req) {
    const tenantId = req.user.tenantId;
    return this.driversService.update(Number(id), updateDriverDto, tenantId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    const tenantId = req.user.tenantId;
    return this.driversService.remove(Number(id), tenantId);
  }
}
