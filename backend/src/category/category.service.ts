import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const { tenantId, ...data } = createCategoryDto;
    return this.prisma.category.create({
      data: {
        ...data,
        Tenant: {
          connect: { id: tenantId },
        },
      },
    });
  }

  async findAll(tenantId: number) {
    return this.prisma.category.findMany({
      where: { tenantId },
    });
  }

  async findOne(id: number, tenantId: number) {
    return this.prisma.category.findFirst({
      where: { id, tenantId },
    });
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    return this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });
  }

  async remove(id: number) {
    return this.prisma.category.delete({
      where: { id },
    });
  }
}
