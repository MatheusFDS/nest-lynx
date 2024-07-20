import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor() {}

  async create(prisma: PrismaClient, data: CreateUserDto, tenantId: number) {
    // Hash the password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create the user with the hashed password and tenantId
    return prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
        tenantId,
      },
    });
  }

  async findAll(prisma: PrismaClient, tenantId: number) {
    return prisma.user.findMany({ where: { tenantId } });
  }

  async findOne(prisma: PrismaClient, id: number, tenantId: number) {
    return prisma.user.findFirst({ where: { id, tenantId } });
  }

  async update(prisma: PrismaClient, id: number, data: UpdateUserDto, tenantId: number) {
    if (data.password) {
      // Hash the new password if it is being updated
      data.password = await bcrypt.hash(data.password, 10);
    }

    const user = await prisma.user.findFirst({ where: { id, tenantId } });
    if (!user) {
      throw new BadRequestException('User not found or does not belong to this tenant');
    }

    return prisma.user.update({
      where: { id },
      data,
    });
  }

  async remove(prisma: PrismaClient, id: number, tenantId: number) {
    const user = await prisma.user.findFirst({ where: { id, tenantId } });
    if (!user) {
      throw new BadRequestException('User not found or does not belong to this tenant');
    }

    return prisma.user.delete({
      where: { id },
    });
  }
}
