import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { parse, isValid } from 'date-fns';

@Injectable()
export class OrdersService {
  constructor() {}

  // Função para converter o formato de data "dd/MM/yyyy" para ISO-8601
  convertToISODate(dateString: string): string {
    const parsedDate = parse(dateString, 'dd/MM/yyyy', new Date());
    if (!isValid(parsedDate)) {
      throw new BadRequestException(`Invalid date format: ${dateString}`);
    }
    return parsedDate.toISOString();
  }

  async upload(prisma: PrismaClient, orders: any[], tenantId: number) {
    const createdOrders = [];
    for (const order of orders) {
      let parsedDate: string | null = null;
      try {
        parsedDate = this.convertToISODate(order.data);
      } catch (error) {
        console.error(`Invalid date format for order ${order.numero}: ${order.data}`);
        throw new BadRequestException(`Invalid date format for order ${order.numero}`);
      }

      const existingOrder = await prisma.order.findFirst({
        where: {
          numero: order.numero.toString(),
          tenantId: tenantId,
        },
      });

      if (existingOrder) {
        console.log(`Order with number ${order.numero} already exists for tenant ${tenantId}`);
        throw new BadRequestException(`Order with number ${order.numero} already exists for tenant ${tenantId}`);
      }

      const createdOrder = await prisma.order.create({
        data: {
          numero: order.numero.toString(),
          data: parsedDate,
          idCliente: order.idCliente.toString(),
          cliente: order.cliente,
          endereco: order.endereco,
          cidade: order.cidade,
          uf: order.uf,
          peso: typeof order.peso === 'string' ? parseFloat(order.peso.replace(',', '.')) : order.peso,
          volume: typeof order.volume === 'string' ? parseInt(order.volume) : order.volume || 0,
          prazo: order.prazo?.toString() || '',
          prioridade: order.prioridade?.toString() || '',
          telefone: order.telefone?.toString() || '',
          email: order.email?.toString() || '',
          bairro: order.bairro,
          valor: typeof order.valor === 'string' ? parseFloat(order.valor.replace(',', '.')) : order.valor,
          instrucoesEntrega: order.instrucoesEntrega || '',
          nomeContato: order.nomeContato?.toString() || '',
          cpfCnpj: order.cpfCnpj.toString(),
          cep: order.cep.toString(),
          status: 'Pendente', // Define todos os pedidos como "Pendente"
          deliveryId: order.deliveryId ? parseInt(order.deliveryId) : null,
          tenantId: tenantId,
          sorting: 0,
        },
      });
      createdOrders.push(createdOrder);
    }
    return createdOrders;
  }

  async findAll(prisma: PrismaClient, tenantId: number) {
    return prisma.order.findMany({
      where: { tenantId },
      include: {
        Delivery: {
          include: {
            Driver: true,
          },
        },
      },
    });
  }
}
