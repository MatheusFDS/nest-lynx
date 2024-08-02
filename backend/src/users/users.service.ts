import { Injectable, BadRequestException } from '@nestjs/common';
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
    return this.prisma.user.findFirst({ where: { id, tenantId } });
  }

  async update(id: string, data: UpdateUserDto, tenantId: string) {
    if (data.password) {
      // Hash the new password if it is being updated
      data.password = await bcrypt.hash(data.password, 10);
    }

    const user = await this.prisma.user.findFirst({ where: { id, tenantId } });
    if (!user) {
      throw new BadRequestException('User not found or does not belong to this tenant');
    }

    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, tenantId: string) {
    const user = await this.prisma.user.findFirst({ where: { id, tenantId } });
    if (!user) {
      throw new BadRequestException('User not found or does not belong to this tenant');
    }

    return this.prisma.user.delete({
      where: { id },
    });
  }
}
