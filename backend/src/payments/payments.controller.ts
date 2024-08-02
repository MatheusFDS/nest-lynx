import { Controller, Post, Body, UseGuards, Req, Get, Patch, Delete, Param, Logger, BadRequestException } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { CreateGroupPaymentDto } from './dto/create-group-payment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  async create(@Body() createPaymentDto: CreatePaymentDto, @Req() req: Request) {
    const tenantId = req.user.tenantId;
    try {
      return await this.paymentsService.create(createPaymentDto, tenantId);
    } catch (error) {
      this.logger.error(`Erro ao criar pagamento: ${error.message}`);
      throw error;
    }
  }

  @Get()
  async findAll(@Req() req: Request) {
    const tenantId = req.user.tenantId;
    return this.paymentsService.findAll(tenantId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: Request) {
    const tenantId = req.user.tenantId;
    return this.paymentsService.findOne(id, tenantId);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto, @Req() req: Request) {
    const tenantId = req.user.tenantId;
    return this.paymentsService.update(id, updatePaymentDto, tenantId);
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() { status }: { status: string }, @Req() req: Request) {
    const tenantId = req.user.tenantId;
    const updatePaymentDto: UpdatePaymentDto = { status };
    return this.paymentsService.update(id, updatePaymentDto, tenantId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Request) {
    const tenantId = req.user.tenantId;
    return this.paymentsService.remove(id, tenantId);
  }

  @Post('group')
  async groupPayments(@Body() createGroupPaymentDto: CreateGroupPaymentDto, @Req() req: Request) {
    const tenantId = req.user.tenantId;
    try {
      return await this.paymentsService.groupPayments(createGroupPaymentDto.paymentIds, tenantId);
    } catch (error) {
      this.logger.error(`Erro ao agrupar pagamentos: ${error.message}`);
      throw error;
    }
  }

  @Post('ungroup/:id')
  async ungroupPayments(@Param('id') id: string, @Req() req: Request) {
    const tenantId = req.user.tenantId;
    try {
      return await this.paymentsService.ungroupPayments(id, tenantId);
    } catch (error) {
      this.logger.error(`Erro ao desagrupar pagamento: ${error.message}`);
      throw error;
    }
  }
}
