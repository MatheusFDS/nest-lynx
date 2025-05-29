import { Module } from '@nestjs/common';
import { MobileController } from './mobile.controller';
import { DeliveryService } from '../delivery/delivery.service';
import { DriversService } from '../drivers/drivers.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [MobileController],
  providers: [
    DeliveryService,
    DriversService,
    PrismaService
  ],
})
export class MobileModule {}