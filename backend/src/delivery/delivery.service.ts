import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { UpdateDeliveryDto } from './dto/update-delivery.dto';

@Injectable()
export class DeliveryService {
  constructor() {}

  async create(prisma: PrismaClient, createDeliveryDto: CreateDeliveryDto, tenantId: number) {
    const { motoristaId, orders, veiculoId, ...rest } = createDeliveryDto;

    const existingDelivery = await prisma.delivery.findFirst({
      where: { motoristaId, status: { in: ['Em Rota', 'A liberar'] } },
    });

    if (existingDelivery) {
      throw new BadRequestException('O motorista já está em uma rota.');
    }

    const orderRecords = await prisma.order.findMany({
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
      const directionValue = await prisma.directions.findFirst({
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

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: veiculoId },
      include: { Category: true },
    });

    const valorFrete = maxDirectionValue + (vehicle?.Category?.valor ?? 0);

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    const percentualFrete = (valorFrete / totalValor) * 100;
    const status = percentualFrete > (tenant?.minDeliveryPercentage || 100) ? 'A liberar' : 'Em Rota';

    const delivery = await prisma.delivery.create({
      data: {
        motoristaId,
        veiculoId,
        tenantId,
        valorFrete,
        totalPeso,
        totalValor,
        status,
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

    for (const order of orders) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: status, deliveryId: delivery.id, sorting: order.sorting ?? null },
      });
    }

    return delivery;
  }

  async release(prisma: PrismaClient, id: number, tenantId: number, userId: number) {
    const delivery = await prisma.delivery.findFirst({
      where: { id, tenantId },
    });

    if (!delivery) {
      throw new NotFoundException('Delivery not found');
    }

    if (delivery.status !== 'A liberar') {
      throw new BadRequestException('A entrega não está no status "A liberar".');
    }

    const updatedDelivery = await prisma.delivery.update({
      where: { id },
      data: {
        status: 'Em Rota',
        dataLiberacao: new Date(),
      },
    });

    await prisma.order.updateMany({
      where: { deliveryId: id },
      data: { status: 'Em Rota' },
    });

    await prisma.approval.create({
      data: {
        deliveryId: id,
        tenantId,
        action: 'approved',
        userId: userId,
        createdAt: new Date(),
      },
    });

    return {
      ...updatedDelivery,
      approval: {
        userName: (await prisma.user.findUnique({ where: { id: userId } })).name,
        action: 'approved',
        createdAt: new Date().toISOString(),
      },
    };
  }

  async rejectRelease(prisma: PrismaClient, id: number, tenantId: number, userId: number, motivo: string): Promise<void> {
    const delivery = await prisma.delivery.findUnique({
      where: { id },
      include: { orders: true, liberacoes: true },
    });

    if (!delivery) {
      throw new NotFoundException('Delivery not found');
    }

    if (delivery.tenantId !== tenantId) {
      throw new NotFoundException('Delivery not found for the tenant');
    }

    await prisma.order.updateMany({
      where: { deliveryId: id },
      data: { status: 'Pendente', deliveryId: null },
    });

    await prisma.approval.create({
      data: {
        deliveryId: id,
        tenantId,
        action: 'rejected',
        motivo,
        userId,
      },
    });

    await prisma.delivery.update({
      where: { id },
      data: {
        status: 'Negado',
      },
    });
  }

