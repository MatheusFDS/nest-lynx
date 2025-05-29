// Em src/orders/orders.controller.ts

import { Controller, Post, Body, UseGuards, Req, Get, Param, NotFoundException } from '@nestjs/common'; // Adicione Param e NotFoundException
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Assumindo que está no diretório auth
import { Order } from '@prisma/client';
import { OrderHistoryEventDto } from './dto/order-history-event.dto'; // Importe o DTO

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

  // NOVA ROTA PARA HISTÓRICO DO PEDIDO
  @Get(':id/history')
  async findOrderHistory(
    @Param('id') id: string,
    @Req() req,
  ): Promise<OrderHistoryEventDto[]> {
    const tenantId = req.user.tenantId;
    const history = await this.ordersService.findOrderHistory(id, tenantId);
    // O serviço já lança NotFoundException se o pedido não for encontrado
    return history;
  }
}