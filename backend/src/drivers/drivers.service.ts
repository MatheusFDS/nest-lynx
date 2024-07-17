import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { Express } from 'express';

@Injectable()
export class DriversService {
  constructor(private prisma: PrismaService) {}

  async create(createDriverDto: CreateDriverDto, tenantId: number) {
    return this.prisma.driver.create({
      data: {
        ...createDriverDto,
        tenantId,
      },
    });
  }

  async findAll(tenantId: number) {
    return this.prisma.driver.findMany({
      where: { tenantId },
    });
  }

  async update(id: number, updateDriverDto: UpdateDriverDto, tenantId: number) {
    const driver = await this.prisma.driver.findUnique({
      where: { id },
    });

    if (!driver || driver.tenantId !== tenantId) {
      throw new NotFoundException('Driver not found');
    }

    return this.prisma.driver.update({
      where: { id },
      data: {
        ...updateDriverDto,
      },
    });
  }

  async remove(id: number, tenantId: number) {
    const driver = await this.prisma.driver.findUnique({
      where: { id, tenantId },
    });

    if (!driver || driver.tenantId !== tenantId) {
      throw new NotFoundException('Driver not found');
    }

    return this.prisma.driver.delete({
      where: { id },
    });
  }

  async findOrdersByDriver(driverId: number) {
    return this.prisma.order.findMany({
      where: { driverId },
    });
  }

  async updateOrderStatus(orderId: number, status: string, driverId: number) {
    return this.prisma.order.updateMany({
      where: { id: orderId, driverId },
      data: { status, updatedAt: new Date() },
    });
  }

  async saveProof(orderId: number, file: Express.Multer.File, driverId: number) {
    const proofUrl = `path/to/your/proof/${file.filename}`;
  
    return this.prisma.deliveryProof.create({
      data: {
        Order: { connect: { id: orderId } }, // Utiliza 'Order' em vez de 'order'
        Driver: { connect: { id: driverId } },
        Tenant: { connect: { id: driverId } }, // Utiliza 'Tenant' em vez de 'tenant'
        proofUrl,
        createdAt: new Date(),
      },
    });
  }
  
  async findPaymentsByDriver(driverId: number) {
    return this.prisma.payment.findMany({
      where: { driverId },
    });
  }
}
