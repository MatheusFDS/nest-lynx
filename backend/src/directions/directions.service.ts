import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDirectionsDto } from './dto/create-directions.dto';
import { UpdateDirectionsDto } from './dto/update-directions.dto';

@Injectable()
export class DirectionsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateDirectionsDto, tenantId: number) {
    return this.prisma.directions.create({
      data: {
        ...data,
        tenantId,
      },
    });
  }

  async findAll(tenantId: number) {
    return this.prisma.directions.findMany({ where: { tenantId } });
  }

  async findOne(id: number, tenantId: number) {
    return this.prisma.directions.findFirst({ where: { id, tenantId } });
  }

  async update(id: number, data: UpdateDirectionsDto, tenantId: number) {
    const direction = await this.findOne(id, tenantId);
    return this.prisma.directions.update({
      where: { id: direction.id },
      data,
    });
  }

  async remove(id: number, tenantId: number) {
    const direction = await this.findOne(id, tenantId);
    return this.prisma.directions.delete({
      where: { id: direction.id },
    });
  }
}
