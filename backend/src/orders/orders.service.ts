import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Order } from '@prisma/client';
import { parseISO, isValid } from 'date-fns';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  // Função para converter o formato de data numérico para ISO-8601
  convertToISODate(numericDate: string): string {
    const year = parseInt(numericDate.substring(0, 4));
    const month = parseInt(numericDate.substring(4, 6)) - 1; // Meses em JavaScript são baseados em zero
    const day = parseInt(numericDate.substring(6, 8));
    const date = new Date(year, month, day);

    if (!isValid(date)) {
      throw new BadRequestException(`Invalid date format: ${numericDate}`);
    }

    return date.toISOString();
  }

  async upload(orders: any[], tenantId: number) {
    const createdOrders = [];
    for (const order of orders) {
      let parsedDate: string | null = null;
      try {
        parsedDate = this.convertToISODate(order.data);
      } catch (error) {
        console.error(`Invalid date format for order ${order.numero}: ${order.data}`);
        throw new BadRequestException(`Invalid date format for order ${order.numero}`);
      }

      const existingOrder = await this.prisma.order.findFirst({
        where: {
          numero: order.numero,
          tenantId: tenantId,
        },
      });

      if (existingOrder) {
        console.log(`Order with number ${order.numero} already exists for tenant ${tenantId}`);
        throw new BadRequestException(`Order with number ${order.numero} already exists for tenant ${tenantId}`);
      }

      const createdOrder = await this.prisma.order.create({
        data: {
          numero: order.numero,
          data: parsedDate,
          idCliente: order.idCliente,
          cliente: order.cliente,
          endereco: order.endereco,
          cidade: order.cidade,
          uf: order.uf,
          peso: parseFloat(order.peso.replace(',', '.')),
          volume: parseInt(order.volume),
          prazo: order.prazo,
          prioridade: order.prioridade,
          telefone: order.telefone,
          email: order.email,
          bairro: order.bairro,
          valor: parseFloat(order.valor.replace(',', '.')),
          instrucoesEntrega: order.instrucoesEntrega,
          nomeContato: order.nomeContato,
          cpfCnpj: order.cpfCnpj,
          cep: order.cep,
          status: order.status,
          deliveryId: order.deliveryId,
          tenantId: tenantId,
        },
      });
      createdOrders.push(createdOrder);
    }
    return createdOrders;
  }

  async findAll(tenantId: number) {
    return this.prisma.order.findMany({
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
