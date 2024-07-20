import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class UserSettingsService {
  private readonly logger = new Logger(UserSettingsService.name);

  constructor() {}

  async getUserSettings(prisma: PrismaClient, userId: number) {
    return prisma.userSettings.findUnique({
      where: {
        userId: userId,
      },
    });
  }

  async updateUserSettings(prisma: PrismaClient, userId: number, settings: any) {
    if (!settings) {
      this.logger.error('Settings argument is missing');
      throw new Error('Settings argument is missing');
    }

    this.logger.log(`Updating settings for user ${userId}: ${JSON.stringify(settings)}`);

    return prisma.userSettings.upsert({
      where: {
        userId: userId,
      },
      update: {
        settings: settings,
      },
      create: {
        userId: userId,
        settings: settings,
      },
    });
  }
}
