import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor() {}

  async create(prisma: PrismaClient, createVehicleDto: CreateVehicleDto, tenantId: number) {
    return prisma.vehicle.create({
      data: {
        model: createVehicleDto.model,
        plate: createVehicleDto.plate,
        driverId: createVehicleDto.driverId,
        tenantId: tenantId,
        categoryId: createVehicleDto.categoryId,
      },
    });
  }

  async findAll(prisma: PrismaClient, tenantId: number) {
    return prisma.vehicle.findMany({ where: { tenantId } });
  }

  async findOne(prisma: PrismaClient, id: number, tenantId: number) {
    return prisma.vehicle.findFirst({ where: { id, tenantId } });
  }

  async update(prisma: PrismaClient, id: number, updateVehicleDto: UpdateVehicleDto, tenantId: number) {
    return prisma.vehicle.update({
      where: { id },
      data: {
        ...updateVehicleDto,
        tenantId,
      },
    });
  }

  async remove(prisma: PrismaClient, id: number, tenantId: number) {
    return prisma.vehicle.delete({ where: { id, tenantId } });
  }
}
