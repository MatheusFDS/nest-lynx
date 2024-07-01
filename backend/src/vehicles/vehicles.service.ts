import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(private prisma: PrismaService) {}

  async create(createVehicleDto: CreateVehicleDto, tenantId: number) {
    return this.prisma.vehicle.create({
      data: {
        model: createVehicleDto.model,
        plate: createVehicleDto.plate,
        driverId: createVehicleDto.driverId,
        tenantId: tenantId,
        categoryId: createVehicleDto.categoryId,
      },
    });
  }

  async findAll(tenantId: number) {
    return this.prisma.vehicle.findMany({ where: { tenantId } });
  }

  async findOne(id: number, tenantId: number) {
    return this.prisma.vehicle.findFirst({ where: { id, tenantId } });
  }

  async update(id: number, updateVehicleDto: UpdateVehicleDto, tenantId: number) {
    return this.prisma.vehicle.update({
      where: { id, tenantId },
      data: updateVehicleDto,
    });
  }

  async remove(id: number, tenantId: number) {
    return this.prisma.vehicle.delete({ where: { id, tenantId } });
  }
}
