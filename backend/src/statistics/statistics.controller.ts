import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getStatistics(@Request() req, @Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    const tenantId = req.user.tenantId;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return this.statisticsService.getStatistics(tenantId, start, end);
  }
}
