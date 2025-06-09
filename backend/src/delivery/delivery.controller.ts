// Conteúdo para: src/delivery/delivery.controller.ts

import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Logger, BadRequestException, HttpCode, HttpStatus, ForbiddenException } from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { UpdateDeliveryDto } from './dto/update-delivery.dto';
import { RejeitarRoteiroDto } from './dto/reject-delivery.dto'; // Reintroduzido
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { OrderStatus, DeliveryStatus } from '../types/status.enum';

@Controller('delivery')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DeliveryController {
  private readonly logger = new Logger(DeliveryController.name);

  constructor(private readonly deliveryService: DeliveryService) {}

  @Post()
  @Roles('admin', 'superadmin') // Apenas usuários com essas roles podem criar
  async create(@Body() createDeliveryDto: CreateDeliveryDto, @Req() req) {
    const tenantId = req.user.tenantId;
    const userId = req.user.userId;
    this.logger.log(`Usuário ${userId} criando roteiro para tenant: ${tenantId}`);
    return this.deliveryService.create(createDeliveryDto, tenantId, userId);
  }

  @Get()
  @Roles('admin', 'superadmin', 'driver', 'user')
  async findAll(@Req() req) {
    const tenantId = req.user.tenantId;
    // Se for motorista, o serviço poderia filtrar para apenas seus roteiros.
    // Por enquanto, o serviço busca todos do tenant.
    return this.deliveryService.findAll(tenantId);
  }

  @Get(':id')
  @Roles('admin', 'superadmin', 'driver', 'user')
  async findOne(@Param('id') id: string, @Req() req) {
    const tenantId = req.user.tenantId;
    const delivery = await this.deliveryService.findOne(id, tenantId);
    // Se for motorista, verificar se o roteiro pertence a ele.
    if (req.user.role === 'driver' && delivery.motoristaId !== req.user.driverId) {
        throw new ForbiddenException("Você não tem permissão para acessar este roteiro.");
    }
    return delivery;
  }

  @Patch(':id')
  @Roles('admin', 'superadmin')
  async update(
    @Param('id') id: string,
    @Body() updateDeliveryDto: UpdateDeliveryDto,
    @Req() req
  ) {
    const tenantId = req.user.tenantId;
    const userId = req.user.userId;
    this.logger.log(`Usuário ${userId} atualizando roteiro ID: ${id} para tenant: ${tenantId}`);
    return this.deliveryService.update(id, updateDeliveryDto, tenantId, userId);
  }

  @Delete(':id')
  @Roles('admin', 'superadmin')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string, @Req() req) {
    const tenantId = req.user.tenantId;
    const userId = req.user.userId;
    this.logger.log(`Usuário ${userId} removendo roteiro ID: ${id} para tenant: ${tenantId}`);
    return this.deliveryService.remove(id, tenantId, userId);
  }

  @Patch(':id/remove-order/:orderId')
  @Roles('admin', 'superadmin')
  async removeOrderFromDelivery(
    @Param('id') deliveryId: string,
    @Param('orderId') orderId: string,
    @Req() req
  ) {
    const tenantId = req.user.tenantId;
    const userId = req.user.userId;
    this.logger.log(`Usuário ${userId} removendo pedido ${orderId} do roteiro ${deliveryId} (Tenant: ${tenantId})`);
    return this.deliveryService.removeOrderFromDelivery(deliveryId, orderId, tenantId, userId);
  }

  // Endpoint para motorista atualizar status de um pedido
  @Patch('order/:orderId/status')
  @Roles('driver')
  async updateOrderStatus(
    @Param('orderId') orderId: string,
    @Body() body: {
        status: OrderStatus.EM_ENTREGA | OrderStatus.ENTREGUE | OrderStatus.NAO_ENTREGUE;
        motivoNaoEntrega?: string;
        codigoMotivoNaoEntrega?: string;
    },
    @Req() req
  ) {
    const tenantId = req.user.tenantId;
    const driverId = req.user.driverId;

    if (!driverId) throw new BadRequestException('ID do motorista não encontrado no token.');
    if (!body.status) throw new BadRequestException('Novo status do pedido é obrigatório.');
    if (body.status === OrderStatus.NAO_ENTREGUE && !body.motivoNaoEntrega) {
        throw new BadRequestException('Motivo da não entrega é obrigatório para o status "Não entregue".');
    }

    this.logger.log(`Motorista ${driverId} atualizando status do pedido ${orderId} para ${body.status} (Tenant: ${tenantId})`);
    return this.deliveryService.updateOrderStatus(
        orderId, body.status, tenantId, driverId, body.motivoNaoEntrega, body.codigoMotivoNaoEntrega
    );
  }

  // Endpoints para Liberação de Roteiro
  @Patch(':id/liberar')
  @Roles('admin', 'superadmin') // Apenas admin/gerente podem liberar
  async liberarRoteiro(@Param('id') deliveryId: string, @Req() req) {
    const tenantId = req.user.tenantId;
    const userId = req.user.userId;
    this.logger.log(`Usuário ${userId} liberando roteiro ${deliveryId} (Tenant: ${tenantId})`);
    return this.deliveryService.liberarRoteiro(deliveryId, tenantId, userId);
  }

  @Patch(':id/rejeitar')
  @Roles('admin', 'superadmin') // Apenas admin/gerente podem rejeitar
  async rejeitarRoteiro(
    @Param('id') deliveryId: string,
    @Body() rejeitarRoteiroDto: RejeitarRoteiroDto,
    @Req() req
  ) {
    const tenantId = req.user.tenantId;
    const userId = req.user.userId;
    this.logger.log(`Usuário ${userId} rejeitando roteiro ${deliveryId} (Tenant: ${tenantId}). Motivo: ${rejeitarRoteiroDto.motivo}`);
    return this.deliveryService.rejeitarRoteiro(deliveryId, tenantId, userId, rejeitarRoteiroDto.motivo);
  }
}
