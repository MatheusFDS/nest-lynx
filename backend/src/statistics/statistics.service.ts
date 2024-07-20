import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class StatisticsService {
  constructor() {}

  async getStatistics(prisma: PrismaClient, tenantId: number, startDate: Date, endDate: Date) {
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error('Invalid date format for startDate or endDate');
    }

    const ordersInRoute = await prisma.order.count({
      where: {
        tenantId: tenantId,
        status: 'Em Rota',
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const ordersFinalized = await prisma.order.count({
      where: {
        tenantId: tenantId,
        status: 'Finalizado',
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const ordersPending = await prisma.order.count({
      where: {
        tenantId: tenantId,
        status: 'Pendente',
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const freightsToPay = await prisma.accountsPayable.count({
      where: {
        tenantId: tenantId,
        status: 'Pendente',
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const freightsPaid = await prisma.accountsPayable.count({
      where: {
        tenantId: tenantId,
        status: 'Baixado',
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const deliveriesByDriver = await prisma.delivery.groupBy({
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

    const deliveriesInRoute = await prisma.delivery.count({
      where: {
        tenantId: tenantId,
        status: 'Em rota',
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const deliveriesFinalized = await prisma.delivery.count({
      where: {
        tenantId: tenantId,
        status: 'Finalizado',
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const notesByRegion = await prisma.order.groupBy({
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
