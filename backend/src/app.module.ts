import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { OrdersModule } from './orders/orders.module';
import { StatisticsModule } from './statistics/statistics.module';
import { PaymentsModule } from './payments/payments.module';
import { CategoryModule } from './category/category.module';
import { DirectionsModule } from './directions/directions.module';
import { PrismaModule } from './prisma/prisma.module';
import { TenantModule } from './tenant/tenant.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { DriversModule } from './drivers/drivers.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { DeliveryModule } from './delivery/delivery.module';
import { UserSettingsModule } from './user-settings/user-settings.module';
import { MetadataModule } from './meta/metadata.module';
import { DbConfigMiddleware } from './middlewares/db-config.middleware';

@Module({
  imports: [
    OrdersModule,
    StatisticsModule,
    PaymentsModule,
    CategoryModule,
    DirectionsModule,
    PrismaModule,
    TenantModule,
    UsersModule,
    AuthModule,
    DriversModule,
    VehiclesModule,
    DeliveryModule,
    UserSettingsModule,
    MetadataModule,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(DbConfigMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
