import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { DriversModule } from './drivers/drivers.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { OrdersModule } from './orders/orders.module';
import { DirectionsModule } from './directions/directions.module';
import { DeliveryModule } from './delivery/delivery.module';
import { CategoryModule } from './category/category.module';
import { PaymentsModule } from './payments/payments.module';
import { StatisticsModule } from './statistics/statistics.module';

@Module({
  imports: [
    OrdersModule,
    StatisticsModule,
    PaymentsModule,
    CategoryModule,
    DirectionsModule,
    PrismaModule,
    UsersModule,
    AuthModule,
    DriversModule,
    VehiclesModule,
    DeliveryModule,
  ],
})
export class AppModule {}
