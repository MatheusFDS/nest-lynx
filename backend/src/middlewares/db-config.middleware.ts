import { Injectable, NestMiddleware, UnauthorizedException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DbConfigMiddleware implements NestMiddleware {
  private readonly logger = new Logger(DbConfigMiddleware.name);

  constructor(private readonly prismaService: PrismaService) {}

  async use(req: any, res: any, next: () => void) {
    const host = req.headers.host.split(':')[0]; // Ignorar a porta, se houver
    this.logger.log(`Received request for host: ${host}`);
    const tenantIdentifier = this.getTenantIdentifierFromHost(host);

    if (!tenantIdentifier) {
      this.logger.error(`Invalid Tenant Identifier for host: ${host}`);
      throw new UnauthorizedException('Invalid Tenant Identifier');
    }

    const databaseUrl = this.getDatabaseUrl(tenantIdentifier);

    if (!databaseUrl) {
      this.logger.error(`No database URL found for tenant: ${tenantIdentifier}`);
      throw new UnauthorizedException('Invalid Tenant Identifier');
    }

    this.logger.log(`Connecting to database for tenant: ${tenantIdentifier}`);
    await this.prismaService.connect(databaseUrl);

    req.prisma = this.prismaService.client;

    next();
  }

  getTenantIdentifierFromHost(host: string): string | undefined {
    const tenantMap = {
      'lynx.localhost': 'lynx',
      'keromax.localhost': 'keromax',
      'lynx.yourdomain.com': 'lynx',
      'keromax.yourdomain.com': 'keromax',
      'localhost': 'lynx', // Add this line to map localhost to lynx tenant for local development
    };

    const tenantIdentifier = tenantMap[host];
    this.logger.log(`Mapped host ${host} to tenant identifier: ${tenantIdentifier}`);
    return tenantIdentifier;
  }

  getDatabaseUrl(tenantIdentifier: string): string | undefined {
    const tenantMap = {
      'lynx': process.env.DATABASE_URL,
      'keromax': process.env.DATABASE_URL_KEROMAX,
    };

    const databaseUrl = tenantMap[tenantIdentifier];
    this.logger.log(`Mapped tenant identifier ${tenantIdentifier} to database URL: ${databaseUrl}`);
    return databaseUrl;
  }
}
  