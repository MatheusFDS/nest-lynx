import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';

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
      where: { id, tenantId },
    });

    if (!driver) {
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

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    return this.prisma.driver.delete({
      where: { id },
    });
  }
}
