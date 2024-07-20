import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor() {}

  async create(prisma: PrismaClient, createCategoryDto: CreateCategoryDto) {
    const { tenantId, ...data } = createCategoryDto;
    return prisma.category.create({
      data: {
        ...data,
        Tenant: {
          connect: { id: tenantId },
        },
      },
    });
  }

  async findAll(prisma: PrismaClient, tenantId: number) {
    return prisma.category.findMany({
      where: { tenantId },
    });
  }

  async findOne(prisma: PrismaClient, id: number, tenantId: number) {
    return prisma.category.findFirst({
      where: { id, tenantId },
    });
  }

  async update(prisma: PrismaClient, id: number, updateCategoryDto: UpdateCategoryDto) {
    return prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });
  }

  async remove(prisma: PrismaClient, id: number) {
    return prisma.category.delete({
      where: { id },
    });
  }
}
