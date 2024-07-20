import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { DirectionsService } from './directions.service';
import { CreateDirectionsDto } from './dto/create-directions.dto';
import { UpdateDirectionsDto } from './dto/update-directions.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Request } from 'express';

@Controller('directions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DirectionsController {
  constructor(private readonly directionsService: DirectionsService) {}

  @Post()
  async create(@Body() createDirectionsDto: CreateDirectionsDto, @Req() req: Request) {
    const tenantId = req.user.tenantId;
    const prisma = req.prisma; // Obtendo o PrismaClient configurado dinamicamente
    return this.directionsService.create(prisma, createDirectionsDto, tenantId);
  }

  @Get()
  async findAll(@Req() req: Request) {
    const tenantId = req.user.tenantId;
    const prisma = req.prisma; // Obtendo o PrismaClient configurado dinamicamente
    return this.directionsService.findAll(prisma, tenantId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: Request) {
    const tenantId = req.user.tenantId;
    const prisma = req.prisma; // Obtendo o PrismaClient configurado dinamicamente
    return this.directionsService.findOne(prisma, +id, tenantId);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateDirectionsDto: UpdateDirectionsDto, @Req() req: Request) {
    const tenantId = req.user.tenantId;
    const prisma = req.prisma; // Obtendo o PrismaClient configurado dinamicamente
    return this.directionsService.update(prisma, +id, updateDirectionsDto, tenantId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Request) {
    const tenantId = req.user.tenantId;
    const prisma = req.prisma; // Obtendo o PrismaClient configurado dinamicamente
    return this.directionsService.remove(prisma, +id, tenantId);
  }
}
