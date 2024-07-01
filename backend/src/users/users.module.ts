import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module'; // Importando o AuthModule

@Module({
  imports: [AuthModule], // Adicionando o AuthModule aqui
  controllers: [UsersController],
  providers: [UsersService, PrismaService],
})
export class UsersModule {}
