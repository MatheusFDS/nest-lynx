import { Controller, Get, Post, Body, Patch, Param, UseGuards, Req, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DeliveryService } from '../delivery/delivery.service';
import { DriversService } from '../drivers/drivers.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('mobile/v1')
@UseGuards(JwtAuthGuard)
export class MobileController {
  private readonly logger = new Logger(MobileController.name);

  constructor(
    private readonly deliveryService: DeliveryService,
    private readonly driversService: DriversService,
    private readonly prisma: PrismaService,
  ) {}

  // 🔧 Função helper para validar UUID
  private isValidUUID(id: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }

  @Get('profile')
  async getProfile(@Req() req) {
    try {
      const userId = req.user.userId || req.user.sub;
      const tenantId = req.user.tenantId;
      
      this.logger.debug(`📱 [PROFILE] Buscando perfil - User: ${userId}, Tenant: ${tenantId}`);
      
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { 
          tenant: true,
          role: true 
        }
      });

      if (!user) {
        throw new NotFoundException('Usuário não encontrado');
      }

      let driver = await this.prisma.driver.findFirst({
        where: { 
          userId: userId,
          tenantId: tenantId 
        }
      });

      if (!driver) {
        driver = await this.prisma.driver.findFirst({
          where: { 
            tenantId: tenantId,
            name: { contains: user.name, mode: 'insensitive' }
          }
        });
      }

      const vehicle = driver ? await this.prisma.vehicle.findFirst({
        where: { driverId: driver.id },
        include: { Category: true }
      }) : null;
      
      const profileData = {
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
      };

