import { Module } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { TenantController } from './tenant.controller';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module'; // Importando o AuthModule

@Module({
  imports: [AuthModule], // Adicionando o AuthModule aqui
  controllers: [TenantController],
  providers: [TenantService, PrismaService],
})
export class TenantModule {}
