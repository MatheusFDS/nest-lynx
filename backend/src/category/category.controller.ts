import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Request } from 'express';

@Controller('category')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto, @Req() req: Request) {
    const tenantId = req.user.tenantId;
    const prisma = req.prisma; // Obtendo o PrismaClient configurado dinamicamente
    return this.categoryService.create(prisma, { ...createCategoryDto, tenantId });
  }

  @Get()
  async findAll(@Req() req: Request) {
    const tenantId = req.user.tenantId;
    const prisma = req.prisma; // Obtendo o PrismaClient configurado dinamicamente
    return this.categoryService.findAll(prisma, tenantId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: Request) {
    const tenantId = req.user.tenantId;
    const prisma = req.prisma; // Obtendo o PrismaClient configurado dinamicamente
    return this.categoryService.findOne(prisma, +id, tenantId);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto, @Req() req: Request) {
    const prisma = req.prisma; // Obtendo o PrismaClient configurado dinamicamente
    return this.categoryService.update(prisma, +id, updateCategoryDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Request) {
    const prisma = req.prisma; // Obtendo o PrismaClient configurado dinamicamente
    return this.categoryService.remove(prisma, +id);
  }
}
