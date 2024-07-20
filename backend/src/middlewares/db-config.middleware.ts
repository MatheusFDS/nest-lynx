import { Injectable, NestMiddleware, UnauthorizedException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DbConfigMiddleware implements NestMiddleware {
  private readonly logger = new Logger(DbConfigMiddleware.name);

  constructor(private readonly prismaService: PrismaService) {}

  async use(req: any, res: any, next: () => void) {
    // Extrair o host sem a porta
    const host = req.headers.referer?.split('/')[2] || '';
    const domain = host.split(':')[0]; // Remove a porta, se houver

    this.logger.log(`Received request with domain: ${domain}`);

    const tenantIdentifier = this.getTenantIdentifierFromHost(domain);
    this.logger.log(`Tenant Identifier: ${tenantIdentifier}`);

    if (!tenantIdentifier) {
      this.logger.error(`Invalid Tenant Identifier for domain: ${domain}`);
      throw new UnauthorizedException('Invalid Tenant Identifier');
    }

    const databaseUrl = this.getDatabaseUrl(tenantIdentifier);
    this.logger.log(`Database URL for tenant ${tenantIdentifier}: ${databaseUrl}`);

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
    // Normalizar o host e buscar a palavra-chave
    const normalizedHost = host.toLowerCase().trim();
    const tenantMap = {
      'lynx.localhost': 'lynx',
      'keromax.localhost': 'keromax'
    };

    // Check if the host matches any key in tenantMap
    const tenantIdentifier = tenantMap[normalizedHost];
    if (tenantIdentifier) {
      this.logger.log(`Mapped host ${normalizedHost} to tenant identifier: ${tenantIdentifier}`);
    } else {
      this.logger.error(`No matching tenant identifier for host: ${normalizedHost}`);
    }

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
