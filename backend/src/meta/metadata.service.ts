import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class MetadataService {
  constructor() {}

  async getTables(prisma: PrismaClient) {
    const tables = await prisma.$queryRaw<{ table_name: string }[]>`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema='public'`;
    return tables;
  }

  async getColumns(prisma: PrismaClient, tableName: string) {
    const columns = await prisma.$queryRaw<{ column_name: string, data_type: string }[]>`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name=${tableName}`;
    return columns;
  }

  async getMetadata(prisma: PrismaClient) {
    const tables = await this.getTables(prisma);
    const metadata = {};

    for (const table of tables) {
      const columns = await this.getColumns(prisma, table.table_name);
      metadata[table.table_name] = columns;
    }

    return metadata;
  }
}
