import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { UpdateDeliveryDto } from './dto/update-delivery.dto';

@Injectable()
export class DeliveryService {
  constructor(private prisma: PrismaService) {}

  async create(createDeliveryDto: CreateDeliveryDto, tenantId: number) {
    // Validação para garantir que o motorista não está em rota
    const existingDelivery = await this.prisma.delivery.findFirst({
      where: {
        motoristaId: createDeliveryDto.motoristaId,
        status: 'Em rota',
      },
    });

    if (existingDelivery) {
      throw new BadRequestException('O motorista já está em uma rota.');
    }

    const orders = await this.prisma.order.findMany({
      where: {
        id: { in: createDeliveryDto.orders },
        tenantId,
        status: { in: ['Pendente', 'Reentrega'] },
      },
    });

    if (orders.length !== createDeliveryDto.orders.length) {
      throw new BadRequestException('Alguns pedidos não estão em status Pendente ou Reentrega.');
    }

    const totalPeso = orders.reduce((acc, order) => acc + order.peso, 0);
    const totalValor = orders.reduce((acc, order) => acc + order.valor, 0);

    const motorista = await this.prisma.driver.findUnique({
      where: { id: createDeliveryDto.motoristaId },
    });

    const veiculo = await this.prisma.vehicle.findUnique({
      where: { id: createDeliveryDto.veiculoId, driverId: createDeliveryDto.motoristaId },
      include: { Category: true },
    });

    if (!veiculo) {
      throw new BadRequestException('O veículo não está associado ao motorista.');
    }

    let maxDirectionValue = 0;
    for (const order of orders) {
      const direction = await this.prisma.directions.findFirst({
        where: {
          tenantId,
          rangeInicio: { lte: order.cep },
          rangeFim: { gte: order.cep },
        },
      });
      if (direction) {
        const directionValue = parseFloat(direction.valorDirecao);
        if (directionValue > maxDirectionValue) {
          maxDirectionValue = directionValue;
        }
      }
    }

    const valorFrete = maxDirectionValue + veiculo.Category.valor;

    const delivery = await this.prisma.delivery.create({
      data: {
        motoristaId: createDeliveryDto.motoristaId,
        veiculoId: createDeliveryDto.veiculoId,
        valorFrete,
        totalPeso,
        totalValor,
        status: 'Em rota',
        tenantId,
        orders: {
          connect: createDeliveryDto.orders.map((id) => ({ id })),
        },
      },
    });

    // Atualizar o status dos pedidos para "Em rota" e o deliveryId
    await this.prisma.order.updateMany({
      where: { id: { in: createDeliveryDto.orders } },
      data: { status: 'Em rota', deliveryId: delivery.id },
    });

    return delivery;
  }

  async findAll(tenantId: number) {
    return this.prisma.delivery.findMany({
      where: { tenantId },
      include: {
        orders: true,
        Driver: true,
        Vehicle: true,
      },
    });
  }

  async findOne(id: number, tenantId: number) {
    return this.prisma.delivery.findFirst({
      where: { id, tenantId },
      include: {
        orders: true,
        Driver: true,
        Vehicle: true,
      },
    });
  }

  async update(id: number, updateDeliveryDto: UpdateDeliveryDto, tenantId: number) {
    const updateData: any = {
      motoristaId: updateDeliveryDto.motoristaId,
      veiculoId: updateDeliveryDto.veiculoId,
      status: updateDeliveryDto.status,
      dataFim: updateDeliveryDto.dataFim,
    };

    if (updateDeliveryDto.orders) {
      const orders = await this.prisma.order.findMany({
        where: {
          id: { in: updateDeliveryDto.orders },
          tenantId,
          status: { in: ['Pendente', 'Reentrega'] },
        },
      });

      if (orders.length !== updateDeliveryDto.orders.length) {
        throw new BadRequestException('Alguns pedidos não estão em status Pendente ou Reentrega.');
      }

      updateData.orders = {
        connect: updateDeliveryDto.orders.map((orderId) => ({ id: orderId })),
      };

      // Atualizar o status dos pedidos para "Em rota" e o deliveryId
      await this.prisma.order.updateMany({
        where: { id: { in: updateDeliveryDto.orders } },
        data: { status: 'Em rota', deliveryId: id },
      });
    }

    return this.prisma.delivery.update({
      where: { id, tenantId },
      data: updateData,
    });
  }

  async remove(id: number, tenantId: number) {
    const delivery = await this.prisma.delivery.findFirst({
      where: { id, tenantId },
      include: { orders: true },
    });

    if (!delivery) {
      throw new BadRequestException('Roteiro não encontrado.');
    }

    // Atualizar o status dos pedidos para "Reentrega" e remover o deliveryId
    await this.prisma.order.updateMany({
      where: { id: { in: delivery.orders.map((order) => order.id) } },
      data: { status: 'Reentrega', deliveryId: null },
    });

    return this.prisma.delivery.delete({
      where: { id, tenantId },
    });
  }
}
