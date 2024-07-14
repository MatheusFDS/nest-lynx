import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MetadataService {
  constructor(public readonly prisma: PrismaService) {}

  async getTables() {
    const tables = await this.prisma.$queryRaw<{ table_name: string }[]>`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema='public'`;
    return tables;
  }

  async getColumns(tableName: string) {
    const columns = await this.prisma.$queryRaw<{ column_name: string, data_type: string }[]>`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name=${tableName}`;
    return columns;
  }

  async getMetadata() {
    const tables = await this.getTables();
    const metadata = {};

    for (const table of tables) {
      const columns = await this.getColumns(table.table_name);
      metadata[table.table_name] = columns;
    }

    return metadata;
  }
}
