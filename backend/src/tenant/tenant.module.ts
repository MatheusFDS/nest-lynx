// src/tenant/tenant.module.ts
import { Module } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { TenantController } from './tenant.controller';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module'; // <-- ADICIONADO UsersModule aos imports
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [
    AuthModule, 
    UsersModule, // Agora TenantService pode injetar UsersService
    PrismaModule // Mesma observação sobre PrismaModule/PrismaService
  ],
  controllers: [TenantController],
  providers: [TenantService, PrismaService],
  exports: [TenantService] // <-- ADICIONADO TenantService aos exports (para PlatformAdminModule)
})
export class TenantModule {}