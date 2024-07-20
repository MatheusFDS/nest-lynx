import { Controller, Get, Put, Body, Req, UseGuards } from '@nestjs/common';
import { UserSettingsService } from './user-settings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

@Controller('user-settings')
@UseGuards(JwtAuthGuard)
export class UserSettingsController {
  constructor(private readonly userSettingsService: UserSettingsService) {}

  @Get()
  async getUserSettings(@Req() req: Request) {
    const prisma = req.prisma; // Obtendo o PrismaClient configurado dinamicamente
    const userId = req.user.userId;
    return this.userSettingsService.getUserSettings(prisma, userId);
  }

  @Put()
  async updateUserSettings(@Req() req: Request, @Body() body: any) {
    const prisma = req.prisma; // Obtendo o PrismaClient configurado dinamicamente
    const userId = req.user.userId;
    const settings = body.settings;

    if (!settings) {
      throw new Error('Settings are missing in the request body');
    }

    return this.userSettingsService.updateUserSettings(prisma, userId, settings);
  }
}
