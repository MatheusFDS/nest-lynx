import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { Express } from 'express';

@Injectable()
export class DriversService {
  constructor() {}

  async create(prisma: PrismaClient, createDriverDto: CreateDriverDto, tenantId: number) {
    return prisma.driver.create({
      data: {
        ...createDriverDto,
        tenantId,
      },
    });
  }

  async findAll(prisma: PrismaClient, tenantId: number) {
    return prisma.driver.findMany({
      where: { tenantId },
    });
  }

  async update(prisma: PrismaClient, id: number, updateDriverDto: UpdateDriverDto, tenantId: number) {
    const driver = await prisma.driver.findUnique({
      where: { id },
    });

    if (!driver || driver.tenantId !== tenantId) {
      throw new NotFoundException('Driver not found');
    }

    return prisma.driver.update({
      where: { id },
      data: {
        ...updateDriverDto,
      },
    });
  }

  async remove(prisma: PrismaClient, id: number, tenantId: number) {
    const driver = await prisma.driver.findUnique({
      where: { id, tenantId },
    });

    if (!driver || driver.tenantId !== tenantId) {
      throw new NotFoundException('Driver not found');
    }

    return prisma.driver.delete({
      where: { id },
    });
  }

  async findOrdersByDriver(prisma: PrismaClient, driverId: number) {
    return prisma.order.findMany({
      where: { driverId },
    });
  }

  async updateOrderStatus(prisma: PrismaClient, orderId: number, status: string, driverId: number) {
    return prisma.order.updateMany({
      where: { id: orderId, driverId },
      data: { status, updatedAt: new Date() },
    });
  }

  async saveProof(prisma: PrismaClient, orderId: number, file: Express.Multer.File, driverId: number) {
    const proofUrl = `path/to/your/proof/${file.filename}`;
  
    return prisma.deliveryProof.create({
      data: {
        Order: { connect: { id: orderId } }, // Utiliza 'Order' em vez de 'order'
        Driver: { connect: { id: driverId } },
        Tenant: { connect: { id: driverId } }, // Utiliza 'Tenant' em vez de 'tenant'
        proofUrl,
        createdAt: new Date(),
      },
    });
  }
  
  async findPaymentsByDriver(prisma: PrismaClient, driverId: number) {
    return prisma.payment.findMany({
      where: { driverId },
    });
  }
}
