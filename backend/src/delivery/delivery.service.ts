import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { UpdateDeliveryDto } from './dto/update-delivery.dto';

@Injectable()
export class DeliveryService {
  constructor(private prisma: PrismaService) {}

  async create(createDeliveryDto: CreateDeliveryDto, tenantId: string) {
    const { motoristaId, orders, veiculoId, ...rest } = createDeliveryDto;

    const existingDelivery = await this.prisma.delivery.findFirst({
      where: { motoristaId, status: { in: ['Em Rota', 'A liberar'] } },
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

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new BadRequestException('Tenant não encontrado.');
    }

    const percentualFrete = (valorFrete / totalValor) * 100;
    const status = percentualFrete > (tenant?.minDeliveryPercentage || 100) ? 'A liberar' : 'Em Rota';

    const delivery = await this.prisma.delivery.create({
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
      await this.prisma.order.update({
        where: { id: order.id },
        data: { status: status, deliveryId: delivery.id, sorting: order.sorting ?? null },
      });
    }

    return delivery;
  }

  async release(id: string, tenantId: string, userId: string) {
    const delivery = await this.prisma.delivery.findFirst({
      where: { id, tenantId },
    });

    if (!delivery) {
      throw new NotFoundException('Delivery not found');
    }

    if (delivery.status !== 'A liberar') {
      throw new BadRequestException('A entrega não está no status "A liberar".');
    }

    const updatedDelivery = await this.prisma.delivery.update({
      where: { id },
      data: {
        status: 'Em Rota',
        dataLiberacao: new Date(),
      },
    });

    await this.prisma.order.updateMany({
      where: { deliveryId: id },
      data: { status: 'Em Rota' },
    });

    await this.prisma.approval.create({
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
        userName: (await this.prisma.user.findUnique({ where: { id: userId } })).name,
        action: 'approved',
        createdAt: new Date().toISOString(),
      },
    };
  }

  async rejectRelease(id: string, tenantId: string, userId: string, motivo: string): Promise<void> {
    const delivery = await this.prisma.delivery.findUnique({
      where: { id },
      include: { orders: true, liberacoes: true },
    });
  
    if (!delivery) {
     // console.error(`Delivery not found for ID: ${id}`);
      throw new NotFoundException('Delivery not found');
    }
  
    if (delivery.tenantId !== tenantId) {
   //   console.error(`Delivery ID: ${id} not found for tenant ID: ${tenantId}`);
      throw new NotFoundException('Delivery not found for the tenant');
    }
  
    await this.prisma.order.updateMany({
      where: { deliveryId: id },
      data: { status: 'Pendente', deliveryId: null },
    });
  
    await this.prisma.approval.create({
      data: {
        deliveryId: id,
        tenantId,
        action: 'rejected',
        motivo,
        userId,
      },
    });
  
    await this.prisma.delivery.update({
      where: { id },
      data: {
        status: 'Negado',
      },
    });
  
    //console.log(`Delivery ID: ${id} rejected for tenant ID: ${tenantId} by user ID: ${userId}`);
  }

  async update(id: string, updateDeliveryDto: UpdateDeliveryDto, tenantId: string) {
    const { motoristaId, veiculoId, orders, status, ...rest } = updateDeliveryDto;

    const hasBaixadoPayments = await this.prisma.accountsPayable.findFirst({
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
      await this.prisma.accountsPayable.deleteMany({
        where: {
          paymentDeliveries: { some: { deliveryId: id } },
          status: 'Pendente',
        },
      });

      updatedDelivery = await this.prisma.delivery.update({
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

      await this.prisma.order.updateMany({
        where: { deliveryId: id },
        data: { status: 'Em Rota' },
      });
    } else if (status === 'Finalizado') {
      updatedDelivery = await this.prisma.delivery.update({
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

      await this.prisma.order.updateMany({
        where: { deliveryId: id },
        data: { status: 'Finalizado' },
      });

      const existingPayment = await this.prisma.paymentDelivery.findFirst({
        where: { deliveryId: updatedDelivery.id },
      });

      if (!existingPayment) {
        await this.prisma.accountsPayable.create({
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
      updatedDelivery = await this.prisma.delivery.update({
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

  async findAll(tenantId: string) {
    return this.prisma.delivery.findMany({
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

  async findOne(id: string, tenantId: string) {
    const delivery = await this.prisma.delivery.findFirst({
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

  async remove(id: string, tenantId: string) {
    const delivery = await this.findOne(id, tenantId);

    if (!delivery) {
      throw new NotFoundException('Delivery not found');
    }

    if (delivery.status === 'Finalizado') {
      throw new BadRequestException('Não é possível excluir uma entrega finalizada.');
    }

    const hasPayments = await this.prisma.accountsPayable.findFirst({
      where: {
        paymentDeliveries: { some: { deliveryId: id } },
        status: 'Baixado',
      },
    });

    if (hasPayments) {
      throw new BadRequestException('Não é possível excluir uma entrega com pagamentos baixados.');
    }

    await this.prisma.order.updateMany({
      where: { deliveryId: id },
      data: { status: 'Reentrega', deliveryId: null },
    });

    await this.prisma.paymentDelivery.deleteMany({
      where: { deliveryId: id },
    });

    await this.prisma.accountsPayable.deleteMany({
      where: {
        paymentDeliveries: { some: { deliveryId: id } },
      },
    });

    await this.prisma.approval.deleteMany({
      where: { deliveryId: id },
    });

    return this.prisma.delivery.delete({ where: { id } });
  }

  async removeOrderFromDelivery(deliveryId: string, orderId: string, tenantId: string) {
    const delivery = await this.prisma.delivery.findFirst({
      where: { id: deliveryId, tenantId },
      include: { orders: true },
    });

    if (!delivery) {
      throw new NotFoundException('Delivery not found');
    }

    const hasBaixadoPayments = await this.prisma.accountsPayable.findFirst({
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
