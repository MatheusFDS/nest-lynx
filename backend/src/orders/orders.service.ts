import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async upload(orders: any[], tenantId: number) {
    const createdOrders = [];
    for (const order of orders) {
      const createdOrder = await this.prisma.order.create({
        data: {
          ...order,
          tenantId,
        },
      });
      createdOrders.push(createdOrder);
    }
    return createdOrders;
  }

  async findAll(tenantId: number) {
    return this.prisma.order.findMany({
      where: { tenantId },
      include: {
        Delivery: {
          include: {
            Driver: true,
          },
        },
      },
    });
  }
}
