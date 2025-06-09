import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatisticsService {
  getRevenueStatistics(tenantId: any, start: Date, end: Date, selectedGroupBy: string) {
    throw new Error('Method not implemented.');
  }
  getPerformanceStatistics(tenantId: any, selectedPeriod: string) {
    throw new Error('Method not implemented.');
  }
  getDashboardStatistics(tenantId: any, startDate: Date, endDate: Date) {
    throw new Error('Method not implemented.');
  }
  constructor(private prisma: PrismaService) {}

  async getStatistics(tenantId: string, startDate: Date, endDate: Date, driverId: string, shouldIncludeDetails: boolean) {
    // Define a common date filter
    const dateFilter = {
      gte: startDate,
      lte: endDate,
    };

    const ordersInRoute = await this.prisma.order.count({
      where: {
        tenantId,
        status: 'Em Rota',
        createdAt: dateFilter,
      },
    });

    const ordersFinalized = await this.prisma.order.count({
      where: {
        tenantId,
        status: 'Finalizado',
        createdAt: dateFilter,
      },
    });

    const ordersPending = await this.prisma.order.count({
      where: {
        tenantId,
        status: 'Pendente',
        createdAt: dateFilter,
      },
    });

    const freightsToPay = await this.prisma.accountsPayable.count({
      where: {
        tenantId,
        status: 'Pendente',
        createdAt: dateFilter,
      },
    });

    const freightsPaid = await this.prisma.accountsPayable.count({
      where: {
        tenantId,
        status: 'Baixado',
        createdAt: dateFilter,
      },
    });

    const deliveriesByDriver = await this.prisma.delivery.groupBy({
      by: ['motoristaId'],
      where: {
        tenantId,
        createdAt: dateFilter,
      },
      _count: {
        motoristaId: true,
      },
    });

    const deliveriesInRoute = await this.prisma.delivery.count({
      where: {
        tenantId,
        status: 'Em Rota',
        createdAt: dateFilter,
      },
    });

    const deliveriesFinalized = await this.prisma.delivery.count({
      where: {
        tenantId,
        status: 'Finalizado',
        createdAt: dateFilter,
      },
    });

    const notesByRegion = await this.getNotesByRegion(tenantId, startDate, endDate);

    // Fetch additional statistics
    const drivers = await this.prisma.driver.findMany({
      where: { tenantId },
      select: {
        id: true,
        name: true,
      },
    });

    const regions = await this.prisma.directions.findMany({
      where: { tenantId },
      select: {
        id: true,
        regiao: true,
      },
    });

    // Calculate average orders per driver
    const avgOrdersPerDriver = await this.calculateAvgOrdersPerDriver(tenantId, startDate, endDate);

    // Calculate average value of notes per driver
    const avgValueNotesPerDriver = await this.calculateAvgValueNotesPerDriver(tenantId, startDate, endDate);

    // Calculate average weight per driver
    const avgWeightPerDriver = await this.calculateAvgWeightPerDriver(tenantId, startDate, endDate);

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
      drivers,
      regions,
      avgOrdersPerDriver,
      avgValueNotesPerDriver,
      avgWeightPerDriver,
    };
  }

  private async calculateAvgOrdersPerDriver(tenantId: string, startDate: Date, endDate: Date) {
    const deliveries = await this.prisma.delivery.findMany({
      where: {
        tenantId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        motoristaId: true,
        orders: {
          select: {
            id: true,
          },
        },
      },
    });

    const driverOrders = deliveries.reduce((acc, delivery) => {
      acc[delivery.motoristaId] = (acc[delivery.motoristaId] || 0) + delivery.orders.length;
      return acc;
    }, {} as Record<string, number>);

    const driverAverages = Object.keys(driverOrders).map(driverId => ({
      driverId,
      average: parseFloat((driverOrders[driverId] / deliveries.filter(d => d.motoristaId === driverId).length).toFixed(2)),
    }));

    return driverAverages;
  }

  private async calculateAvgValueNotesPerDriver(tenantId: string, startDate: Date, endDate: Date) {
    const deliveries = await this.prisma.delivery.findMany({
      where: {
        tenantId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        motoristaId: true,
        orders: {
          select: {
            valor: true,
          },
        },
      },
    });

    const driverValues = deliveries.reduce((acc, delivery) => {
      acc[delivery.motoristaId] = (acc[delivery.motoristaId] || 0) + delivery.orders.reduce((sum, order) => sum + order.valor, 0);
      return acc;
    }, {} as Record<string, number>);

    const driverAverages = Object.keys(driverValues).map(driverId => ({
      driverId,
      average: parseFloat((driverValues[driverId] / deliveries.filter(d => d.motoristaId === driverId).length).toFixed(2)),
    }));

    return driverAverages;
  }

  private async calculateAvgWeightPerDriver(tenantId: string, startDate: Date, endDate: Date) {
    const deliveries = await this.prisma.delivery.findMany({
      where: {
        tenantId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        motoristaId: true,
        orders: {
          select: {
            peso: true,
          },
        },
      },
    });

    const driverWeights = deliveries.reduce((acc, delivery) => {
      acc[delivery.motoristaId] = (acc[delivery.motoristaId] || 0) + delivery.orders.reduce((sum, order) => sum + order.peso, 0);
      return acc;
    }, {} as Record<string, number>);

    const driverAverages = Object.keys(driverWeights).map(driverId => ({
      driverId,
      average: parseFloat((driverWeights[driverId] / deliveries.filter(d => d.motoristaId === driverId).length).toFixed(2)),
    }));

    return driverAverages;
  }

  private async getNotesByRegion(tenantId: string, startDate: Date, endDate: Date) {
    const orders = await this.prisma.order.findMany({
      where: {
        tenantId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        cidade: true,
        cep: true,
      },
    });

    const directions = await this.prisma.directions.findMany({
      where: {
        tenantId,
      },
      select: {
        rangeInicio: true,
        rangeFim: true,
        regiao: true,
      },
    });

    const regionCounts = orders.reduce((acc, order) => {
      const region = directions.find(direction => parseInt(order.cep) >= parseInt(direction.rangeInicio) && parseInt(order.cep) <= parseInt(direction.rangeFim));
      const regionName = region ? region.regiao : 'Unknown';
      acc[regionName] = (acc[regionName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.keys(regionCounts).map(region => ({
      region,
      count: regionCounts[region],
    }));
  }
}
