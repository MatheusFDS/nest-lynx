import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { DirectionsService } from './directions.service';
import { CreateDirectionsDto } from './dto/create-directions.dto';
import { UpdateDirectionsDto } from './dto/update-directions.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('directions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DirectionsController {
  constructor(private readonly directionsService: DirectionsService) {}

  @Post()
  async create(@Body() createDirectionsDto: CreateDirectionsDto, @Req() req) {
    const tenantId = req.user.tenantId;
    return this.directionsService.create(createDirectionsDto, tenantId);
  }

  @Get()
  async findAll(@Req() req) {
    const tenantId = req.user.tenantId;
    return this.directionsService.findAll(tenantId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req) {
    const tenantId = req.user.tenantId;
    return this.directionsService.findOne(+id, tenantId);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateDirectionsDto: UpdateDirectionsDto, @Req() req) {
    const tenantId = req.user.tenantId;
    return this.directionsService.update(+id, updateDirectionsDto, tenantId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req) {
    const tenantId = req.user.tenantId;
    return this.directionsService.remove(+id, tenantId);
  }
}
