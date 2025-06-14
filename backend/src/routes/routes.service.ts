import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { OptimizeRouteDto } from './dto/optimize-route.dto';
import {
  OptimizeRouteResponse,
  OptimizedOrder,
  GoogleMapsDirectionsResponse,
  DistanceCalculationResponse,
  GeocodeResult,
  RouteCalculationResult
} from './interfaces/route-optimization.interface';
import axios from 'axios';

@Injectable()
export class RoutesService {
  private readonly logger = new Logger(RoutesService.name);
  private readonly googleMapsApiKey: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.googleMapsApiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY');
    if (!this.googleMapsApiKey) {
      this.logger.warn('Google Maps API Key não configurada');
    }
  }

  async optimizeRoute(optimizeRouteDto: OptimizeRouteDto, tenantId: string): Promise<OptimizeRouteResponse> {
    try {
      const { startingPoint, orders } = optimizeRouteDto;

      if (!this.googleMapsApiKey) {
        throw new BadRequestException('Serviço de otimização não configurado');
      }

      this.logger.log(`Otimizando rota com ${orders.length} pedidos para tenant ${tenantId}`);

      const waypoints = orders.map(order => order.address).join('|');

      const directionsUrl = 'https://maps.googleapis.com/maps/api/directions/json';
      const params = {
        origin: startingPoint,
        destination: startingPoint,
        waypoints: `optimize:true|${waypoints}`,
        key: this.googleMapsApiKey,
        language: 'pt-BR',
        region: 'BR',
        units: 'metric'
      };

      const response = await axios.get<GoogleMapsDirectionsResponse>(directionsUrl, { params });

      if (response.data.status !== 'OK') {
        this.logger.error(`Erro na API do Google Maps: ${response.data.status}`);
        throw new BadRequestException(`Erro ao calcular rota: ${response.data.status}`);
      }

      const route = response.data.routes[0];
      if (!route) {
        throw new BadRequestException('Nenhuma rota encontrada');
      }

      const waypointOrder = route.waypoint_order;
      const optimizedOrders: OptimizedOrder[] = [];

      let totalDistance = 0;
      let totalTime = 0;

      waypointOrder.forEach((waypointIndex, optimizedIndex) => {
        const originalOrder = orders[waypointIndex];
        const leg = route.legs[optimizedIndex + 1];

        optimizedOrders.push({
          id: originalOrder.id,
          optimizedOrder: optimizedIndex + 1,
          address: originalOrder.address,
          cliente: originalOrder.cliente,
          numero: originalOrder.numero,
          distanceFromPrevious: leg?.distance?.value || 0,
          estimatedTime: leg?.duration?.value || 0,
        });

        if (leg) {
          totalDistance += leg.distance.value;
          totalTime += leg.duration.value;
        }
      });

      const mapUrl = this.generateStaticMapUrl(startingPoint, orders, waypointOrder);

      await this.saveOptimizedRoute(tenantId, startingPoint, optimizedOrders, totalDistance, totalTime, mapUrl);

      this.logger.log(`Rota otimizada com sucesso. Distância total: ${(totalDistance / 1000).toFixed(2)}km`);

      return {
        success: true,
        optimizedOrders,
        totalDistance: Math.round(totalDistance / 1000 * 100) / 100,
        totalTime: Math.round(totalTime / 60),
        mapUrl,
      };

    } catch (error) {
      this.logger.error('Erro ao otimizar rota:', error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException('Erro interno ao otimizar rota');
    }
  }

  async calculateDistance(origin: string, destination: string): Promise<DistanceCalculationResponse> {
    try {
      if (!this.googleMapsApiKey) {
        throw new BadRequestException('Serviço de cálculo não configurado');
      }

      const distanceUrl = 'https://maps.googleapis.com/maps/api/distancematrix/json';
      const params = {
        origins: origin,
        destinations: destination,
        key: this.googleMapsApiKey,
        language: 'pt-BR',
        units: 'metric'
      };

      const response = await axios.get(distanceUrl, { params });

      if (response.data.status !== 'OK') {
        throw new BadRequestException(`Erro ao calcular distância: ${response.data.status}`);
      }

      const element = response.data.rows[0]?.elements[0];
      if (!element || element.status !== 'OK') {
        throw new BadRequestException('Não foi possível calcular a distância');
      }

      return {
        distance: {
          text: element.distance.text,
          value: element.distance.value
        },
        duration: {
          text: element.duration.text,
          value: element.duration.value
        }
      };

    } catch (error) {
      this.logger.error('Erro ao calcular distância:', error);
      throw new BadRequestException('Erro ao calcular distância');
    }
  }

  async geocodeAddresses(addresses: string[]): Promise<GeocodeResult[]> {
    try {
      if (!this.googleMapsApiKey) {
        throw new BadRequestException('Serviço de geocodificação não configurado');
      }

      const results: GeocodeResult[] = [];

      for (const address of addresses) {
        try {
          const geocodeUrl = 'https://maps.googleapis.com/maps/api/geocode/json';
          const params = {
            address: address,
            key: this.googleMapsApiKey,
            language: 'pt-BR',
            region: 'BR'
          };

          const response = await axios.get(geocodeUrl, { params });

          if (response.data.status === 'OK' && response.data.results.length > 0) {
            const result = response.data.results[0];
            const location = result.geometry.location;

            results.push({
              address,
              lat: location.lat,
              lng: location.lng,
              formatted_address: result.formatted_address,
              success: true
            });
          } else {
            results.push({
              address,
              lat: 0,
              lng: 0,
              formatted_address: '',
              success: false,
              error: `Não foi possível geocodificar: ${response.data.status}`
            });
          }

          await new Promise(resolve => setTimeout(resolve, 100));

        } catch (error) {
          this.logger.error(`Erro ao geocodificar endereço ${address}:`, error);
          results.push({
            address,
            lat: 0,
            lng: 0,
            formatted_address: '',
            success: false,
            error: 'Erro interno ao geocodificar'
          });
        }
      }

      return results;

    } catch (error) {
      this.logger.error('Erro no serviço de geocodificação:', error);
      throw new BadRequestException('Erro ao geocodificar endereços');
    }
  }

  async calculateInteractiveRoute(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    waypoints: Array<{ lat: number; lng: number }>
  ): Promise<RouteCalculationResult> {
    try {
      if (!this.googleMapsApiKey) {
        throw new BadRequestException('Serviço de rota não configurado');
      }

      const directionsUrl = 'https://maps.googleapis.com/maps/api/directions/json';

      let waypointsParam = '';
      if (waypoints.length > 0) {
        waypointsParam = waypoints.map(wp => `${wp.lat},${wp.lng}`).join('|');
      }

      const params: any = {
        origin: `${origin.lat},${origin.lng}`,
        destination: `${destination.lat},${destination.lng}`,
        key: this.googleMapsApiKey,
        language: 'pt-BR',
        units: 'metric',
        mode: 'driving'
      };

      if (waypointsParam) {
        params.waypoints = waypointsParam;
      }

      const response = await axios.get<GoogleMapsDirectionsResponse>(directionsUrl, { params });

      if (response.data.status !== 'OK') {
        throw new BadRequestException(`Erro ao calcular rota: ${response.data.status}`);
      }

      const route = response.data.routes[0];
      if (!route) {
        throw new BadRequestException('Nenhuma rota encontrada');
      }

      let totalDistance = 0;
      let totalDuration = 0;
      const legs = route.legs.map(leg => {
        totalDistance += leg.distance.value;
        totalDuration += leg.duration.value;

        return {
          distance: leg.distance.value,
          duration: leg.duration.value,
          start_address: leg.start_address,
          end_address: leg.end_address
        };
      });

      return {
        distance: totalDistance,
        duration: totalDuration,
        polyline: route.overview_polyline.points,
        legs
      };

    } catch (error) {
      this.logger.error('Erro ao calcular rota interativa:', error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException('Erro interno ao calcular rota');
    }
  }

  async generateStaticMap(
    markers: Array<{ lat: number; lng: number; label?: string; color?: string }>,
    path: Array<{ lat: number; lng: number }>,
    center?: { lat: number; lng: number },
    zoom: number = 12,
    size: string = '600x400',
    polyline?: string
  ): Promise<{ mapUrl: string }> {
    try {
      if (!this.googleMapsApiKey) {
        throw new BadRequestException('Serviço de mapa estático não configurado');
      }

      const baseUrl = 'https://maps.googleapis.com/maps/api/staticmap';
      const params = new URLSearchParams();

      params.append('size', size);
      params.append('maptype', 'roadmap');
      params.append('key', this.googleMapsApiKey);

      if (center) {
        params.append('center', `${center.lat},${center.lng}`);
        params.append('zoom', zoom.toString());
      }

      markers.forEach(marker => {
        const color = marker.color || 'red';
        const label = marker.label || '';
        params.append('markers', `color:${color}|label:${label}|${marker.lat},${marker.lng}`);
      });

      if (polyline) {
        params.append('path', `color:0x0000ff|weight:3|enc:${polyline}`);
      } else if (path.length > 0) {
        const pathString = path.map(point => `${point.lat},${point.lng}`).join('|');
        params.append('path', `color:0x0000ff|weight:3|${pathString}`);
      }

      const mapUrl = `${baseUrl}?${params.toString()}`;

      return { mapUrl };

    } catch (error) {
      this.logger.error('Erro ao gerar mapa estático:', error);
      throw new BadRequestException('Erro ao gerar mapa estático');
    }
  }

  async getRouteMap(routeId: string, tenantId: string) {
    try {
      const savedRoute = await this.prisma.optimizedRoute.findFirst({
        where: { id: routeId, tenantId }
      });

      if (!savedRoute) {
        throw new NotFoundException('Rota não encontrada');
      }

      return {
        mapUrl: savedRoute.mapUrl,
        routeData: JSON.parse(savedRoute.routeData)
      };
    } catch (error) {
      this.logger.error('Erro ao buscar rota:', error);
      throw new NotFoundException('Rota não encontrada');
    }
  }

  private generateStaticMapUrl(startingPoint: string, orders: any[], waypointOrder: number[]): string {
    const baseUrl = 'https://maps.googleapis.com/maps/api/staticmap';

    let markers = `markers=color:green|label:S|${encodeURIComponent(startingPoint)}`;

    waypointOrder.forEach((waypointIndex, index) => {
      const order = orders[waypointIndex];
      markers += `&markers=color:red|label:${index + 1}|${encodeURIComponent(order.address)}`;
    });

    const params = [
      'size=640x400',
      'maptype=roadmap',
      markers,
      `key=${this.googleMapsApiKey}`
    ].join('&');

    return `${baseUrl}?${params}`;
  }

  private async saveOptimizedRoute(
    tenantId: string,
    startingPoint: string,
    optimizedOrders: OptimizedOrder[],
    totalDistance: number,
    totalTime: number,
    mapUrl: string,
  ) {
    try {
      const routeData = {
        startingPoint,
        optimizedOrders,
        totalDistance,
        totalTime,
        createdAt: new Date(),
      };

      await this.prisma.optimizedRoute.create({
        data: {
          tenantId,
          startingPoint,
          routeData: JSON.stringify(routeData),
          mapUrl,
          totalDistance,
          totalTime,
        },
      });

    } catch (error) {
      this.logger.warn('Erro ao salvar rota otimizada (não crítico):', error);
    }
  }
}