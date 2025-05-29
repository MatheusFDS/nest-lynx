import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { UpdateDeliveryDto } from './dto/update-delivery.dto';

@Injectable()
export class DeliveryService {
  private readonly logger = new Logger(DeliveryService.name);

  constructor(private prisma: PrismaService) {}

  // 🎯 NOVA LÓGICA: Criação de roteiro
  async create(createDeliveryDto: CreateDeliveryDto, tenantId: string) {
    const { motoristaId, orders, veiculoId, ...rest } = createDeliveryDto;

    // 1. Verificar se motorista já está em rota ativa
    const existingDelivery = await this.prisma.delivery.findFirst({
      where: { 
        motoristaId, 
        status: { in: ['A liberar', 'Pendente'] } // ✅ NOVOS STATUS
      },
    });

    if (existingDelivery) {
      throw new BadRequestException('O motorista já possui um roteiro ativo.');
    }

    // 2. Verificar se orders são válidas (apenas Pendentes podem entrar em roteiro)
    const orderRecords = await this.prisma.order.findMany({
      where: {
        id: { in: orders.map(order => order.id) },
        status: 'Pendente', // ✅ APENAS PENDENTES
        tenantId: tenantId,
      },
    });

    if (orderRecords.length !== orders.length) {
      throw new BadRequestException('Alguns pedidos não estão disponíveis ou já estão em outro roteiro.');
    }

    // 3. Calcular valores
    const totalPeso = orderRecords.reduce((sum, order) => sum + order.peso, 0);
    const totalValor = orderRecords.reduce((sum, order) => sum + order.valor, 0);

    // 4. Calcular frete (lógica existente)
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

    // 5. Verificar regras de negócio para aprovação
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new BadRequestException('Tenant não encontrado.');
    }

    const percentualFrete = (valorFrete / totalValor) * 100;

    const reasons = [];
    if (percentualFrete > (tenant.minDeliveryPercentage || 100)) {
      reasons.push('Percentual de frete acima do máximo permitido');
    }
    if (totalValor < (tenant.minValue || 0)) {
      reasons.push('Valor total abaixo do mínimo exigido');
    }
    if (totalPeso < (tenant.minPeso || 0)) {
      reasons.push('Peso total abaixo do mínimo exigido');
    }
    if (orders.length < (tenant.minOrders || 0)) {
      reasons.push('Quantidade de documentos abaixo do mínimo exigido');
    }

    // ✅ NOVA LÓGICA: Status inicial do roteiro
    const deliveryStatus = reasons.length > 0 ? 'A liberar' : 'Pendente';
    const orderStatus = 'Em rota'; // ✅ Orders vão para "Em rota"

