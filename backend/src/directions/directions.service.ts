import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateDirectionsDto } from './dto/create-directions.dto';
import { UpdateDirectionsDto } from './dto/update-directions.dto';

@Injectable()
export class DirectionsService {
  constructor() {}

  async create(prisma: PrismaClient, data: CreateDirectionsDto, tenantId: number) {
    return prisma.directions.create({
      data: {
        ...data,
        tenantId,
      },
    });
  }

  async findAll(prisma: PrismaClient, tenantId: number) {
    return prisma.directions.findMany({ where: { tenantId } });
  }

  async findOne(prisma: PrismaClient, id: number, tenantId: number) {
    return prisma.directions.findFirst({ where: { id, tenantId } });
  }

  async update(prisma: PrismaClient, id: number, data: UpdateDirectionsDto, tenantId: number) {
    const direction = await this.findOne(prisma, id, tenantId);
    return prisma.directions.update({
      where: { id: direction.id },
      data,
    });
  }

  async remove(prisma: PrismaClient, id: number, tenantId: number) {
    const direction = await this.findOne(prisma, id, tenantId);
    return prisma.directions.delete({
      where: { id: direction.id },
    });
  }
}
