import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatisticsService {
  constructor(private prisma: PrismaService) {}

  async getStatistics(tenantId: number, startDate: Date, endDate: Date) {
    const ordersInRoute = await this.prisma.order.count({
      where: {
        tenantId: tenantId,
        status: 'Em Rota',
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const ordersFinalized = await this.prisma.order.count({
      where: {
        tenantId: tenantId,
        status: 'Finalizado',
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const ordersPending = await this.prisma.order.count({
      where: {
        tenantId: tenantId,
        status: 'Pendente',
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const freightsToPay = await this.prisma.accountsPayable.count({
      where: {
        tenantId: tenantId,
        status: 'Pendente',
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const freightsPaid = await this.prisma.accountsPayable.count({
      where: {
        tenantId: tenantId,
        status: 'Baixado',
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const deliveriesByDriver = await this.prisma.delivery.groupBy({
      by: ['motoristaId'],
      where: {
        tenantId: tenantId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: {
        motoristaId: true,
      },
    });

    const deliveriesInRoute = await this.prisma.delivery.count({
      where: {
        tenantId: tenantId,
        status: 'Em rota',
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const deliveriesFinalized = await this.prisma.delivery.count({
      where: {
        tenantId: tenantId,
        status: 'Finalizado',
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const notesByRegion = await this.prisma.order.groupBy({
      by: ['cidade'],
      where: {
        tenantId: tenantId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: {
        cidade: true,
      },
    });

    return {
      ordersInRoute,
      ordersFinalized,
      ordersPending,
      freightsToPay,
      freightsPaid,
      deliveriesByDriver,
      deliveriesInRoute,
      deliveriesFinalized,
      notesByRegion,
    };
  }
}
