import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(private prisma: PrismaService) {}

  async create(createPaymentDto: CreatePaymentDto, tenantId: number) {
    const { deliveryId, amount, status, motoristaId } = createPaymentDto;

    return this.prisma.accountsPayable.create({
      data: {
        deliveryId,
        amount,
        status,
        tenantId,
        motoristaId,
      },
      include: {
        Driver: true,
        Delivery: true,
      },
    });
  }

  async findAll(tenantId: number) {
    return this.prisma.accountsPayable.findMany({
      where: { tenantId },
      include: {
        Driver: true,
        Delivery: true,
      },
    });
  }

  async findOne(id: number, tenantId: number) {
    const payment = await this.prisma.accountsPayable.findUnique({
      where: { id, tenantId },
      include: {
        Driver: true,
        Delivery: true,
      },
    });

    if (!payment) {
      throw new NotFoundException('Pagamento não encontrado');
    }

    return payment;
  }

  async update(id: number, updatePaymentDto: UpdatePaymentDto, tenantId: number) {
    const payment = await this.prisma.accountsPayable.findUnique({
      where: { id, tenantId },
    });

    if (!payment) {
      throw new NotFoundException('Pagamento não encontrado');
    }

    return this.prisma.accountsPayable.update({
      where: { id },
      data: updatePaymentDto,
      include: {
        Driver: true,
        Delivery: true,
      },
    });
  }

  async remove(id: number, tenantId: number) {
    const payment = await this.prisma.accountsPayable.findUnique({
      where: { id, tenantId },
    });

    if (!payment) {
      throw new NotFoundException('Pagamento não encontrado');
    }

    return this.prisma.accountsPayable.delete({
      where: { id },
      include: {
        Driver: true,
        Delivery: true,
      },
    });
  }

  async groupPayments(paymentIds: number[], tenantId: number) {
    try {
      // Buscar os pagamentos a serem agrupados
      const payments = await this.prisma.accountsPayable.findMany({
        where: {
          id: { in: paymentIds },
          tenantId,
        },
        include: {
          Driver: true,
          Delivery: true,
        },
      });

      if (payments.length === 0) {
        throw new Error('Nenhum pagamento encontrado para os IDs fornecidos.');
      }

      // Calcular o valor total e outros campos agregados
      const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
      const motoristaId = payments[0].motoristaId; // Supondo que todos os pagamentos têm o mesmo motoristaId
      const deliveryId = payments[0].deliveryId; // Supondo que todos os pagamentos têm o mesmo deliveryId

      // Criar o pagamento agrupado
      const groupedPayment = await this.prisma.accountsPayable.create({
        data: {
          amount: totalAmount,
          status: 'Baixado',
          tenantId,
          motoristaId,
          deliveryId,
        },
        include: {
          Driver: true,
          Delivery: true,
        },
      });

      // Atualizar os pagamentos originais para referenciar o pagamento agrupado
      await this.prisma.accountsPayable.updateMany({
        where: {
          id: { in: paymentIds },
          tenantId,
        },
        data: {
          groupedPaymentId: groupedPayment.id,
        },
      });

      return groupedPayment;
    } catch (error) {
      this.logger.error(`Erro ao agrupar pagamentos: ${error.message}`);
      throw error;
    }
  }

  async ungroupPayments(paymentId: number): Promise<any> {
    const payment = await this.prisma.accountsPayable.findUnique({
      where: { id: paymentId },
    });

    if (!payment || !payment.groupedPaymentId) {
      throw new BadRequestException('Pagamento não encontrado ou não é um pagamento agrupado.');
    }

    await this.prisma.accountsPayable.updateMany({
      where: { groupedPaymentId: paymentId },
      data: { status: 'Pendente', groupedPaymentId: null },
    });

    return this.prisma.accountsPayable.delete({
      where: { id: paymentId },
    });
  }
}