    // 6. Criar roteiro em transação
    const result = await this.prisma.$transaction(async (tx) => {
      // Criar delivery
      const delivery = await tx.delivery.create({
        data: {
          motoristaId,
          veiculoId,
          tenantId,
          valorFrete,
          totalPeso,
          totalValor,
          status: deliveryStatus,
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

      // Atualizar status das orders
      await tx.order.updateMany({
        where: { id: { in: orders.map(o => o.id) } },
        data: { 
          status: orderStatus,
          deliveryId: delivery.id,
          sorting: null // Reset sorting
        },
      });

      // Aplicar sorting individual se fornecido
      for (const order of orders) {
        if (order.sorting !== undefined) {
          await tx.order.update({
            where: { id: order.id },
            data: { sorting: order.sorting },
          });
        }
      }

      return delivery;
    });

    this.logger.log(`Roteiro criado: ${result.id}, Status: ${deliveryStatus}, Orders: ${orders.length}`);

    return {
      delivery: result,
      status: result.status,
      message: deliveryStatus === 'A liberar' ? 
        'Roteiro criado e enviado para liberação: ' + reasons.join(', ') :
        'Roteiro criado com sucesso!'
    };
  }

  // 🎯 NOVA LÓGICA: Liberar roteiro
  async release(id: string, tenantId: string, userId: string) {
    const delivery = await this.prisma.delivery.findFirst({
      where: { id, tenantId },
      include: { orders: true }
    });

    if (!delivery) {
      throw new NotFoundException('Roteiro não encontrado');
    }

    if (delivery.status !== 'A liberar') {
      throw new BadRequestException('Este roteiro não precisa de liberação.');
    }

    // Atualizar em transação
    const result = await this.prisma.$transaction(async (tx) => {
      // Atualizar delivery
      const updatedDelivery = await tx.delivery.update({
        where: { id },
        data: {
          status: 'Pendente', // ✅ NOVO STATUS
          dataLiberacao: new Date(),
        },
        include: {
          orders: true,
          Driver: true,
          Vehicle: true,
        }
      });

      // Orders já estão "Em rota", não precisam mudar

      // Registrar aprovação
      await tx.approval.create({
        data: {
          deliveryId: id,
          tenantId,
          action: 'approved',
          userId: userId,
          createdAt: new Date(),
        },
      });

      return updatedDelivery;
    });

    this.logger.log(`Roteiro liberado: ${id} por usuário: ${userId}`);

    return {
      ...result,
      approval: {
        userName: (await this.prisma.user.findUnique({ where: { id: userId } }))?.name,
        action: 'approved',
        createdAt: new Date().toISOString(),
      },
    };
  }

  // 🎯 NOVA LÓGICA: Rejeitar liberação
  async rejectRelease(id: string, tenantId: string, userId: string, motivo: string): Promise<void> {
    const delivery = await this.prisma.delivery.findUnique({
      where: { id },
      include: { orders: true },
    });
  
    if (!delivery) {
      throw new NotFoundException('Roteiro não encontrado');
    }
  
    if (delivery.tenantId !== tenantId) {
      throw new NotFoundException('Roteiro não encontrado para este tenant');
    }

    if (delivery.status !== 'A liberar') {
      throw new BadRequestException('Este roteiro não está pendente de liberação.');
    }

    // Rejeitar em transação
    await this.prisma.$transaction(async (tx) => {
      // Voltar orders para Pendente
      await tx.order.updateMany({
        where: { deliveryId: id },
        data: { 
          status: 'Pendente', // ✅ VOLTA PARA PENDENTE
          deliveryId: null,
          sorting: null
        },
      });

      // Registrar rejeição
      await tx.approval.create({
        data: {
          deliveryId: id,
          tenantId,
          action: 'rejected',
          motivo,
          userId,
        },
      });

      // Deletar o roteiro (ou marcar como rejeitado)
      await tx.delivery.delete({
        where: { id },
      });
    });

    this.logger.log(`Roteiro rejeitado: ${id} por usuário: ${userId}, motivo: ${motivo}`);
  }

  // 🎯 NOVA LÓGICA: Atualizar status de order individual
  async updateOrderStatus(orderId: string, newStatus: string, tenantId: string, driverId?: string) {
    // Validar status
    const validStatuses = ['Entrega Iniciada', 'Entrega Finalizada', 'Entrega Retornada'];
    if (!validStatuses.includes(newStatus)) {
      throw new BadRequestException(`Status inválido: ${newStatus}`);
    }

    const order = await this.prisma.order.findFirst({
      where: { 
        id: orderId, 
        tenantId,
        status: { not: 'Pendente' } // Deve estar em um roteiro
      },
      include: { Delivery: { include: { orders: true } } }
    });

    if (!order) {
      throw new NotFoundException('Pedido não encontrado ou não está em um roteiro.');
    }

    // Verificar se motorista tem permissão (se driverId fornecido)
    if (driverId && order.Delivery?.motoristaId !== driverId) {
      throw new BadRequestException('Você não tem permissão para alterar este pedido.');
    }

    // Verificar transição válida
    const currentStatus = order.status;
    if (!this.isValidStatusTransition(currentStatus, newStatus)) {
      throw new BadRequestException(`Não é possível mudar de "${currentStatus}" para "${newStatus}"`);
    }

    // Atualizar em transação
    const result = await this.prisma.$transaction(async (tx) => {
      // Atualizar order
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { 
          status: newStatus,
          completedAt: ['Entrega Finalizada', 'Entrega Retornada'].includes(newStatus) ? new Date() : null,
          updatedAt: new Date()
        },
      });

      // Verificar se roteiro deve ser finalizado
      if (order.Delivery) {
        const allOrders = await tx.order.findMany({
          where: { deliveryId: order.Delivery.id },
          select: { status: true }
        });

        const allFinished = allOrders.every(o => 
          o.status === 'Entrega Finalizada' || o.status === 'Entrega Retornada'
        );

        if (allFinished) {
          await tx.delivery.update({
            where: { id: order.Delivery.id },
            data: { 
              status: 'Finalizado',
              dataFim: new Date()
            },
          });

          this.logger.log(`Roteiro finalizado automaticamente: ${order.Delivery.id}`);
        }
      }

      return updatedOrder;
    });

    this.logger.log(`Order atualizada: ${orderId} -> ${newStatus}`);

    return result;
  }

