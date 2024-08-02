import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';

@Injectable()
export class DriversService {
  constructor(private prisma: PrismaService) {}

  async create(createDriverDto: CreateDriverDto, tenantId: string) {
    return this.prisma.driver.create({
      data: {
        ...createDriverDto,
        tenantId,
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.driver.findMany({
      where: { tenantId },
    });
  }

  async update(id: string, updateDriverDto: UpdateDriverDto, tenantId: string) {
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

  async remove(id: string, tenantId: string) {
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

  async findOrdersByDriver(driverId: string) {
    return this.prisma.order.findMany({
      where: { driverId },
    });
  }

  async updateOrderStatus(orderId: string, status: string, driverId: string) {
    return this.prisma.order.updateMany({
      where: { id: orderId, driverId },
      data: { status, updatedAt: new Date() },
    });
  }

  async saveProof(orderId: string, file: Express.Multer.File, driverId: string) {
    const proofUrl = `path/to/your/proof/${file.filename}`;
  
    return this.prisma.deliveryProof.create({
      data: {
        Order: { connect: { id: orderId } },
        Driver: { connect: { id: driverId } },
        Tenant: { connect: { id: driverId } },
        proofUrl,
        createdAt: new Date(),
      },
    });
  }
  
  async findPaymentsByDriver(driverId: string) {
    return this.prisma.payment.findMany({
      where: { driverId },
    });
  }
}
