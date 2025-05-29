// Em src/orders/orders.service.ts

import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common'; // Adicione NotFoundException
import { PrismaService } from '../prisma/prisma.service';
import { parse, isValid } from 'date-fns';
import { OrderHistoryEventDto } from './dto/order-history-event.dto'; // Importe o DTO

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  convertToISODate(dateString: string): string {
    // ... (função como antes)
    const parsedDate = parse(dateString, 'dd/MM/yyyy', new Date());
    if (!isValid(parsedDate)) {
      throw new BadRequestException(`Invalid date format: ${dateString}`);
    }
    return parsedDate.toISOString();
  }

  async upload(orders: any[], tenantId: string) {
    // ... (lógica de upload como antes)
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
          numero: order.numero.toString(),
          tenantId: tenantId,
        },
      });

      if (existingOrder) {
        console.log(`Order with number ${order.numero} already exists for tenant ${tenantId}`);
        throw new BadRequestException(`Order with number ${order.numero} already exists for tenant ${tenantId}`);
      }

      const createdOrder = await this.prisma.order.create({
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
          status: 'Pendente',
          deliveryId: order.deliveryId ? order.deliveryId.toString() : null,
          tenantId: tenantId,
          sorting: 0,
        },
      });
      createdOrders.push(createdOrder);
    }
    return createdOrders;
  }

  async findAll(tenantId: string) {
    // ... (lógica de findAll como antes)
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

  // NOVO MÉTODO PARA BUSCAR HISTÓRICO DO PEDIDO
  async findOrderHistory(orderId: string, tenantId: string): Promise<OrderHistoryEventDto[]> {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, tenantId },
      include: {
        Delivery: { // Se o pedido estiver em um roteiro
          include: {
            Driver: true,   // Motorista do roteiro
            liberacoes: {   // Aprovações/Rejeições do roteiro
              include: {
                User: true, // Usuário que aprovou/rejeitou
              },
              orderBy: {
                createdAt: 'asc',
              },
            },
          },
        },
        deliveryProofs: { // Comprovantes de entrega do pedido
          include: {
            Driver: true, // Motorista que enviou o comprovante
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Pedido com ID ${orderId} não encontrado.`);
    }

    const historyEvents: OrderHistoryEventDto[] = [];

    // 1. Evento de Criação do Pedido
    historyEvents.push({
      id: `order-created-${order.id}`,
      timestamp: order.createdAt.toISOString(),
      eventType: 'PEDIDO_CRIADO',
      description: `Pedido ${order.numero} criado no sistema.`,
      user: 'Sistema', // Ou rastrear o usuário que importou, se disponível
    });

    // 2. Eventos relacionados ao Roteiro (Delivery)
    if (order.Delivery) {
      const delivery = order.Delivery;
      historyEvents.push({
        id: `delivery-assigned-${delivery.id}-${order.id}`,
        // Idealmente, você teria um timestamp específico para quando a order foi conectada à delivery.
        // Usar delivery.createdAt pode ser uma aproximação se a order foi adicionada na criação da delivery.
        // Se a order foi adicionada a uma delivery existente via update, order.updatedAt poderia ser mais próximo.
        timestamp: delivery.createdAt.toISOString(), // Pode precisar de ajuste para precisão
        eventType: 'ROTEIRO_ASSOCIADO',
        description: `Pedido ${order.numero} associado ao roteiro ${delivery.id}.`,
        user: 'Sistema', // Ou quem criou/atualizou o roteiro
        details: {
          deliveryId: delivery.id,
          driverName: delivery.Driver?.name,
          vehiclePlate: delivery.veiculoId, 
          deliveryStatus: delivery.status,
        },
      });

      // Eventos de Aprovação/Rejeição do Roteiro
      delivery.liberacoes.forEach(approval => {
        historyEvents.push({
          id: approval.id,
          timestamp: approval.createdAt.toISOString(),
          eventType: approval.action.toUpperCase() === 'APPROVED' ? 'ROTEIRO_LIBERADO' : 'LIBERAÇÃO_ROTEIRO_REJEITADA',
          description: approval.action.toUpperCase() === 'APPROVED'
            ? `Roteiro ${delivery.id} liberado.`
            : `Liberação do roteiro ${delivery.id} rejeitada.`,
          user: approval.User?.name || 'Usuário Desconhecido',
          details: {
            reason: approval.motivo,
          },
        });
      });
      
      // Se o roteiro em si tem um status final e dataFim
      if (delivery.status === 'Finalizado' && delivery.dataFim) {
        historyEvents.push({
            id: `delivery-finalizado-${delivery.id}`,
            timestamp: delivery.dataFim.toISOString(),
            eventType: 'ROTEIRO_FINALIZADO',
            description: `Roteiro ${delivery.id} finalizado.`,
            user: delivery.Driver?.name || 'Sistema',
        });
      }
    }

    // 3. Eventos de Status do Pedido (baseado em timestamps diretos na Order)
    // Uma tabela de log de status seria mais precisa, mas podemos inferir alguns.
    if (order.startedAt) {
      historyEvents.push({
        id: `order-delivery-started-${order.id}`,
        timestamp: order.startedAt.toISOString(),
        eventType: 'ENTREGA_INICIADA_PEDIDO',
        description: `Entrega do pedido ${order.numero} iniciada.`,
        user: order.Delivery?.Driver?.name || 'Motorista App',
      });
    }

    if (order.completedAt) {
      historyEvents.push({
        id: `order-delivery-completed-${order.id}`,
        timestamp: order.completedAt.toISOString(),
        eventType: order.status === 'Entrega Finalizada' ? 'PEDIDO_ENTREGUE' : 'PEDIDO_RETORNADO',
        description: order.status === 'Entrega Finalizada' ? `Pedido ${order.numero} entregue com sucesso.` : `Entrega do pedido ${order.numero} retornou.`,
        user: order.Delivery?.Driver?.name || 'Motorista App',
        details: { finalStatus: order.status }
      });
    }
    
    // Evento genérico para a última atualização de status se não for coberto acima
    // Isso ajuda a capturar o status atual se nenhum dos timestamps específicos corresponder à última updatedAt.
    if (order.updatedAt && 
        order.updatedAt.toISOString() !== order.createdAt.toISOString() &&
        (!order.completedAt || order.updatedAt > order.completedAt) &&
        (!order.startedAt || order.updatedAt > order.startedAt) &&
        (!order.Delivery || !order.Delivery.liberacoes.some(l => new Date(l.createdAt).getTime() === order.updatedAt.getTime())) // Evita duplicar evento de aprovação
        ) {
            const isCoveredByOtherEvent = historyEvents.some(event => 
                new Date(event.timestamp).getTime() === order.updatedAt.getTime() && 
                event.id !== `order-created-${order.id}` // Não considerar o evento de criação
            );

            if (!isCoveredByOtherEvent) {
                 historyEvents.push({
                    id: `order-status-updated-${order.id}-${order.updatedAt.toISOString()}`,
                    timestamp: order.updatedAt.toISOString(),
                    eventType: 'STATUS_PEDIDO_ATUALIZADO',
                    description: `Status do pedido ${order.numero} atualizado para: ${order.status}.`,
                    user: 'Sistema/App', // Difícil determinar o usuário sem log de auditoria
                    details: { newStatus: order.status }
                });
            }
    }


    // 4. Comprovantes de Entrega
    order.deliveryProofs.forEach(proof => {
      historyEvents.push({
        id: proof.id,
        timestamp: proof.createdAt.toISOString(),
        eventType: 'COMPROVANTE_ANEXADO',
        description: `Comprovante de entrega anexado para o pedido ${order.numero}.`,
        user: proof.Driver?.name || 'Motorista App',
        details: { proofUrl: proof.proofUrl } // Seja cauteloso ao expor URLs diretamente
      });
    });

    // Ordenar todos os eventos por data/hora
    historyEvents.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    return historyEvents;
  }
}