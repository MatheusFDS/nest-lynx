import { Controller, Get, Post, Body, Patch, Param, UseGuards, Req, Query, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { MobileService } from './mobile.service';

@Controller('mobile/v1')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('driver')
export class MobileController {
  constructor(private readonly mobileService: MobileService) {}

  @Get('profile')
  async getProfile(@Req() req) {
    const userId = req.user.userId || req.user.sub;
    const tenantId = req.user.tenantId;
    return this.mobileService.getProfile(userId, tenantId);
  }

  @Get('routes')
  async getDriverRoutes(@Req() req, @Query('includeHistory') includeHistory?: string) {
    const userId = req.user.userId || req.user.sub;
    const tenantId = req.user.tenantId;
    const driverIdFromJwt = req.user.driverId;
    const includeHistoryBool = includeHistory === 'true';
    return this.mobileService.getDriverRoutes(userId, tenantId, driverIdFromJwt, includeHistoryBool);
  }

  @Get('history')
  async getDriverHistory(@Req() req) {
    const userId = req.user.userId || req.user.sub;
    const tenantId = req.user.tenantId;
    const driverIdFromJwt = req.user.driverId;
    return this.mobileService.getDriverHistory(userId, tenantId, driverIdFromJwt);
  }

  @Get('financials/receivables')
  async getDriverReceivables(@Req() req) {
    const driverId = req.user.driverId;
    const tenantId = req.user.tenantId;
    if (!driverId) {
      throw new BadRequestException('Driver ID não encontrado no token.');
    }
    return this.mobileService.getDriverReceivables(driverId, tenantId);
  }

  @Get('routes/:id')
  async getRouteDetails(@Param('id') routeId: string, @Req() req) {
    const tenantId = req.user.tenantId;
    const driverIdFromJwt = req.user.driverId;
    return this.mobileService.getRouteDetails(routeId, tenantId, driverIdFromJwt);
  }

  @Get('deliveries/:id')
  async getDeliveryDetails(@Param('id') orderId: string, @Req() req) {
    const tenantId = req.user.tenantId;
    return this.mobileService.getDeliveryDetails(orderId, tenantId);
  }

  @Patch('orders/:id/status')
  async updateOrderStatus(
    @Param('id') orderId: string,
    @Body() updateData: { 
        status: string;
        motivoNaoEntrega?: string; 
        codigoMotivoNaoEntrega?: string;
    },
    @Req() req
  ) {
    const tenantId = req.user.tenantId;
    const driverIdFromJwt = req.user.driverId;
    const userId = req.user.userId || req.user.sub;
    return this.mobileService.updateOrderStatus(orderId, updateData, tenantId, driverIdFromJwt, userId);
  }

  @Post('orders/:id/proof')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDeliveryProof(
    @Param('id') orderId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { description?: string },
    @Req() req
  ) {
    const tenantId = req.user.tenantId;
    const driverId = req.user.driverId;
    return this.mobileService.uploadDeliveryProof(orderId, file, tenantId, driverId, body.description);
  }

  @Get('orders/:id/proofs')
  async getOrderProofs(@Param('id') orderId: string, @Req() req) {
    const tenantId = req.user.tenantId;
    return this.mobileService.getOrderProofs(orderId, tenantId);
  }
}