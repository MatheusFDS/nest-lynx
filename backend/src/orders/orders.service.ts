// Conteúdo para: src/orders/orders.service.ts

import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { parse, isValid } from 'date-fns';
import { OrderHistoryEventDto, OrderHistoryEventType } from './dto/order-history-event.dto';
import { OrderStatus, DeliveryStatus, ApprovalAction } from '../types/status.enum';

@Injectable()
export class OrdersService {
  bulkDelete(ids: string[], tenantId: any) {
    throw new Error('Method not implemented.');
  }
  remove(id: string, tenantId: any) {
    throw new Error('Method not implemented.');
  }
  update(id: string, updateData: Partial<{ id: string; numero: string; data: Date; idCliente: string; cliente: string; endereco: string; cidade: string; uf: string; peso: number; volume: number; prazo: string | null; prioridade: string; telefone: string; email: string; bairro: string; valor: number; instrucoesEntrega: string | null; nomeContato: string; cpfCnpj: string; cep: string; status: string; motivoNaoEntrega: string | null; codigoMotivoNaoEntrega: string | null; deliveryId: string | null; tenantId: string; driverId: string | null; sorting: number | null; startedAt: Date | null; completedAt: Date | null; createdAt: Date; updatedAt: Date; }>, tenantId: any) {
    throw new Error('Method not implemented.');
  }
  private readonly logger = new Logger(OrdersService.name);

  constructor(private prisma: PrismaService) {}

  convertToISODate(dateString: string): string {
    // Tenta dd/MM/yyyy primeiro
    let parsedDate = parse(dateString, 'dd/MM/yyyy', new Date());

    if (!isValid(parsedDate)) {
      // Tenta yyyy-MM-dd (formato ISO simplificado)
      parsedDate = parse(dateString, 'yyyy-MM-dd', new Date());
    }

    if (!isValid(parsedDate)) {
      // Tenta ISO com timezone (o construtor Date já lida com isso)
      parsedDate = new Date(dateString);
    }

    if (!isValid(parsedDate)) {
      this.logger.error(`Formato de data inválido: ${dateString}. Esperado dd/MM/yyyy, yyyy-MM-dd, ou formato ISO completo.`);
      throw new BadRequestException(`Formato de data inválido: ${dateString}. Esperado dd/MM/yyyy, yyyy-MM-dd, ou formato ISO completo.`);
    }
    return parsedDate.toISOString();
  }

