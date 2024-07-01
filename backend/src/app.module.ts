import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { DriversModule } from './drivers/drivers.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [
    OrdersModule,
    PrismaModule,
    UsersModule,
    AuthModule,
    DriversModule,
    VehiclesModule,
  ],
})
export class AppModule {}
