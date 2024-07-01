import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(private prisma: PrismaService) {}

  async create(createVehicleDto: CreateVehicleDto, tenantId: number) {
    // Verificar se o driver pertence ao mesmo tenant
    const driver = await this.prisma.driver.findFirst({
      where: { id: createVehicleDto.driverId, tenantId },
    });

    if (!driver) {
      throw new BadRequestException('Driver does not belong to this tenant');
    }

    // Verificar se a placa já existe no mesmo tenant
    const existingVehicle = await this.prisma.vehicle.findFirst({
      where: {
        plate: createVehicleDto.plate,
        tenantId,
      },
    });

    if (existingVehicle) {
      throw new BadRequestException('Plate already exists in this tenant');
    }

    return this.prisma.vehicle.create({
      data: {
        model: createVehicleDto.model,
        plate: createVehicleDto.plate,
        driverId: createVehicleDto.driverId,
        tenantId: tenantId // Passar o tenantId diretamente
      },
    });
  }

  async findAll(tenantId: number) {
    return this.prisma.vehicle.findMany({
      where: {
        tenantId,
      },
      include: { Driver: true },
    });
  }
}
