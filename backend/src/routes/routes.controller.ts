import { Controller, Post, Get, Body, Param, UseGuards, Req, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RoutesService } from './routes.service';
import { OptimizeRouteDto } from './dto/optimize-route.dto';
import {
  OptimizeRouteResponse,
  DistanceCalculationResponse,
  GeocodeResult,
  RouteCalculationResult
} from './interfaces/route-optimization.interface';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('routes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RoutesController {
  private readonly logger = new Logger(RoutesController.name);

  constructor(
    private readonly routesService: RoutesService,
    private readonly configService: ConfigService
  ) {}

  @Get('config/maps-key')
  @Roles('admin', 'superadmin', 'driver', 'user')
  getMapsKey() {
    return { apiKey: this.configService.get<string>('GOOGLE_MAPS_API_KEY') };
  }

  @Post('optimize')
  @Roles('admin', 'superadmin', 'user')
  async optimizeRoute(@Body() optimizeRouteDto: OptimizeRouteDto, @Req() req): Promise<OptimizeRouteResponse> {
    const tenantId = req.user.tenantId;
    const userId = req.user.userId;

    this.logger.log(`Usuário ${userId} otimizando rota para tenant: ${tenantId}`);

    if (!optimizeRouteDto.startingPoint?.trim()) {
      throw new BadRequestException('Ponto de partida é obrigatório');
    }

    if (!optimizeRouteDto.orders || optimizeRouteDto.orders.length === 0) {
      throw new BadRequestException('Lista de pedidos é obrigatória');
    }

    if (optimizeRouteDto.orders.length > 25) {
      throw new BadRequestException('Máximo de 25 pedidos por otimização');
    }

    return this.routesService.optimizeRoute(optimizeRouteDto, tenantId);
  }

  @Post('calculate-distance')
  @Roles('admin', 'superadmin', 'user')
  async calculateDistance(
    @Body() body: { origin: string; destination: string },
    @Req() req
  ): Promise<DistanceCalculationResponse> {
    const tenantId = req.user.tenantId;

    if (!body.origin?.trim() || !body.destination?.trim()) {
      throw new BadRequestException('Origem e destino são obrigatórios');
    }

    return this.routesService.calculateDistance(body.origin, body.destination);
  }

  @Post('geocode')
  @Roles('admin', 'superadmin', 'user', 'driver')
  async geocodeAddresses(@Body() body: { addresses: string[] }, @Req() req): Promise<GeocodeResult[]> {
    const tenantId = req.user.tenantId;

    if (!body.addresses || body.addresses.length === 0) {
      throw new BadRequestException('Lista de endereços é obrigatória');
    }

    if (body.addresses.length > 50) {
      throw new BadRequestException('Máximo de 50 endereços por vez');
    }

    this.logger.log(`Geocodificando ${body.addresses.length} endereços para tenant: ${tenantId}`);

    return this.routesService.geocodeAddresses(body.addresses);
  }

  @Post('calculate-route')
  @Roles('admin', 'superadmin', 'user')
  async calculateInteractiveRoute(
    @Body() body: {
      origin: { lat: number; lng: number };
      destination: { lat: number; lng: number };
      waypoints?: Array<{ lat: number; lng: number }>;
    },
    @Req() req
  ): Promise<RouteCalculationResult> {
    const tenantId = req.user.tenantId;

    if (!body.origin || !body.destination) {
      throw new BadRequestException('Origem e destino são obrigatórios');
    }

    if (body.waypoints && body.waypoints.length > 23) {
      throw new BadRequestException('Máximo de 23 waypoints permitidos');
    }

    this.logger.log(`Calculando rota interativa para tenant: ${tenantId}`);

    return this.routesService.calculateInteractiveRoute(
      body.origin,
      body.destination,
      body.waypoints || []
    );
  }

  @Post('static-map')
  @Roles('admin', 'superadmin', 'user', 'driver')
  async getStaticMap(
    @Body() body: {
      center?: { lat: number; lng: number };
      markers?: Array<{ lat: number; lng: number; label?: string; color?: string }>;
      path?: Array<{ lat: number; lng: number }>;
      zoom?: number;
      size?: string;
      polyline?: string;
    },
    @Req() req
  ) {
    const tenantId = req.user.tenantId;

    this.logger.log(`Gerando mapa estático para tenant: ${tenantId}`);

    return this.routesService.generateStaticMap(
      body.markers || [],
      body.path || [],
      body.center,
      body.zoom || 12,
      body.size || '600x400',
      body.polyline
    );
  }

  @Get('map/:routeId')
  @Roles('admin', 'superadmin', 'user', 'driver')
  async getRouteMap(@Param('routeId') routeId: string, @Req() req) {
    const tenantId = req.user.tenantId;

    this.logger.log(`Usuário ${req.user.userId} acessando mapa da rota: ${routeId}`);

    return this.routesService.getRouteMap(routeId, tenantId);
  }
}