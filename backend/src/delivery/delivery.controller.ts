import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { UpdateDeliveryDto } from './dto/update-delivery.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('delivery')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  @Post()
  async create(@Body() createDeliveryDto: CreateDeliveryDto, @Req() req) {
    const tenantId = req.user.tenantId;
    return this.deliveryService.create(createDeliveryDto, tenantId);
  }

  @Get()
  async findAll(@Req() req) {
    const tenantId = req.user.tenantId;
    return this.deliveryService.findAll(tenantId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req) {
    const tenantId = req.user.tenantId;
    return this.deliveryService.findOne(+id, tenantId);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateDeliveryDto: UpdateDeliveryDto, @Req() req) {
    const tenantId = req.user.tenantId;
    return this.deliveryService.update(+id, updateDeliveryDto, tenantId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req) {
    const tenantId = req.user.tenantId;
    return this.deliveryService.remove(+id, tenantId);
  }
}
