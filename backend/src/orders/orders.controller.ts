import { Controller, Post, Body, UseGuards, Req, Get } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Order } from '@prisma/client'; // Use o tipo correto do Prisma
import { Request } from 'express';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('upload')
  async upload(@Body() orders: Order[], @Req() req: Request) {
    const tenantId = req.user.tenantId;
    const prisma = req.prisma; // Obtendo o PrismaClient configurado dinamicamente
    return this.ordersService.upload(prisma, orders, tenantId);
  }

  @Get()
  async findAll(@Req() req: Request) {
    const tenantId = req.user.tenantId;
    const prisma = req.prisma; // Obtendo o PrismaClient configurado dinamicamente
    return this.ordersService.findAll(prisma, tenantId);
  }
}