  async upload(orders: any[], tenantId: string) {
    const createdOrders = [];
    const errors = [];

    for (const order of orders) {
      try {
        let parsedDate: string | null = null;
        if (order.data) {
          try {
            parsedDate = this.convertToISODate(order.data);
          } catch (error) {
            this.logger.error(`Formato de data inválido para o pedido ${order.numero}: ${order.data}`);
            // Adiciona mais detalhes ao erro para o cliente
            throw new BadRequestException(`Formato de data inválido para o pedido ${order.numero}: '${order.data}'. Detalhe: ${error.message}`);
          }
        } else {
          throw new BadRequestException(`Data é obrigatória para o pedido ${order.numero || 'sem número'}.`);
        }


        if (!order.numero) {
            throw new BadRequestException(`Número do pedido (campo 'numero') é obrigatório.`);
        }
        const existingOrder = await this.prisma.order.findFirst({
          where: {
            numero: order.numero.toString(),
            tenantId: tenantId,
          },
        });

        if (existingOrder) {
          throw new BadRequestException(`Pedido com número ${order.numero} já existe para o tenant ${tenantId}.`);
        }

        const createdOrder = await this.prisma.order.create({
          data: {
            numero: order.numero.toString(),
            data: parsedDate,
            idCliente: order.idCliente?.toString() || 'N/A',
            cliente: order.cliente || 'N/A',
            endereco: order.endereco || 'N/A',
            cidade: order.cidade || 'N/A',
            uf: order.uf || 'N/A',
            peso: typeof order.peso === 'string' ? parseFloat(order.peso.replace(',', '.')) : (order.peso || 0),
            volume: typeof order.volume === 'string' ? parseInt(order.volume, 10) : (order.volume || 0),
            prazo: order.prazo?.toString() || '',
            prioridade: order.prioridade?.toString() || 'Normal',
            telefone: order.telefone?.toString() || '',
            email: order.email?.toString() || '',
            bairro: order.bairro || 'N/A',
            valor: typeof order.valor === 'string' ? parseFloat(order.valor.replace(',', '.')) : (order.valor || 0),
            instrucoesEntrega: order.instrucoesEntrega || '',
            nomeContato: order.nomeContato?.toString() || '',
            cpfCnpj: order.cpfCnpj?.toString() || 'N/A',
            cep: order.cep?.toString() || 'N/A',
            status: OrderStatus.SEM_ROTA, // Novo status padrão
            // deliveryId não é definido no upload, pedido nasce sem roteiro
            tenantId: tenantId,
            sorting: order.sorting !== undefined && order.sorting !== null ? parseInt(order.sorting, 10) : null,
            // motivoNaoEntrega e codigoMotivoNaoEntrega não são definidos no upload inicial
          },
        });
        createdOrders.push(createdOrder);
      } catch (error) {
        this.logger.error(`Falha ao enviar pedido ${order.numero || 'sem número definido'}: ${error.message}`);
        errors.push({ orderNumber: order.numero || 'sem número definido', error: error.message });
         // Não relançar o erro aqui para tentar processar os próximos pedidos, a menos que seja uma política diferente.
      }
    }

    if (errors.length > 0 && createdOrders.length === 0) {
        // Se todos os pedidos falharam, lançar um erro geral.
        throw new BadRequestException({
            message: 'Nenhum pedido foi carregado devido a erros.',
            errors,
        });
    }
    if (errors.length > 0) {
        // Se alguns pedidos foram criados e outros não.
         return {
            message: 'Alguns pedidos foram criados, mas outros continham erros.',
            createdOrders,
            errors
        }
    }

    return createdOrders; // Apenas se todos os pedidos foram criados com sucesso.
  }

  async findAll(tenantId: string) {
    return this.prisma.order.findMany({
      where: { tenantId },
      include: {
        Delivery: {
          include: {
            Driver: true,
            Vehicle: true,
            approvals: { include: { User: true }, orderBy: {createdAt: 'desc'} }, // Incluir aprovações do roteiro
          },
        },
        Driver: true, // Motorista que efetivamente interagiu com o pedido (e.g., marcou como "Em entrega")
      },
      orderBy: {
        createdAt: 'desc',
      }
    });
  }