  async update(prisma: PrismaClient, id: number, updateDeliveryDto: UpdateDeliveryDto, tenantId: number) {
    const { motoristaId, veiculoId, orders, status, ...rest } = updateDeliveryDto;

    const hasBaixadoPayments = await prisma.accountsPayable.findFirst({
      where: {
        paymentDeliveries: { some: { deliveryId: id } },
        status: 'Baixado',
      },
    });

    if (hasBaixadoPayments) {
      throw new BadRequestException('Não é possível alterar uma entrega com pagamentos baixados.');
    }

    let updatedDelivery;

    if (status === 'Em Rota') {
      await prisma.accountsPayable.deleteMany({
        where: {
          paymentDeliveries: { some: { deliveryId: id } },
          status: 'Pendente',
        },
      });

      updatedDelivery = await prisma.delivery.update({
        where: { id },
        data: {
          ...rest,
          tenantId,
          motoristaId,
          veiculoId,
          status,
          dataFim: null,
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

      await prisma.order.updateMany({
        where: { deliveryId: id },
        data: { status: 'Em Rota' },
      });
    } else if (status === 'Finalizado') {
      updatedDelivery = await prisma.delivery.update({
        where: { id },
        data: {
          ...rest,
          tenantId,
          motoristaId,
          veiculoId,
          status,
          dataFim: new Date(),
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

      await prisma.order.updateMany({
        where: { deliveryId: id },
        data: { status: 'Finalizado' },
      });

      const existingPayment = await prisma.paymentDelivery.findFirst({
        where: { deliveryId: updatedDelivery.id },
      });

      if (!existingPayment) {
        await prisma.accountsPayable.create({
          data: {
            amount: updatedDelivery.valorFrete,
            status: 'Pendente',
            tenantId,
            motoristaId: updatedDelivery.motoristaId,
            isGroup: false,
            paymentDeliveries: {
              create: {
                deliveryId: updatedDelivery.id,
                tenantId,
              },
            },
          },
        });
      }
    } else {
      updatedDelivery = await prisma.delivery.update({
        where: { id },
        data: {
          ...rest,
          tenantId,
          motoristaId,
          veiculoId,
          status,
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
    }

    return updatedDelivery;
  }

  async findAll(prisma: PrismaClient, tenantId: number) {
    return prisma.delivery.findMany({
      where: { tenantId },
      include: {
        orders: true,
        Driver: true,
        Vehicle: true,
        liberacoes: {
          include: {
            User: true,
          },
        },
      },
    });
  }

  async findOne(prisma: PrismaClient, id: number, tenantId: number) {
    const delivery = await prisma.delivery.findFirst({
      where: { id, tenantId },
      include: {
        orders: true,
        Driver: true,
        Vehicle: true,
        liberacoes: {
          include: {
            User: true,
          },
        },
      },
    });

    if (!delivery) {
      throw new NotFoundException('Delivery not found');
    }

    return delivery;
  }

  async remove(prisma: PrismaClient, id: number, tenantId: number) {
    const delivery = await this.findOne(prisma, id, tenantId);

    if (!delivery) {
      throw new NotFoundException('Delivery not found');
    }

    if (delivery.status === 'Finalizado') {
      throw new BadRequestException('Não é possível excluir uma entrega finalizada.');
    }

    const hasPayments = await prisma.accountsPayable.findFirst({
      where: {
        paymentDeliveries: { some: { deliveryId: id } },
        status: 'Baixado',
      },
    });

    if (hasPayments) {
      throw new BadRequestException('Não é possível excluir uma entrega com pagamentos baixados.');
    }

    await prisma.order.updateMany({
      where: { deliveryId: id },
      data: { status: 'Reentrega', deliveryId: null },
    });

    await prisma.paymentDelivery.deleteMany({
      where: { deliveryId: id },
    });

    await prisma.accountsPayable.deleteMany({
      where: {
        paymentDeliveries: { some: { deliveryId: id } },
      },
    });

    await prisma.approval.deleteMany({
      where: { deliveryId: id },
    });

    return prisma.delivery.delete({ where: { id } });
  }

  async removeOrderFromDelivery(prisma: PrismaClient, deliveryId: number, orderId: number, tenantId: number) {
    const delivery = await prisma.delivery.findFirst({
      where: { id: deliveryId, tenantId },
      include: { orders: true },
    });

    if (!delivery) {
      throw new NotFoundException('Delivery not found');
    }

    const hasBaixadoPayments = await prisma.accountsPayable.findFirst({
      where: {
        paymentDeliveries: { some: { deliveryId } },
        status: 'Baixado',
      },
    });

    if (hasBaixadoPayments) {
      throw new BadRequestException('Não é possível remover pedidos de uma entrega com pagamentos baixados.');
    }

    if (delivery.status === 'Finalizado') {
      throw new BadRequestException('Não é possível remover pedidos de uma entrega finalizada.');
    }

    const updatedDelivery = await prisma.delivery.update({
      where: { id: deliveryId },
      data: {
        orders: {
          disconnect: { id: orderId },
        },
      },
      include: { orders: true },
    });

    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'Reentrega', deliveryId: null },
    });

    return updatedDelivery;
  }
}
