import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateOrderDto, tenantId: number) {
    return this.prisma.order.create({
      data: {
        ...data,
        tenantId,
      },
    });
  }

  async findAll(tenantId: number) {
    return this.prisma.order.findMany({ where: { tenantId } });
  }

  async findOne(id: number, tenantId: number) {
    const order = await this.prisma.order.findFirst({ where: { id, tenantId } });
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found for tenant ${tenantId}`);
    }
    return order;
  }

  async update(id: number, data: UpdateOrderDto, tenantId: number) {
    const order = await this.findOne(id, tenantId);
    return this.prisma.order.update({
      where: { id: order.id },
      data,
    });
  }

  async remove(id: number, tenantId: number) {
    const order = await this.findOne(id, tenantId);
    return this.prisma.order.delete({
      where: { id: order.id },
    });
  }
}