      return {
        data: profileData,
        success: true,
        message: 'Perfil carregado com sucesso'
      };
    } catch (error) {
      this.logger.error(`❌ [PROFILE] Erro:`, error);
      return {
        data: null,
        success: false,
        message: error.message || 'Erro ao carregar perfil'
      };
    }
  }

  @Get('routes')
  async getDriverRoutes(@Req() req) {
    try {
      const userId = req.user.userId || req.user.sub;
      const tenantId = req.user.tenantId;
      
      this.logger.debug(`📱 [ROUTES] Buscando roteiros - User: ${userId}, Tenant: ${tenantId}`);
      
      let driver = await this.prisma.driver.findFirst({
        where: { 
          userId: userId,
          tenantId: tenantId 
        }
      });

      if (!driver) {
        const user = await this.prisma.user.findUnique({
          where: { id: userId }
        });

        if (user) {
          driver = await this.prisma.driver.findFirst({
            where: { 
              tenantId: tenantId,
              name: { contains: user.name, mode: 'insensitive' }
            }
          });
        }
      }

      if (!driver) {
        this.logger.warn(`⚠️ [ROUTES] Nenhum driver encontrado para User: ${userId}`);
        return {
          data: [],
          success: true,
          message: 'Nenhum motorista associado a este usuário'
        };
      }
      
      const deliveries = await this.prisma.delivery.findMany({
        where: { 
          motoristaId: driver.id,
          tenantId,
        },
        include: {
          orders: {
            orderBy: { sorting: 'asc' }
          },
          Driver: true,
          Vehicle: true,
        },
        orderBy: { dataInicio: 'desc' }
      });
      
      this.logger.debug(`📱 [ROUTES] ${deliveries.length} deliveries encontradas`);
      
      const routes = deliveries.map(delivery => ({
        id: delivery.id,
        date: delivery.dataInicio.toISOString().split('T')[0],
        status: this.mapRouteStatusToMobile(delivery.status), // ✅ NOVO MAPEAMENTO
        totalValue: delivery.totalValor,
        deliveries: delivery.orders.map(order => ({
          id: order.id,
          customerName: order.cliente,
          address: `${order.endereco}, ${order.bairro}, ${order.cidade} - ${order.uf}`,
          phone: order.telefone,
          value: order.valor,
          status: this.mapOrderStatusToMobile(order.status), // ✅ NOVO MAPEAMENTO
          items: [`Pedido ${order.numero}`],
          paymentMethod: 'A combinar',
          notes: order.instrucoesEntrega,
        }))
      }));

      this.logger.debug(`📱 [ROUTES] ${routes.length} roteiros mapeados`);

      return {
        data: routes,
        success: true,
        message: `${routes.length} roteiros encontrados`
      };
    } catch (error) {
      this.logger.error(`❌ [ROUTES] Erro:`, error);
      return {
        data: [],
        success: false,
        message: error.message || 'Erro ao carregar roteiros'
      };
    }
  }

  @Get('routes/:id')
  async getRouteDetails(@Param('id') id: string, @Req() req) {
    try {
      const tenantId = req.user.tenantId;
      
      if (!this.isValidUUID(id)) {
        throw new BadRequestException(`ID de roteiro inválido: ${id}`);
      }
      
      this.logger.debug(`📱 [ROUTE_DETAILS] Buscando roteiro ${id} para tenant ${tenantId}`);
      
      const delivery = await this.prisma.delivery.findFirst({
        where: { 
          id: id, 
          tenantId: tenantId 
        },
        include: {
          orders: {
            orderBy: { sorting: 'asc' }
          },
          Driver: true,
          Vehicle: true,
        }
      });

      if (!delivery) {
        throw new NotFoundException('Roteiro não encontrado');
      }
      
      const route = {
        id: delivery.id,
        date: delivery.dataInicio.toISOString().split('T')[0],
        status: this.mapRouteStatusToMobile(delivery.status), // ✅ NOVO
        totalValue: delivery.totalValor,
        deliveries: delivery.orders.map(order => ({
          id: order.id,
          customerName: order.cliente,
          address: `${order.endereco}, ${order.bairro}, ${order.cidade} - ${order.uf}`,
          phone: order.telefone,
          value: order.valor,
          status: this.mapOrderStatusToMobile(order.status), // ✅ NOVO
          items: [`Pedido ${order.numero}`],
          paymentMethod: 'A combinar',
          notes: order.instrucoesEntrega,
        }))
      };

      return {
        data: route,
        success: true,
        message: 'Roteiro carregado com sucesso'
      };
    } catch (error) {
      this.logger.error(`❌ [ROUTE_DETAILS] Erro:`, error);
      return {
        data: null,
        success: false,
        message: error.message || 'Erro ao carregar detalhes do roteiro'
      };
    }
  }

  @Get('deliveries/:id')
  async getDeliveryDetails(@Param('id') deliveryId: string, @Req() req) {
    try {
      const tenantId = req.user.tenantId;
      
      if (!this.isValidUUID(deliveryId)) {
        throw new BadRequestException(`ID de entrega inválido: ${deliveryId}`);
      }
      
      const order = await this.prisma.order.findFirst({
        where: { 
          id: deliveryId,
          tenantId 
        }
      });

      if (!order) {
        throw new NotFoundException('Entrega não encontrada');
      }

      const delivery = {
        id: order.id,
        customerName: order.cliente,
        address: `${order.endereco}, ${order.bairro}, ${order.cidade} - ${order.uf}`,
        phone: order.telefone,
        value: order.valor,
        status: this.mapOrderStatusToMobile(order.status), // ✅ NOVO
        items: [`Pedido ${order.numero}`],
        paymentMethod: 'A combinar',
        notes: order.instrucoesEntrega,
        driverNotes: '',
      };

      return {
        data: delivery,
        success: true,
        message: 'Detalhes da entrega carregados'
      };
    } catch (error) {
      this.logger.error(`❌ [DELIVERY_DETAILS] Erro:`, error);
      return {
        data: null,
        success: false,
        message: error.message || 'Erro ao carregar detalhes da entrega'
      };
    }
  }

  // ✅ NOVA LÓGICA: Atualizar status de order individual
  @Patch('orders/:id/status')
  async updateOrderStatus(
    @Param('id') orderId: string,
    @Body() updateData: { status: string; driverNotes?: string },
    @Req() req
  ) {
    try {
      const tenantId = req.user.tenantId;
      const userId = req.user.userId || req.user.sub;
      
      if (!this.isValidUUID(orderId)) {
        throw new BadRequestException(`ID de pedido inválido: ${orderId}`);
      }
      
      this.logger.debug(`📱 [UPDATE_STATUS] Atualizando pedido ${orderId} para status ${updateData.status}`);
      
      // Mapear status do mobile para backend
      const backendStatus = this.mapMobileToOrderStatus(updateData.status);
      if (!backendStatus) {
        throw new BadRequestException(`Status inválido: ${updateData.status}`);
      }

      // Buscar driver do usuário
      const driver = await this.prisma.driver.findFirst({
        where: { 
          userId: userId,
          tenantId: tenantId 
        }
      });

      if (!driver) {
        throw new BadRequestException('Motorista não encontrado');
      }

      // Usar o novo método do delivery service
      const updatedOrder = await this.deliveryService.updateOrderStatus(
        orderId, 
        backendStatus, 
        tenantId, 
        driver.id
      );

      return { 
        data: {
          orderId,
          newStatus: this.mapOrderStatusToMobile(updatedOrder.status),
          message: 'Status atualizado com sucesso'
        },
        success: true, 
        message: 'Status atualizado com sucesso'
      };
    } catch (error) {
      this.logger.error(`❌ [UPDATE_STATUS] Erro:`, error);
      return {
        data: null,
        success: false,
        message: error.message || 'Erro ao atualizar status'
      };
    }
  }

  @Get('test')
  async testEndpoint(@Req() req) {
    const user = req.user;
    const timestamp = new Date().toISOString();
    
    return {
      data: {
        message: '🚀 Mobile API funcionando!',
        timestamp,
        user: {
          userId: user.userId || user.sub,
          tenantId: user.tenantId,
          email: user.email,
          role: user.role,
        }
      },
      success: true,
      message: 'Teste realizado com sucesso'
    };
  }

  @Get('debug/driver')
  async debugDriverAssociation(@Req() req) {
    try {
      const userId = req.user.userId || req.user.sub;
      const tenantId = req.user.tenantId;
      
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { tenant: true }
      });

      const driverByUserId = await this.prisma.driver.findFirst({
        where: { userId: userId, tenantId: tenantId }
      });

      const driverByName = user ? await this.prisma.driver.findFirst({
        where: { 
          tenantId: tenantId,
          name: { contains: user.name, mode: 'insensitive' }
        }
      }) : null;

      const allDriversInTenant = await this.prisma.driver.findMany({
        where: { tenantId: tenantId },
        select: { id: true, name: true, userId: true, cpf: true }
      });

      const deliveryCount = await this.prisma.delivery.count({
        where: { 
          tenantId: tenantId,
          motoristaId: driverByUserId?.id || driverByName?.id 
        }
      });

      return {
        data: {
          jwtPayload: req.user,
          user: user,
          driverByUserId: driverByUserId,
          driverByName: driverByName,
          allDriversInTenant: allDriversInTenant,
          deliveryCount: deliveryCount,
          recommendation: driverByUserId ? 
            'Associação por userId funcionando ✅' : 
            driverByName ? 
              'Usando fallback por nome ⚠️' :
              'Nenhuma associação encontrada ❌'
        },
        success: true,
        message: 'Debug concluído'
      };
    } catch (error) {
      return {
        data: { error: error.message },
        success: false,
        message: 'Erro no debug'
      };
    }
  }

  // ✅ NOVOS MAPEAMENTOS DE STATUS

  // Mapear status do roteiro: Backend → Mobile
  private mapRouteStatusToMobile(status: string): string {
    const statusMap = {
      'A liberar': 'a_liberar',
      'Pendente': 'pendente',
      'Finalizado': 'finalizado'
    };
    return statusMap[status] || 'pendente';
  }

  // Mapear status da order: Backend → Mobile
  private mapOrderStatusToMobile(status: string): string {
    const statusMap = {
      'Pendente': 'pendente',
      'Em rota': 'em_rota',
      'Entrega Iniciada': 'iniciada',
      'Entrega Finalizada': 'finalizada',
      'Entrega Retornada': 'retornada'
    };
    return statusMap[status] || 'pendente';
  }

  // Mapear status: Mobile → Backend (Orders)
  private mapMobileToOrderStatus(status: string): string | null {
    const statusMap = {
      'iniciada': 'Entrega Iniciada',
      'finalizada': 'Entrega Finalizada',
      'retornada': 'Entrega Retornada'
    };
    return statusMap[status] || null;
  }
}