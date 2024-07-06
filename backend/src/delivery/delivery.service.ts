import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { UpdateDeliveryDto } from './dto/update-delivery.dto';

@Injectable()
export class DeliveryService {
  constructor(private prisma: PrismaService) {}

  async create(createDeliveryDto: CreateDeliveryDto, tenantId: number) {
    const { motoristaId, orders, veiculoId, ...rest } = createDeliveryDto;

    console.log('Received CreateDeliveryDto:', createDeliveryDto);

    const existingDelivery = await this.prisma.delivery.findFirst({
      where: { motoristaId, status: 'Em rota' },
    });

    if (existingDelivery) {
      throw new BadRequestException('O motorista já está em uma rota.');
    }

    const orderRecords = await this.prisma.order.findMany({
      where: {
        id: { in: orders.map(order => order.id) },
        status: { in: ['Pendente', 'Reentrega'] },
        tenantId: tenantId,
      },
    });

    if (orderRecords.length !== orders.length) {
      throw new BadRequestException('Alguns pedidos não são válidos.');
    }

    const totalPeso = orderRecords.reduce((sum, order) => sum + order.peso, 0);
    const totalValor = orderRecords.reduce((sum, order) => sum + order.valor, 0);

    let maxDirectionValue = 0;

    for (const order of orderRecords) {
      const directionValue = await this.prisma.directions.findFirst({
        where: {
          tenantId: tenantId,
          rangeInicio: { lte: order.cep },
          rangeFim: { gte: order.cep },
        },
        orderBy: { valorDirecao: 'desc' },
      });

      if (directionValue && Number(directionValue.valorDirecao) > maxDirectionValue) {
        maxDirectionValue = Number(directionValue.valorDirecao);
      }
    }

    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: veiculoId },
      include: { Category: true },
    });

    const valorFrete = maxDirectionValue + (vehicle?.Category?.valor ?? 0);

    const delivery = await this.prisma.delivery.create({
      data: {
        motoristaId,
        veiculoId,
        tenantId,
        valorFrete,
        totalPeso,
        totalValor,
        status: 'Em rota',
        ...rest,
        orders: {
          connect: orders.map(order => ({ id: order.id })),
        },
      },
      include: {
        orders: true,
        Driver: true,
        Vehicle: true,
      },
    });

    await this.prisma.order.updateMany({
      where: { id: { in: orders.map(order => order.id) } },
      data: { status: 'Em Rota', deliveryId: delivery.id },
    });

    return delivery;
  }

  async update(id: number, updateDeliveryDto: UpdateDeliveryDto, tenantId: number) {
    const { motoristaId, veiculoId, orders, ...rest } = updateDeliveryDto;

    const delivery = await this.prisma.delivery.update({
      where: { id },
      data: {
        ...rest,
        tenantId,
        motoristaId,
        veiculoId,
        orders: {
          connect: orders?.map(order => ({ id: order.id })) ?? [],
        },
      },
      include: {
        orders: true,
        Driver: true,
        Vehicle: true,
      },
    });

    if (updateDeliveryDto.status === 'Finalizado') {
      await this.prisma.order.updateMany({
        where: { deliveryId: id },
        data: { status: 'Finalizado' },
      });

      const existingPayment = await this.prisma.paymentDelivery.findFirst({
        where: { deliveryId: delivery.id },
      });

      if (!existingPayment) {
        await this.prisma.accountsPayable.create({
          data: {
            amount: delivery.valorFrete,
            status: 'Pendente',
            tenantId,
            motoristaId: delivery.motoristaId,
            isGroup: false,
            paymentDeliveries: {
              create: {
                deliveryId: delivery.id,
                tenantId,
              },
            },
          },
        });
      }
    }

    return delivery;
  }

  async findAll(tenantId: number) {
    return this.prisma.delivery.findMany({
      where: { tenantId },
      include: { orders: true, Driver: true, Vehicle: true },
    });
  }

  async findOne(id: number, tenantId: number) {
    const delivery = await this.prisma.delivery.findFirst({
      where: { id, tenantId },
      include: { orders: true, Driver: true, Vehicle: true },
    });

    if (!delivery) {
      throw new NotFoundException('Delivery not found');
    }

    return delivery;
  }

  async remove(id: number, tenantId: number) {
    const delivery = await this.findOne(id, tenantId);

    if (!delivery) {
      throw new NotFoundException('Delivery not found');
    }

    await this.prisma.order.updateMany({
      where: { deliveryId: id },
      data: { status: 'Reentrega', deliveryId: null },
    });

    return this.prisma.delivery.delete({ where: { id } });
  }

  async removeOrderFromDelivery(deliveryId: number, orderId: number, tenantId: number) {
    const delivery = await this.prisma.delivery.findFirst({
      where: { id: deliveryId, tenantId },
      include: { orders: true },
    });

    if (!delivery) {
      throw new NotFoundException('Delivery not found');
    }

    const updatedDelivery = await this.prisma.delivery.update({
      where: { id: deliveryId },
      data: {
        orders: {
          disconnect: { id: orderId },
        },
      },
      include: { orders: true },
    });

    await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'Reentrega', deliveryId: null },
    });

    return updatedDelivery;
  }
}
