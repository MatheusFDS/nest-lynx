import { Controller, Post, Body, UseGuards, Req, Get, Patch, Delete, Param, UploadedFile, UseInterceptors } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { DriversService } from './drivers.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express'; 

@Controller('drivers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Post()
  create(@Body() createDriverDto: CreateDriverDto, @Req() req: Request) {
    const tenantId = req.user.tenantId;
    return this.driversService.create(createDriverDto, tenantId);
  }

  @Get()
  findAll(@Req() req: Request) {
    const tenantId = req.user.tenantId;
    return this.driversService.findAll(tenantId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDriverDto: UpdateDriverDto, @Req() req: Request) {
    const tenantId = req.user.tenantId;
    return this.driversService.update(id, updateDriverDto, tenantId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    const tenantId = req.user.tenantId;
    return this.driversService.remove(id, tenantId);
  }

  @Get('orders')
  getOrders(@Req() req: Request) {
    const driverId = req.user.id;
    return this.driversService.findOrdersByDriver(driverId);
  }

  @Patch('orders/:id/start')
  startOrder(@Param('id') orderId: string, @Req() req: Request) {
    const driverId = req.user.id;
    return this.driversService.updateOrderStatus(orderId, 'in_progress', driverId);
  }

  @Patch('orders/:id/complete')
  completeOrder(@Param('id') orderId: string, @Req() req: Request) {
    const driverId = req.user.id;
    return this.driversService.updateOrderStatus(orderId, 'completed', driverId);
  }

  @Post('orders/:id/proof')
  @UseInterceptors(FileInterceptor('file'))
  uploadProof(@Param('id') orderId: string, @UploadedFile() file: Express.Multer.File, @Req() req: Request) {
    const driverId = req.user.id;
    return this.driversService.saveProof(orderId, file, driverId);
  }

  @Get('payments')
  getPayments(@Req() req: Request) {
    const driverId = req.user.id;
    return this.driversService.findPaymentsByDriver(driverId);
  }
}
