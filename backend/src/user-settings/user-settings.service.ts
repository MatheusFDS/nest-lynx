import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserSettingsService {
  constructor(private prisma: PrismaService) {}

  async getUserSettings(userId: string) {
    return this.prisma.userSettings.findUnique({
      where: {
        userId: userId,
      },
    });
  }

  async updateUserSettings(userId: string, settings: any) {
    return this.prisma.userSettings.upsert({
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