  async findOne(id: string, tenantId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, tenantId },
      include: {
        Delivery: {
            include: {
                Driver: true,
                Vehicle: true,
                approvals: { include: { User: true }, orderBy: {createdAt: 'desc'} }
            }
        },
        Driver: true,
        deliveryProofs: { orderBy: { createdAt: 'asc' } },
      }
    });
    if (!order) {
      throw new NotFoundException(`Pedido com ID ${id} não encontrado.`);
    }
    return order;
  }

  async findOrderHistory(orderId: string, tenantId: string): Promise<OrderHistoryEventDto[]> {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, tenantId },
      include: {
        Delivery: {
          include: {
            Driver: true, // Motorista do roteiro
            Vehicle: true,
            approvals: { // Inclui o histórico de aprovações do roteiro
              include: { User: true }, // Usuário que aprovou/rejeitou
              orderBy: { createdAt: 'asc' },
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
        Driver: true, // Motorista que efetivamente interagiu com o pedido (e.g., marcou como "Em entrega", anexou comprovante)
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
      eventType: OrderHistoryEventType.PEDIDO_CRIADO,
      description: `Pedido ${order.numero} criado no sistema. Status inicial: ${OrderStatus.SEM_ROTA}.`, // Pedidos nascem SEM_ROTA
      user: 'Sistema',
      details: {
        orderNumber: order.numero,
        newStatus: OrderStatus.SEM_ROTA, // Status do pedido no momento da criação
      }
    });

    // 2. Eventos relacionados ao Roteiro (Delivery) e suas Aprovações/Rejeições
    if (order.Delivery) {
      const delivery = order.Delivery;

      // Evento de associação ao roteiro
      // O timestamp deste evento deve ser quando o pedido foi efetivamente ligado ao roteiro.
      // order.updatedAt é uma boa aproximação se o status do pedido mudou nesse momento.
      let associationTimestamp = order.updatedAt.toISOString();
      if (order.createdAt.getTime() === order.updatedAt.getTime() && delivery.createdAt.getTime() >= order.createdAt.getTime()) {
          // Se o pedido não foi atualizado desde a criação E o roteiro foi criado junto ou depois,
          // o timestamp de criação do roteiro pode ser mais preciso para a associação inicial.
          associationTimestamp = delivery.createdAt.toISOString();
      }


      const initialAssociationEventType = delivery.status === DeliveryStatus.A_LIBERAR
        ? OrderHistoryEventType.ROTEIRO_ASSOCIADO_AGUARDANDO_LIBERACAO
        : OrderHistoryEventType.ROTEIRO_ASSOCIADO;
      const initialAssociationDescription = delivery.status === DeliveryStatus.A_LIBERAR
        ? `Pedido ${order.numero} associado ao roteiro ${delivery.id} (Roteiro: ${DeliveryStatus.A_LIBERAR}). Status do pedido: ${OrderStatus.EM_ROTA_AGUARDANDO_LIBERACAO}.`
        : `Pedido ${order.numero} associado ao roteiro ${delivery.id} (Roteiro: ${delivery.status}). Status do pedido: ${OrderStatus.EM_ROTA}.`;

      historyEvents.push({
        id: `delivery-associated-${delivery.id}-${order.id}`,
        timestamp: associationTimestamp,
        eventType: initialAssociationEventType,
        description: initialAssociationDescription,
        user: 'Sistema', // Ou quem criou/atualizou o roteiro
        details: {
          orderNumber: order.numero,
          deliveryId: delivery.id,
          driverName: delivery.Driver?.name,
          vehiclePlate: delivery.Vehicle?.plate,
          deliveryStatus: delivery.status, // Status do roteiro no momento
          newStatus: delivery.status === DeliveryStatus.A_LIBERAR ? OrderStatus.EM_ROTA_AGUARDANDO_LIBERACAO : OrderStatus.EM_ROTA, // Status do pedido
        },
      });

      // Eventos de Aprovação/Rejeição do Roteiro
      delivery.approvals.forEach(approval => {
        let eventTypeForOrderContext: OrderHistoryEventType | string = '';
        let descriptionForOrderContext = '';
        let orderStatusAfterApprovalEvent = order.status; // Status atual do pedido para referência

        if (approval.action.toUpperCase() === ApprovalAction.APPROVED) {
          eventTypeForOrderContext = OrderHistoryEventType.ROTEIRO_LIBERADO_PARA_PEDIDO;
          descriptionForOrderContext = `Roteiro ${delivery.id} (que inclui o pedido ${order.numero}) foi liberado.`;
          // Se o pedido estava aguardando e o roteiro foi para Iniciado
          if (order.status === OrderStatus.EM_ROTA_AGUARDANDO_LIBERACAO) {
             orderStatusAfterApprovalEvent = OrderStatus.EM_ROTA;
          }
        } else if (approval.action.toUpperCase() === ApprovalAction.REJECTED) {
          eventTypeForOrderContext = OrderHistoryEventType.ROTEIRO_REJEITADO_PARA_PEDIDO;
          descriptionForOrderContext = `Roteiro ${delivery.id} (que inclui o pedido ${order.numero}) foi rejeitado. Motivo: ${approval.motivo || 'Não especificado'}.`;
           // Se o pedido estava aguardando e o roteiro foi rejeitado
          if (order.status === OrderStatus.EM_ROTA_AGUARDANDO_LIBERACAO) {
            orderStatusAfterApprovalEvent = OrderStatus.SEM_ROTA; // Pedido volta para sem rota
          }
        } else if (approval.action.toUpperCase() === 'RE_APPROVAL_NEEDED') {
            eventTypeForOrderContext = 'ROTEIRO_REQUER_NOVA_LIBERACAO_PARA_PEDIDO';
            descriptionForOrderContext = `Alterações no roteiro ${delivery.id} (que inclui o pedido ${order.numero}) exigem nova liberação. Motivo: ${approval.motivo || 'Não especificado'}.`;
            if (order.status === OrderStatus.EM_ROTA) { // Se estava em rota e o roteiro voltou para A_LIBERAR
                orderStatusAfterApprovalEvent = OrderStatus.EM_ROTA_AGUARDANDO_LIBERACAO;
            }
        }


        if (eventTypeForOrderContext) {
            historyEvents.push({
              id: approval.id, // ID da aprovação
              timestamp: approval.createdAt.toISOString(),
              eventType: eventTypeForOrderContext,
              description: descriptionForOrderContext,
              user: approval.User?.name || 'Usuário Desconhecido',
              details: {
                orderNumber: order.numero,
                deliveryId: delivery.id,
                // O status do roteiro após a ação de approval
                deliveryStatus: approval.action.toUpperCase() === ApprovalAction.APPROVED ? DeliveryStatus.INICIADO :
                                approval.action.toUpperCase() === ApprovalAction.REJECTED ? DeliveryStatus.REJEITADO :
                                approval.action.toUpperCase() === 'RE_APPROVAL_NEEDED' ? DeliveryStatus.A_LIBERAR : delivery.status,
                approvalAction: approval.action,
                approvalReason: approval.motivo,
                newStatus: orderStatusAfterApprovalEvent // Status do pedido após o evento de aprovação
              },
            });
        }
      });
      
      // Evento de Finalização do Roteiro
      if (delivery.status === DeliveryStatus.FINALIZADO && delivery.dataFim) {
        historyEvents.push({
            id: `delivery-finalizado-${delivery.id}-for-order-${order.id}`, // ID único para o contexto do pedido
            timestamp: delivery.dataFim.toISOString(),
            eventType: OrderHistoryEventType.ROTEIRO_FINALIZADO,
            description: `Roteiro ${delivery.id} que incluía o pedido ${order.numero} foi finalizado.`,
            user: delivery.Driver?.name || 'Sistema', // Pode ser o motorista ou sistema (automático)
            details: {
                orderNumber: order.numero,
                deliveryId: delivery.id,
                deliveryStatus: DeliveryStatus.FINALIZADO
            }
        });
      }
    }

    // 3. Eventos de Status do Pedido (EM_ENTREGA, ENTREGUE, NAO_ENTREGUE)
    // Estes eventos são baseados nos campos startedAt e completedAt do pedido.
    if (order.startedAt) {
      historyEvents.push({
        id: `order-delivery-started-${order.id}`,
        timestamp: order.startedAt.toISOString(),
        eventType: OrderHistoryEventType.ENTREGA_INICIADA,
        description: `Entrega do pedido ${order.numero} iniciada.`,
        user: order.Driver?.name || order.Delivery?.Driver?.name || 'Motorista App', // Driver que iniciou
        details: {
            orderNumber: order.numero,
            newStatus: OrderStatus.EM_ENTREGA, // Status do pedido
            driverName: order.Driver?.name || order.Delivery?.Driver?.name,
        }
      });
    }

    if (order.completedAt) {
      if (order.status === OrderStatus.ENTREGUE) {
        historyEvents.push({
          id: `order-delivered-${order.id}`,
          timestamp: order.completedAt.toISOString(),
          eventType: OrderHistoryEventType.PEDIDO_ENTREGUE,
          description: `Pedido ${order.numero} entregue com sucesso.`,
          user: order.Driver?.name || order.Delivery?.Driver?.name || 'Motorista App', // Driver que completou
          details: {
            orderNumber: order.numero,
            finalStatus: order.status, // Status final do pedido
            driverName: order.Driver?.name || order.Delivery?.Driver?.name,
          }
        });
      } else if (order.status === OrderStatus.NAO_ENTREGUE) {
        historyEvents.push({
          id: `order-not-delivered-${order.id}`,
          timestamp: order.completedAt.toISOString(),
          eventType: OrderHistoryEventType.PEDIDO_NAO_ENTREGUE,
          description: `Tentativa de entrega do pedido ${order.numero} falhou. Motivo: ${order.motivoNaoEntrega || 'Não especificado'}.`,
          user: order.Driver?.name || order.Delivery?.Driver?.name || 'Motorista App', // Driver que reportou
          details: {
            orderNumber: order.numero,
            finalStatus: order.status, // Status final do pedido
            motivoNaoEntrega: order.motivoNaoEntrega,
            codigoMotivoNaoEntrega: order.codigoMotivoNaoEntrega,
            driverName: order.Driver?.name || order.Delivery?.Driver?.name,
          }
        });
      }
    }
    
    // 4. Comprovantes de Entrega
    order.deliveryProofs.forEach(proof => {
      historyEvents.push({
        id: proof.id, // ID do comprovante
        timestamp: proof.createdAt.toISOString(),
        eventType: OrderHistoryEventType.COMPROVANTE_ANEXADO,
        description: `Comprovante de entrega anexado para o pedido ${order.numero}.`,
        user: proof.Driver?.name || 'Motorista App', // Driver que anexou
        details: {
          orderNumber: order.numero,
          proofUrl: proof.proofUrl, // Cuidado ao expor URLs diretamente se não forem seguras
          driverName: proof.Driver?.name
        }
      });
    });
    
    // Ordenar todos os eventos por data/hora antes de adicionar eventos genéricos
    historyEvents.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    // Evento genérico para a última atualização de status do pedido, se não coberto por eventos mais específicos.
    // Este evento é útil para capturar mudanças de status que não têm um campo de timestamp dedicado (ex: SEM_ROTA -> EM_ROTA_AGUARDANDO_LIBERACAO)
    // e que não foram cobertas pela lógica de associação ao roteiro (que usa order.updatedAt).
    const lastSpecificEvent = historyEvents.length > 0 ? historyEvents[historyEvents.length - 1] : null;
    if (lastSpecificEvent && order.updatedAt.toISOString() > lastSpecificEvent.timestamp && order.status !== lastSpecificEvent.details?.newStatus && order.status !== lastSpecificEvent.details?.finalStatus) {
        // Apenas se updatedAt for mais recente que o último evento específico E o status atual for diferente do status do último evento.
        const isCoveredByTimestampFields =
            (order.status === OrderStatus.EM_ENTREGA && order.startedAt?.toISOString() === order.updatedAt.toISOString()) ||
            ((order.status === OrderStatus.ENTREGUE || order.status === OrderStatus.NAO_ENTREGUE) && order.completedAt?.toISOString() === order.updatedAt.toISOString());

        if (!isCoveredByTimestampFields) {
            historyEvents.push({
                id: `order-status-updated-${order.id}-${order.updatedAt.toISOString()}`,
                timestamp: order.updatedAt.toISOString(),
                eventType: OrderHistoryEventType.STATUS_PEDIDO_ATUALIZADO,
                description: `Status do pedido ${order.numero} atualizado para: ${order.status}.`,
                user: 'Sistema/App', // Difícil determinar o usuário sem log de auditoria mais granular
                details: {
                    orderNumber: order.numero,
                    newStatus: order.status,
                    oldStatus: lastSpecificEvent.details?.newStatus || lastSpecificEvent.details?.finalStatus,
                }
            });
            // Re-sort para garantir a ordem correta se um evento genérico foi adicionado.
            historyEvents.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        }
    }


    return historyEvents;
  }
}