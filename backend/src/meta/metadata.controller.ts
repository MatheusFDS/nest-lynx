import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { MetadataService } from './metadata.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Request } from 'express';

@Controller('metadata')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MetadataController {
  constructor(private readonly metadataService: MetadataService) {}

  @Get()
  @Roles('admin')
  async getMetadata(@Req() req: Request) {
    const prisma = req.prisma; // Obtendo o PrismaClient configurado dinamicamente
    return this.metadataService.getMetadata(prisma);
  }

  @Post('data')
  @Roles('admin')
  async getData(@Body() body: { table: string; columns: string[]; filters: { [key: string]: string } }, @Req() req: Request) {
    const { table, columns, filters } = body;
    const tenantId = req.user.tenantId;
    const prisma = req.prisma; // Obtendo o PrismaClient configurado dinamicamente

    let query = `SELECT ${columns.join(', ')} FROM "${table}" WHERE "tenantId" = ${tenantId}`;
    Object.keys(filters).forEach(field => {
      query += ` AND "${field}" LIKE '%${filters[field]}%'`;
    });

    const data = await prisma.$queryRawUnsafe(query);
    return data;
  }
}