  // 🎯 HELPER: Validar transição de status
  private isValidStatusTransition(currentStatus: string, newStatus: string): boolean {
    const validTransitions = {
      'Em rota': ['Entrega Iniciada'],
      'Entrega Iniciada': ['Entrega Finalizada', 'Entrega Retornada'],
      'Entrega Retornada': ['Entrega Iniciada'], // Pode tentar novamente
      'Entrega Finalizada': [] // Status final
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }

  // 🎯 ATUALIZADO: Update geral do roteiro
  async update(id: string, updateDeliveryDto: UpdateDeliveryDto, tenantId: string) {
    const { motoristaId, veiculoId, orders, status, ...rest } = updateDeliveryDto;

    const delivery = await this.prisma.delivery.findFirst({
      where: { id, tenantId },
      include: { orders: true }
    });

    if (!delivery) {
      throw new NotFoundException('Roteiro não encontrado');
    }

    // Verificar se pode ser editado
    if (delivery.status === 'Finalizado') {
      throw new BadRequestException('Não é possível editar um roteiro finalizado.');
    }

    // Verificar se motorista está livre (se mudando motorista)
    if (motoristaId && motoristaId !== delivery.motoristaId) {
      const existingDelivery = await this.prisma.delivery.findFirst({
        where: {
          motoristaId,
          status: { in: ['A liberar', 'Pendente'] },
          id: { not: id },
        },
      });

      if (existingDelivery) {
        throw new BadRequestException('O motorista já possui outro roteiro ativo.');
      }
    }

    // Atualizar
    const updatedDelivery = await this.prisma.delivery.update({
      where: { id },
      data: {
        ...rest,
        ...(motoristaId && { motoristaId }),
        ...(veiculoId && { veiculoId }),
        ...(status && { status }),
        orders: orders ? {
          set: orders.map(order => ({ id: order.id }))
        } : undefined,
      },
      include: {
        orders: true,
        Driver: true,
        Vehicle: true,
      },
    });

    return updatedDelivery;
  }

  // 🎯 MÉTODO EXISTENTE: Buscar todos os roteiros
  async findAll(tenantId: string) {
    return this.prisma.delivery.findMany({
      where: { tenantId },
      include: {
        orders: {
          orderBy: { sorting: 'asc' }
        },
        Driver: true,
        Vehicle: true,
        liberacoes: {
          include: {
            User: true,
          },
        },
      },
      orderBy: { dataInicio: 'desc' }
    });
  }

  // 🎯 MÉTODO EXISTENTE: Buscar roteiro específico
  async findOne(id: string, tenantId: string) {
    const delivery = await this.prisma.delivery.findFirst({
      where: { id, tenantId },
      include: {
        orders: {
          orderBy: { sorting: 'asc' }
        },
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
      throw new NotFoundException('Roteiro não encontrado');
    }

    return delivery;
  }

  // 🎯 ATUALIZADO: Remover roteiro
  async remove(id: string, tenantId: string) {
    const delivery = await this.findOne(id, tenantId);

    if (delivery.status === 'Finalizado') {
      throw new BadRequestException('Não é possível excluir um roteiro finalizado.');
    }

    // Verificar pagamentos baixados
    const hasPayments = await this.prisma.accountsPayable.findFirst({
      where: {
        paymentDeliveries: { some: { deliveryId: id } },
        status: 'Baixado',
      },
    });

    if (hasPayments) {
      throw new BadRequestException('Não é possível excluir um roteiro com pagamentos baixados.');
    }

    // Remover em transação
    await this.prisma.$transaction(async (tx) => {
      // Voltar orders para Pendente
      await tx.order.updateMany({
        where: { deliveryId: id },
        data: { 
          status: 'Pendente',
          deliveryId: null,
          sorting: null,
          completedAt: null
        },
      });

      // Limpar relacionamentos
      await tx.paymentDelivery.deleteMany({
        where: { deliveryId: id },
      });

      await tx.accountsPayable.deleteMany({
        where: {
          paymentDeliveries: { some: { deliveryId: id } },
        },
      });

      await tx.approval.deleteMany({
        where: { deliveryId: id },
      });

      // Deletar roteiro
      await tx.delivery.delete({ where: { id } });
    });

    this.logger.log(`Roteiro removido: ${id}`);

    return { message: 'Roteiro removido com sucesso' };
  }

  // 🎯 ATUALIZADO: Remover order de roteiro
  async removeOrderFromDelivery(deliveryId: string, orderId: string, tenantId: string) {
    const delivery = await this.prisma.delivery.findFirst({
      where: { id: deliveryId, tenantId },
      include: { orders: true },
    });

    if (!delivery) {
      throw new NotFoundException('Roteiro não encontrado');
    }

    if (delivery.status === 'Finalizado') {
      throw new BadRequestException('Não é possível remover pedidos de um roteiro finalizado.');
    }

    const order = delivery.orders.find(o => o.id === orderId);
    if (!order) {
      throw new NotFoundException('Pedido não encontrado neste roteiro.');
    }

    if (['Entrega Finalizada', 'Entrega Retornada'].includes(order.status)) {
      throw new BadRequestException('Não é possível remover um pedido que já foi finalizado.');
    }

    // Remover em transação
    const result = await this.prisma.$transaction(async (tx) => {
      // Desconectar order
      const updatedDelivery = await tx.delivery.update({
        where: { id: deliveryId },
        data: {
          orders: {
            disconnect: { id: orderId },
          },
        },
        include: { 
          orders: {
            orderBy: { sorting: 'asc' }
          }
        },
      });

      // Voltar order para Pendente
      await tx.order.update({
        where: { id: orderId },
        data: { 
          status: 'Pendente',
          deliveryId: null,
          sorting: null,
          completedAt: null
        },
      });

      return updatedDelivery;
    });

    this.logger.log(`Order removida do roteiro: ${orderId} do roteiro ${deliveryId}`);

    return result;
  }
}