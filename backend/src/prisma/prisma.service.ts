import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService implements OnModuleDestroy {
  private prisma: PrismaClient;

  async onModuleDestroy() {
    await this.prisma?.$disconnect();
  }

  async connect(databaseUrl: string) {
    if (this.prisma) {
      await this.prisma.$disconnect();
    }
    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
    });
    await this.prisma.$connect();
  }

  get client() {
    return this.prisma;
  }
}
