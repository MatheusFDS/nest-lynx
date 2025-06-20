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
import { UserSettingsModule } from './user-settings/user-settings.module';
import { TenantModule } from './tenant/tenant.module';
import { MetadataModule } from './meta/metadata.module';
import { RolesModule } from './roles/roles.module';
import { PlatformAdminModule } from './platform-admin/platform-admin.module';
import { MobileModule } from './mobile/mobile.module';
import { RouterModule } from '@nestjs/core';
import { RoutesModule } from './routes/routes.module';

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
    RolesModule,
    PlatformAdminModule,
    MobileModule,
    RoutesModule,
  ],
})
export class AppModule {}
