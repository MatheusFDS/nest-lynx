import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDriverDto } from './dto/create-driver.dto';

@Injectable()
export class DriversService {
  constructor(private prisma: PrismaService) {}

  async create(createDriverDto: CreateDriverDto, tenantId: number) {
    // Verificar se o CPF já existe no mesmo tenant
    const existingDriver = await this.prisma.driver.findFirst({
      where: {
        cpf: createDriverDto.cpf,
        tenantId,
      },
    });

    if (existingDriver) {
      throw new BadRequestException('CPF already exists in this tenant');
    }

    return this.prisma.driver.create({
      data: {
        name: createDriverDto.name,
        license: createDriverDto.license,
        cpf: createDriverDto.cpf,
        tenantId: tenantId // Passar o tenantId diretamente
      },
    });
  }

  async findAll(tenantId: number) {
    return this.prisma.driver.findMany({
      where: { tenantId },
      include: { vehicles: true },
    });
  }
}
