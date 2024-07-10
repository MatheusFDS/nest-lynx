import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Logger } from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { UpdateDeliveryDto } from './dto/update-delivery.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('delivery')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DeliveryController {
  private readonly logger = new Logger(DeliveryController.name);

  constructor(private readonly deliveryService: DeliveryService) {}

  @Post()
  async create(@Body() createDeliveryDto: CreateDeliveryDto, @Req() req) {
    const tenantId = req.user.tenantId;
    this.logger.log(`Creating delivery with data: ${JSON.stringify(createDeliveryDto)} for tenant: ${tenantId}`);
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

  @Patch(':id/remove-order/:orderId')
  async removeOrderFromDelivery(@Param('id') id: string, @Param('orderId') orderId: string, @Req() req) {
    const tenantId = req.user.tenantId;
    return this.deliveryService.removeOrderFromDelivery(+id, +orderId, tenantId);
  }

  @Patch(':id/release')
  @Roles('admin')
  async releaseDelivery(@Param('id') id: string, @Req() req) {
    const tenantId = req.user.tenantId;
    return this.deliveryService.release(+id, tenantId);
  }
}
