import { Controller, Post, Body, UseGuards, Req, Get } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Order } from '@prisma/client'; // Use o tipo correto do Prisma

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('upload')
  async upload(@Body() orders: Order[], @Req() req) {
    const tenantId = req.user.tenantId;
    return this.ordersService.upload(orders, tenantId);
  }

  @Get()
  async findAll(@Req() req) {
    const tenantId = req.user.tenantId;
    return this.ordersService.findAll(tenantId);
  }
}