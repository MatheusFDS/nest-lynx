import { Injectable, Logger, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DeliveryService } from '../delivery/delivery.service';
import { OrderStatus, DeliveryStatus } from '../types/status.enum';
import * as sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MobileService {
  private readonly logger = new Logger(MobileService.name);

  constructor(
    private readonly deliveryService: DeliveryService,
    private readonly prisma: PrismaService,
  ) {}

  private isValidUUID(id: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }

  async getProfile(userId: string, tenantId: string) {
    this.logger.debug(`📱 [PROFILE] Buscando perfil - User: ${userId}, Tenant: ${tenantId}`);
    
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { 
        tenant: true,
        role: true 
      }
    });

    if (!user) {
      this.logger.warn(`⚠️ [PROFILE] Usuário ${userId} não encontrado.`);
      throw new NotFoundException('Usuário não encontrado');
    }

    let driver = await this.prisma.driver.findFirst({
      where: { 
        userId: userId,
        tenantId: tenantId 
      }
    });

    if (!driver && user.name) {
      this.logger.debug(`[PROFILE] Motorista não encontrado por userId, tentando por nome: ${user.name}`);
      driver = await this.prisma.driver.findFirst({
        where: { 
          tenantId: tenantId,
          name: { contains: user.name, mode: 'insensitive' }
        }
      });
    }

    const vehicle = driver ? await this.prisma.vehicle.findFirst({
      where: { driverId: driver.id, tenantId: tenantId },
      include: { Category: true }
    }) : null;
    
    return {
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: driver?.cpf || user.email,
        vehicle: vehicle ? `${vehicle.model}` : 'Não informado',
        plate: vehicle?.plate || 'Não informado',
        companyName: user.tenant?.name || 'Empresa',
        companyCnpj: '12.345.678/0001-90',
        tenantId: user.tenantId,
        driverId: driver?.id || null,
      },
      success: true,
      message: 'Perfil carregado com sucesso'
    };
  }

  async getDriverRoutes(userId: string, tenantId: string, driverIdFromJwt?: string, includeHistory: boolean = false) {
    this.logger.debug(`📱 [ROUTES] Buscando roteiros - User: ${userId}, DriverJWT: ${driverIdFromJwt}, Tenant: ${tenantId}, History: ${includeHistory}`);
    
    let driver = null;

    if (driverIdFromJwt) {
      driver = await this.prisma.driver.findFirst({ where: { id: driverIdFromJwt, tenantId }});
    } else {
      this.logger.warn(`[ROUTES] DriverId não encontrado no JWT para User: ${userId}. Usando lógica de fallback.`);
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (user) {
          driver = await this.prisma.driver.findFirst({ where: { userId: user.id, tenantId } });
          if (!driver && user.name) {
              driver = await this.prisma.driver.findFirst({
                  where: { tenantId, name: { contains: user.name, mode: 'insensitive' } }
              });
          }
      }
    }

    if (!driver) {
      this.logger.warn(`⚠️ [ROUTES] Nenhum motorista encontrado/associado para User: ${userId}`);
      return {
        data: [],
        success: true,
        message: 'Nenhum motorista associado a este usuário ou motorista não encontrado.'
      };
    }
    
    const statusFilter = includeHistory 
      ? [DeliveryStatus.A_LIBERAR, DeliveryStatus.INICIADO, DeliveryStatus.FINALIZADO]
      : [DeliveryStatus.A_LIBERAR, DeliveryStatus.INICIADO];
    
    const deliveriesFromDb = await this.prisma.delivery.findMany({
      where: { 
        motoristaId: driver.id,
        tenantId,
        status: { in: statusFilter }
      },
      include: {
        orders: {
          orderBy: { sorting: 'asc' },
          include: {
            deliveryProofs: {
              select: {
                id: true,
                proofUrl: true,
                createdAt: true
              }
            }
          }
        },
        Driver: true,
        Vehicle: true,
        paymentDeliveries: {
          include: {
            accountsPayable: {
              select: { status: true }
            }
          }
        }
      },
      orderBy: { dataInicio: 'desc' }
    });
    
    this.logger.debug(`📱 [ROUTES] ${deliveriesFromDb.length} roteiros encontrados para o motorista ${driver.id} (includeHistory: ${includeHistory})`);
    
    const routes = deliveriesFromDb.map(delivery => {
      let paymentStatus: 'pago' | 'nao_pago' = 'nao_pago';
      if (delivery.paymentDeliveries && delivery.paymentDeliveries.length > 0) {
        const isPaid = delivery.paymentDeliveries.some(
          pd => pd.accountsPayable?.status?.toUpperCase() === 'PAGO'
        );
        if (isPaid) {
          paymentStatus = 'pago';
        }
      }

      return {
        id: delivery.id,
        date: delivery.dataInicio.toISOString().split('T')[0],
        status: this.mapRouteStatusToMobile(delivery.status as DeliveryStatus),
        totalValue: delivery.totalValor,
        freightValue: delivery.valorFrete,
        paymentStatus: paymentStatus,
        observacao: delivery.observacao,
        vehicle: delivery.Vehicle ? `${delivery.Vehicle.model} (${delivery.Vehicle.plate})` : 'Não informado',
        driverName: delivery.Driver?.name || 'Não informado',
        deliveries: delivery.orders.map(order => ({
          id: order.id,
          customerName: order.cliente,
          address: `${order.endereco}, ${order.bairro}, ${order.cidade} - ${order.uf} (${order.cep})`,
          phone: order.telefone,
          value: order.valor,
          status: this.mapOrderStatusToMobile(order.status as OrderStatus),
          items: [`Pedido ${order.numero}`],
          paymentMethod: 'A combinar',
          notes: order.instrucoesEntrega,
          numeroPedido: order.numero,
          sorting: order.sorting,
          cpfCnpjDestinatario: order.cpfCnpj,
          nomeContato: order.nomeContato,
          emailDestinatario: order.email,
          hasProof: order.deliveryProofs.length > 0,
          proofCount: order.deliveryProofs.length
        }))
      };
    });

    return {
      data: routes,
      success: true,
      message: `${routes.length} roteiros encontrados.`
    };
  }

  async getDriverHistory(userId: string, tenantId: string, driverIdFromJwt?: string) {
    this.logger.debug(`📱 [HISTORY] Buscando histórico - User: ${userId}, DriverJWT: ${driverIdFromJwt}, Tenant: ${tenantId}`);
    
    let driver = null;
    if (driverIdFromJwt) {
      driver = await this.prisma.driver.findFirst({ where: { id: driverIdFromJwt, tenantId }});
    } else {
      this.logger.warn(`[HISTORY] DriverId não encontrado no JWT para User: ${userId}. Usando lógica de fallback.`);
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (user) {
          driver = await this.prisma.driver.findFirst({ where: { userId: user.id, tenantId } });
          if (!driver && user.name) {
              driver = await this.prisma.driver.findFirst({
                  where: { tenantId, name: { contains: user.name, mode: 'insensitive' } }
              });
          }
      }
    }

    if (!driver) {
      this.logger.warn(`⚠️ [HISTORY] Nenhum motorista encontrado/associado para User: ${userId}`);
      return {
        data: [],
        success: true,
        message: 'Nenhum motorista associado a este usuário ou motorista não encontrado.'
      };
    }
    
    const deliveriesFromDb = await this.prisma.delivery.findMany({
      where: { 
        motoristaId: driver.id,
        tenantId,
        status: DeliveryStatus.FINALIZADO
      },
      include: {
        orders: {
          orderBy: { sorting: 'asc' },
          include: {
            deliveryProofs: {
              select: {
                id: true,
                proofUrl: true,
                createdAt: true
              }
            }
          }
        },
        Driver: true,
        Vehicle: true,
        paymentDeliveries: {
          include: {
            accountsPayable: {
              select: { status: true }
            }
          }
        }
      },
      orderBy: { dataFim: 'desc' }
    });
    
    this.logger.debug(`📱 [HISTORY] ${deliveriesFromDb.length} roteiros finalizados encontrados para o motorista ${driver.id}`);
    
    const routes = deliveriesFromDb.map(delivery => {
      let paymentStatus: 'pago' | 'nao_pago' = 'nao_pago';
      if (delivery.paymentDeliveries && delivery.paymentDeliveries.length > 0) {
        const isPaid = delivery.paymentDeliveries.some(
          pd => pd.accountsPayable?.status?.toUpperCase() === 'PAGO'
        );
        if (isPaid) {
          paymentStatus = 'pago';
        }
      }

      return {
        id: delivery.id,
        date: (delivery.dataFim || delivery.dataInicio).toISOString().split('T')[0],
        status: this.mapRouteStatusToMobile(delivery.status as DeliveryStatus),
        totalValue: delivery.totalValor,
        freightValue: delivery.valorFrete,
        paymentStatus: paymentStatus,
        observacao: delivery.observacao,
        vehicle: delivery.Vehicle ? `${delivery.Vehicle.model} (${delivery.Vehicle.plate})` : 'Não informado',
        driverName: delivery.Driver?.name || 'Não informado',
        deliveries: delivery.orders.map(order => ({
          id: order.id,
          customerName: order.cliente,
          address: `${order.endereco}, ${order.bairro}, ${order.cidade} - ${order.uf} (${order.cep})`,
          phone: order.telefone,
          value: order.valor,
          status: this.mapOrderStatusToMobile(order.status as OrderStatus),
          items: [`Pedido ${order.numero}`],
          paymentMethod: 'A combinar',
          notes: order.instrucoesEntrega,
          numeroPedido: order.numero,
          sorting: order.sorting,
          cpfCnpjDestinatario: order.cpfCnpj,
          nomeContato: order.nomeContato,
          emailDestinatario: order.email,
          hasProof: order.deliveryProofs.length > 0,
          proofCount: order.deliveryProofs.length
        }))
      };
    });

    return {
      data: routes,
      success: true,
      message: `${routes.length} roteiros do histórico encontrados.`
    };
  }

  async getDriverReceivables(driverId: string, tenantId: string) {
    this.logger.debug(`💰 [RECEIVABLES] Buscando valores a receber para Driver: ${driverId}, Tenant: ${tenantId}`);

    const deliveries = await this.prisma.delivery.findMany({
      where: {
        motoristaId: driverId,
        tenantId: tenantId,
        status: DeliveryStatus.FINALIZADO,
      },
      select: {
        valorFrete: true,
        paymentDeliveries: {
          include: {
            accountsPayable: {
              select: { status: true }
            }
          }
        }
      }
    });

    let totalReceivableAmount = 0;
    deliveries.forEach(delivery => {
      let isDeliveryPaid = false;
      if (delivery.paymentDeliveries && delivery.paymentDeliveries.length > 0) {
        isDeliveryPaid = delivery.paymentDeliveries.some(
          pd => pd.accountsPayable?.status?.toUpperCase() === 'PAGO'
        );
      }
      if (!isDeliveryPaid) {
        totalReceivableAmount += delivery.valorFrete;
      }
    });

    return {
      data: {
        totalAmount: totalReceivableAmount,
      },
      success: true,
      message: 'Total a receber carregado com sucesso.',
    };
  }

  async getRouteDetails(routeId: string, tenantId: string, driverIdFromJwt?: string) {
    if (!this.isValidUUID(routeId)) {
      throw new BadRequestException(`ID de roteiro inválido: ${routeId}`);
    }
    
    this.logger.debug(`📱 [ROUTE_DETAILS] Buscando roteiro ${routeId} para tenant ${tenantId}`);
    
    const delivery = await this.prisma.delivery.findFirst({
      where: { 
        id: routeId, 
        tenantId: tenantId,
      },
      include: {
        orders: {
          orderBy: { sorting: 'asc' },
          include: {
            deliveryProofs: {
              select: {
                id: true,
                proofUrl: true,
                createdAt: true
              }
            }
          }
        },
        Driver: true,
        Vehicle: true,
      }
    });

    if (!delivery) {
      throw new NotFoundException('Roteiro não encontrado ou não pertence a este motorista.');
    }

    if (driverIdFromJwt && delivery.motoristaId !== driverIdFromJwt) {
      this.logger.warn(`[ROUTE_DETAILS] Motorista ${driverIdFromJwt} tentando acessar roteiro ${routeId} de outro motorista (${delivery.motoristaId}).`);
      throw new ForbiddenException('Você não tem permissão para acessar este roteiro.');
    }
    
    const route = {
      id: delivery.id,
      date: delivery.dataInicio.toISOString().split('T')[0],
      status: this.mapRouteStatusToMobile(delivery.status as DeliveryStatus),
      totalValue: delivery.totalValor,
      observacao: delivery.observacao,
      vehicle: delivery.Vehicle ? `${delivery.Vehicle.model} (${delivery.Vehicle.plate})` : 'Não informado',
      driverName: delivery.Driver?.name || 'Não informado',
      deliveries: delivery.orders.map(order => ({
        id: order.id,
        customerName: order.cliente,
        address: `${order.endereco}, ${order.bairro}, ${order.cidade} - ${order.uf} (${order.cep})`,
        phone: order.telefone,
        value: order.valor,
        status: this.mapOrderStatusToMobile(order.status as OrderStatus),
        items: [`Pedido ${order.numero}`],
        paymentMethod: 'A combinar',
        notes: order.instrucoesEntrega,
        numeroPedido: order.numero,
        sorting: order.sorting,
        cpfCnpjDestinatario: order.cpfCnpj,
        nomeContato: order.nomeContato,
        emailDestinatario: order.email,
        hasProof: order.deliveryProofs.length > 0,
        proofCount: order.deliveryProofs.length
      }))
    };

    return {
      data: route,
      success: true,
      message: 'Roteiro carregado com sucesso'
    };
  }

  async getDeliveryDetails(orderId: string, tenantId: string) {
    if (!this.isValidUUID(orderId)) {
      throw new BadRequestException(`ID de pedido inválido: ${orderId}`);
    }
    
    const order = await this.prisma.order.findFirst({
      where: { 
        id: orderId,
        tenantId 
      },
      include: {
          Delivery: {
              select: {
                  id: true,
                  status: true,
                  observacao: true,
              }
          },
          deliveryProofs: {
            select: {
              id: true,
              proofUrl: true,
              createdAt: true
            },
            orderBy: { createdAt: 'desc' }
          }
      }
    });

    if (!order) {
      throw new NotFoundException('Pedido (entrega individual) não encontrado.');
    }

    const deliveryDetails = {
      id: order.id,
      customerName: order.cliente,
      address: `${order.endereco}, ${order.bairro}, ${order.cidade} - ${order.uf} (${order.cep})`,
      phone: order.telefone,
      value: order.valor,
      status: this.mapOrderStatusToMobile(order.status as OrderStatus),
      items: [`Pedido ${order.numero}`],
      paymentMethod: 'A combinar',
      notes: order.instrucoesEntrega,
      numeroPedido: order.numero,
      cpfCnpjDestinatario: order.cpfCnpj,
      nomeContato: order.nomeContato,
      emailDestinatario: order.email,
      routeId: order.Delivery?.id || null,
      routeStatus: order.Delivery ? this.mapRouteStatusToMobile(order.Delivery.status as DeliveryStatus) : null,
      routeNotes: order.Delivery?.observacao || null,
      hasProof: order.deliveryProofs.length > 0,
      proofCount: order.deliveryProofs.length,
      proofs: order.deliveryProofs
    };

    return {
      data: deliveryDetails,
      success: true,
      message: 'Detalhes da entrega individual carregados'
    };
  }

  async updateOrderStatus(
    orderId: string,
    updateData: { 
        status: string;
        motivoNaoEntrega?: string; 
        codigoMotivoNaoEntrega?: string;
    },
    tenantId: string,
    driverIdFromJwt: string,
    userId: string
  ) {
    if (!driverIdFromJwt) {
        this.logger.error(`[UPDATE_STATUS] Tentativa de atualização de status do pedido ${orderId} sem driverId no token JWT para usuário ${userId}.`);
        throw new BadRequestException('Motorista não autenticado corretamente (driverId ausente no token).');
    }
    
    if (!this.isValidUUID(orderId)) {
      throw new BadRequestException(`ID de pedido inválido: ${orderId}`);
    }
    
    this.logger.debug(`📱 [UPDATE_STATUS] Motorista ${driverIdFromJwt} atualizando pedido ${orderId} para status (mobile) ${updateData.status} em Tenant ${tenantId}`);
    
    const backendStatusString = this.mapMobileToOrderStatus(updateData.status);
    if (!backendStatusString) {
      throw new BadRequestException(`Status (mobile) inválido fornecido: ${updateData.status}`);
    }

    let typedBackendStatus: OrderStatus.EM_ENTREGA | OrderStatus.ENTREGUE | OrderStatus.NAO_ENTREGUE;

    if (backendStatusString === OrderStatus.EM_ENTREGA ||
        backendStatusString === OrderStatus.ENTREGUE ||
        backendStatusString === OrderStatus.NAO_ENTREGUE) {
      typedBackendStatus = backendStatusString;
    } else {
      this.logger.error(`[UPDATE_STATUS] Erro de mapeamento interno. Status backend '${backendStatusString}' não é um dos tipos esperados pelo serviço.`);
      throw new BadRequestException(`Status backend mapeado '${backendStatusString}' é inválido para esta operação.`);
    }

    if (typedBackendStatus === OrderStatus.NAO_ENTREGUE && !updateData.motivoNaoEntrega) {
      throw new BadRequestException('O motivo da não entrega é obrigatório quando o status é "Não entregue" (retornada).');
    }

    const updatedOrder = await this.deliveryService.updateOrderStatus(
      orderId, 
      typedBackendStatus,
      tenantId, 
      driverIdFromJwt,
      updateData.motivoNaoEntrega,
      updateData.codigoMotivoNaoEntrega
    );

    return {
      data: {
        orderId: updatedOrder.id,
        newStatusBackend: updatedOrder.status,
        newStatusMobile: this.mapOrderStatusToMobile(updatedOrder.status as OrderStatus),
        message: 'Status do pedido atualizado com sucesso.'
      },
      success: true, 
      message: 'Status do pedido atualizado com sucesso.'
    };
  }

  async uploadDeliveryProof(
    orderId: string,
    file: Express.Multer.File,
    tenantId: string,
    driverId: string,
    description?: string
  ) {
    if (!this.isValidUUID(orderId)) {
      throw new BadRequestException(`ID de pedido inválido: ${orderId}`);
    }

    const order = await this.prisma.order.findFirst({
      where: { id: orderId, tenantId },
      include: { Delivery: true }
    });

    if (!order) {
      throw new NotFoundException('Pedido não encontrado.');
    }

    if (order.Delivery && order.Delivery.motoristaId !== driverId) {
      throw new ForbiddenException('Você não tem permissão para anexar comprovantes a este pedido.');
    }

    if (!file) {
      throw new BadRequestException('Arquivo de imagem é obrigatório.');
    }

    try {
      const uploadsDir = path.join(process.cwd(), 'uploads', 'proofs');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const fileExtension = path.extname(file.originalname);
      const fileName = `proof_${orderId}_${Date.now()}${fileExtension}`;
      const filePath = path.join(uploadsDir, fileName);

      const compressedImage = await sharp(file.buffer)
        .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 70 })
        .toBuffer();

      fs.writeFileSync(filePath, compressedImage);

      const proof = await this.prisma.deliveryProof.create({
        data: {
          orderId,
          driverId,
          tenantId,
          proofUrl: `/uploads/proofs/${fileName}`,
        }
      });

      this.logger.log(`Comprovante de entrega criado para pedido ${orderId} pelo motorista ${driverId}`);

      return {
        data: {
          id: proof.id,
          proofUrl: proof.proofUrl,
          message: 'Comprovante enviado com sucesso!'
        },
        success: true,
        message: 'Comprovante enviado com sucesso!'
      };

    } catch (error) {
      this.logger.error(`Erro ao processar comprovante: ${error.message}`);
      throw new BadRequestException('Erro ao processar a imagem do comprovante.');
    }
  }

  async getOrderProofs(orderId: string, tenantId: string) {
    if (!this.isValidUUID(orderId)) {
      throw new BadRequestException(`ID de pedido inválido: ${orderId}`);
    }

    const proofs = await this.prisma.deliveryProof.findMany({
      where: { orderId, tenantId },
      include: { Driver: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    });

    return {
      data: proofs.map(proof => ({
        id: proof.id,
        proofUrl: proof.proofUrl,
        driverName: proof.Driver.name,
        createdAt: proof.createdAt
      })),
      success: true,
      message: `${proofs.length} comprovantes encontrados.`
    };
  }

  private mapRouteStatusToMobile(statusBackend: DeliveryStatus | string): string {
    switch (statusBackend) {
      case DeliveryStatus.A_LIBERAR:
        return 'a_liberar';
      case DeliveryStatus.INICIADO:
        return 'iniciado';
      case DeliveryStatus.FINALIZADO:
        return 'finalizado';
      case DeliveryStatus.REJEITADO:
        return 'rejeitado';
      default:
        this.logger.warn(`[mapRouteStatusToMobile] Status de roteiro desconhecido do backend: ${statusBackend}`);
        return statusBackend;
    }
  }

  private mapOrderStatusToMobile(statusBackend: OrderStatus | string): string {
    switch (statusBackend) {
      case OrderStatus.SEM_ROTA:
        return 'sem_rota';
      case OrderStatus.EM_ROTA_AGUARDANDO_LIBERACAO:
        return 'aguardando_liberacao_rota';
      case OrderStatus.EM_ROTA:
        return 'em_rota';
      case OrderStatus.EM_ENTREGA:
        return 'em_entrega';
      case OrderStatus.ENTREGUE:
        return 'entregue';
      case OrderStatus.NAO_ENTREGUE:
        return 'nao_entregue';
      default:
        this.logger.warn(`[mapOrderStatusToMobile] Status de pedido desconhecido do backend: ${statusBackend}`);
        return statusBackend;
    }
  }

  private mapMobileToOrderStatus(statusMobile: string): OrderStatus.EM_ENTREGA | OrderStatus.ENTREGUE | OrderStatus.NAO_ENTREGUE | null {
    switch (statusMobile?.toLowerCase()) {
      case 'em_entrega':
      case 'iniciada':
        return OrderStatus.EM_ENTREGA;
      case 'entregue':
      case 'finalizada':
        return OrderStatus.ENTREGUE;
      case 'nao_entregue':
      case 'retornada':
        return OrderStatus.NAO_ENTREGUE;
      default:
        this.logger.warn(`[mapMobileToOrderStatus] Status de pedido desconhecido do mobile: ${statusMobile}`);
        return null;
    }
  }
}