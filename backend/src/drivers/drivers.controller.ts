import { Controller, Post, Body, UseGuards, Req, Get, Patch, Delete, Param, UploadedFile, UseInterceptors } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { DriversService } from './drivers.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express'; // Adicione esta linha para corrigir o tipo de arquivo

@Controller('drivers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Roles('admin')
  @Post()
  create(@Body() createDriverDto: CreateDriverDto, @Req() req: Request) {
    const tenantId = req.user.tenantId;
    return this.driversService.create(createDriverDto, tenantId);
  }

  @Roles('admin')
  @Get()
  findAll(@Req() req: Request) {
    const tenantId = req.user.tenantId;
    return this.driversService.findAll(tenantId);
  }

  @Roles('admin')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDriverDto: UpdateDriverDto, @Req() req: Request) {
    const tenantId = req.user.tenantId;
    return this.driversService.update(Number(id), updateDriverDto, tenantId);
  }

  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    const tenantId = req.user.tenantId;
    return this.driversService.remove(Number(id), tenantId);
  }

  @Roles('admin', 'driver')
  @Get('orders')
  getOrders(@Req() req: Request) {
    const driverId = req.user.id;
    return this.driversService.findOrdersByDriver(driverId);
  }

  @Roles('admin', 'driver')
  @Patch('orders/:id/start')
  startOrder(@Param('id') orderId: number, @Req() req: Request) {
    const driverId = req.user.id;
    return this.driversService.updateOrderStatus(orderId, 'in_progress', driverId);
  }

  @Roles('admin', 'driver')
  @Patch('orders/:id/complete')
  completeOrder(@Param('id') orderId: number, @Req() req: Request) {
    const driverId = req.user.id;
    return this.driversService.updateOrderStatus(orderId, 'completed', driverId);
  }

  @Roles('admin', 'driver')
  @Post('orders/:id/proof')
  @UseInterceptors(FileInterceptor('file'))
  uploadProof(@Param('id') orderId: number, @UploadedFile() file: Express.Multer.File, @Req() req: Request) {
    const driverId = req.user.id;
    return this.driversService.saveProof(orderId, file, driverId);
  }

  @Roles('admin', 'user')
  @Get('payments')
  getPayments(@Req() req: Request) {
    const driverId = req.user.id;
    return this.driversService.findPaymentsByDriver(driverId);
  }
}
