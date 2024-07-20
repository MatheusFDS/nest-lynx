import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Request } from 'express';

@Controller('statistics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get()
  @Roles('admin')
  async getStatistics(@Query('start') start: string, @Query('end') end: string, @Req() req: Request) {
    const tenantId = req.user.tenantId;
    const prisma = req.prisma; // Obtendo o PrismaClient configurado dinamicamente

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error('Invalid date format for startDate or endDate');
    }

    return this.statisticsService.getStatistics(prisma, tenantId, startDate, endDate);
  }
}
