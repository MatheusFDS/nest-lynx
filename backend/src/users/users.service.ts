// src/users/users.service.ts

import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateUserDto, tenantId: string) {
    // Hash the password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create the user with the hashed password and tenantId
    return this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
        tenantId,
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.user.findMany({ where: { tenantId } });
  }

  async findOne(id: string, tenantId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user || user.tenantId !== tenantId) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado no tenant ${tenantId}`);
    }

    return user;
  }

  async update(id: string, data: UpdateUserDto, tenantId: string) {
    if (data.password) {
      // Hash the new password if it is being updated
      data.password = await bcrypt.hash(data.password, 10);
    }

    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user || user.tenantId !== tenantId) {
      throw new BadRequestException('Usuário não encontrado ou não pertence a este tenant');
    }

    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, tenantId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user || user.tenantId !== tenantId) {
      throw new BadRequestException('Usuário não encontrado ou não pertence a este tenant');
    }

    return this.prisma.$transaction(async (prisma) => {
      // Delete associated user settings
      await prisma.userSettings.deleteMany({
        where: { userId: id },
      });

      // Delete the user
      return prisma.user.delete({
        where: { id },
      });
    });
  }
}
