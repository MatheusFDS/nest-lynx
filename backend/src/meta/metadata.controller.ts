import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { MetadataService } from './metadata.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('metadata')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MetadataController {
  constructor(private readonly metadataService: MetadataService) {}

  @Get()
  @Roles('admin')
  async getMetadata(@Req() req) {
    return this.metadataService.getMetadata();
  }

  @Post('data')
  @Roles('admin')
  async getData(@Body() body: { table: string; columns: string[]; filters: { [key: string]: string } }, @Req() req) {
    const { table, columns, filters } = body;
    const tenantId = req.user.tenantId;

    let query = `SELECT ${columns.join(', ')} FROM "${table}" WHERE "tenantId" = ${tenantId}`;
    Object.keys(filters).forEach(field => {
      query += ` AND "${field}" LIKE '%${filters[field]}%'`;
    });

    const data = await this.metadataService.prisma.$queryRawUnsafe(query);
    return data;
  }
}
