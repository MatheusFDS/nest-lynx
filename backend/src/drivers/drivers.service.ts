import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';

@Injectable()
export class DriversService {
  constructor(private prisma: PrismaService) {}

  async create(createDriverDto: CreateDriverDto, tenantId: string) {
    // Verificar se o usuário existe e pertence ao mesmo tenant (se userId foi fornecido)
    if (createDriverDto.userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: createDriverDto.userId },
      });

      if (!user) {
        throw new NotFoundException('Usuário não encontrado');
      }

      if (user.tenantId !== tenantId) {
        throw new BadRequestException('Usuário não pertence ao mesmo tenant');
      }

      // Verificar se o usuário já está associado a outro motorista
      const existingDriver = await this.prisma.driver.findUnique({
        where: { userId: createDriverDto.userId },
      });

      if (existingDriver) {
        throw new BadRequestException('Este usuário já está associado a outro motorista');
      }
    }

    return this.prisma.driver.create({
      data: {
        ...createDriverDto,
        tenantId,
      },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.driver.findMany({
      where: { tenantId },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async update(id: string, updateDriverDto: UpdateDriverDto, tenantId: string) {
    const driver = await this.prisma.driver.findUnique({
      where: { id },
    });

    if (!driver || driver.tenantId !== tenantId) {
      throw new NotFoundException('Motorista não encontrado');
    }

    // Verificar se o usuário existe e pertence ao mesmo tenant (se userId foi fornecido)
    if (updateDriverDto.userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: updateDriverDto.userId },
      });

      if (!user) {
        throw new NotFoundException('Usuário não encontrado');
      }

      if (user.tenantId !== tenantId) {
        throw new BadRequestException('Usuário não pertence ao mesmo tenant');
      }

      // Verificar se o usuário já está associado a outro motorista (exceto o atual)
      const existingDriver = await this.prisma.driver.findFirst({
        where: { 
          userId: updateDriverDto.userId,
          id: { not: id },
        },
      });

      if (existingDriver) {
        throw new BadRequestException('Este usuário já está associado a outro motorista');
      }
    }

    // Filtrar apenas os campos que podem ser atualizados
    const allowedFields = {
      name: updateDriverDto.name,
      license: updateDriverDto.license,
      cpf: updateDriverDto.cpf,
      userId: updateDriverDto.userId,
    };

    // Remover campos undefined
    const updateData = Object.fromEntries(
      Object.entries(allowedFields).filter(([_, v]) => v !== undefined)
    );

    return this.prisma.driver.update({
      where: { id },
      data: updateData,
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async remove(id: string, tenantId: string) {
    const driver = await this.prisma.driver.findUnique({
      where: { id, tenantId },
    });

    if (!driver || driver.tenantId !== tenantId) {
      throw new NotFoundException('Motorista não encontrado');
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
    // Buscar o driver para obter o tenantId
    const driver = await this.prisma.driver.findUnique({
      where: { id: driverId },
    });

    if (!driver) {
      throw new NotFoundException('Motorista não encontrado');
    }

    const proofUrl = `path/to/your/proof/${file.filename}`;
  
    return this.prisma.deliveryProof.create({
      data: {
        Order: { connect: { id: orderId } },
        Driver: { connect: { id: driverId } },
        Tenant: { connect: { id: driver.tenantId } }, // Usar o tenantId do driver
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

  async findOne(id: string, tenantId: string) {
    const driver = await this.prisma.driver.findFirst({
      where: { id, tenantId },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!driver) {
      throw new NotFoundException('Motorista não encontrado');
    }

    return driver;
  }

  async getDriverByUserId(userId: string, tenantId: string) {
    const driver = await this.prisma.driver.findFirst({
      where: { 
        userId,
        tenantId,
      },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!driver) {
      throw new NotFoundException('Motorista não encontrado para este usuário');
    }

    return driver;
  }

  // Novo método para buscar usuários disponíveis para serem motoristas
  async getAvailableUsers(tenantId: string) {
    return this.prisma.user.findMany({
      where: {
        tenantId,
        isActive: true,
        driver: null, // Usuários que ainda não são motoristas
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
  }
}