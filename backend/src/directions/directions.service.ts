import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDirectionsDto } from './dto/create-directions.dto';
import { UpdateDirectionsDto } from './dto/update-directions.dto';

@Injectable()
export class DirectionsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateDirectionsDto, tenantId: string) {
    return this.prisma.directions.create({
      data: {
        ...data,
        tenantId,
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.directions.findMany({ where: { tenantId } });
  }

  async findOne(id: string, tenantId: string) {
    return this.prisma.directions.findFirst({ where: { id, tenantId } });
  }

  async update(id: string, data: UpdateDirectionsDto, tenantId: string) {
    const direction = await this.findOne(id, tenantId);
    return this.prisma.directions.update({
      where: { id: direction.id },
      data,
    });
  }

  async remove(id: string, tenantId: string) {
    const direction = await this.findOne(id, tenantId);
    return this.prisma.directions.delete({
      where: { id: direction.id },
    });
  }
}
