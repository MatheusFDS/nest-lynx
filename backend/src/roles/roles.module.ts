import { Module } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module'; // Importando o AuthModule
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';

@Module({
  imports: [AuthModule], // Adicionando o AuthModule aqui
  controllers: [RolesController],
  providers: [RolesService, PrismaService],
})
export class RolesModule {}
