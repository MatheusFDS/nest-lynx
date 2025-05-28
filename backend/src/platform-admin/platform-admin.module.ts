// src/platform-admin/platform-admin.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from '../users/users.module';
import { TenantModule } from '../tenant/tenant.module';
import { RolesModule } from '../roles/roles.module';
import { AuthModule } from '../auth/auth.module'; // <-- ADICIONE ESTA LINHA

import { PlatformTenantsController } from './tenants/platform-tenants.controller';
import { PlatformUsersController } from './users/platform-users.controller';
import { PlatformRolesController } from './roles/platform-roles.controller';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    TenantModule,
    RolesModule,
    AuthModule, // <-- E ADICIONE AQUI
  ],
  controllers: [
    PlatformTenantsController,
    PlatformUsersController,
    PlatformRolesController,
  ],
})
export class PlatformAdminModule {}