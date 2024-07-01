import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateUserDto, tenantId: number) {
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

  async findAll(tenantId: number) {
    return this.prisma.user.findMany({ where: { tenantId } });
  }

  async findOne(id: number, tenantId: number) {
    return this.prisma.user.findFirst({ where: { id, tenantId } });
  }

  async update(id: number, data: UpdateUserDto, tenantId: number) {
    if (data.password) {
      // Hash the new password if it is being updated
      data.password = await bcrypt.hash(data.password, 10);
    }

    return this.prisma.user.update({
      where: { 
        id, 
        tenantId 
      },
      data,
    });
  }

  async remove(id: number, tenantId: number) {
    return this.prisma.user.delete({
      where: { 
        id, 
        tenantId 
      },
    });
  }
}
