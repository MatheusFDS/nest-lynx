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

    const paymentData: any = {
      amount,
      status,
      tenantId,
      motoristaId,
      isGroup: false,
    };

    if (deliveryId) {
      paymentData.paymentDeliveries = {
        create: {
          deliveryId,
          tenantId,
        },
      };
    }

    return this.prisma.accountsPayable.create({
      data: paymentData,
      include: {
        Driver: true,
        paymentDeliveries: {
          include: {
            delivery: true,
          },
        },
      },
    });
  }

  async findAll(tenantId: number) {
    return this.prisma.accountsPayable.findMany({
      where: { tenantId },
      include: {
        Driver: true,
        paymentDeliveries: {
          include: {
            delivery: {
              include: {
                orders: true,
              },
            },
          },
        },
      },
    });
  }

  async findOne(id: number, tenantId: number) {
    const payment = await this.prisma.accountsPayable.findUnique({
      where: { id },
      include: {
        Driver: true,
        paymentDeliveries: {
          include: {
            delivery: {
              include: {
                orders: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Pagamento não encontrado');
    }

    return payment;
  }

  async update(id: number, updatePaymentDto: UpdatePaymentDto, tenantId: number) {
    const payment = await this.prisma.accountsPayable.findUnique({
      where: { id },
    });

    if (!payment || payment.status === 'Baixado' || payment.isGroup || payment.groupedPaymentId) {
      throw new BadRequestException('Não é possível atualizar um pagamento baixado, agrupado ou parte de um agrupamento.');
    }

    return this.prisma.accountsPayable.update({
      where: { id },
      data: updatePaymentDto,
      include: {
        Driver: true,
        paymentDeliveries: {
          include: {
            delivery: {
              include: {
                orders: true,
              },
            },
          },
        },
      },
    });
  }

  async remove(id: number, tenantId: number) {
    const payment = await this.prisma.accountsPayable.findUnique({
      where: { id },
    });

    if (!payment || payment.status === 'Baixado' || payment.isGroup || payment.groupedPaymentId) {
      throw new BadRequestException('Não é possível excluir um pagamento baixado, agrupado ou parte de um agrupamento.');
    }

    return this.prisma.accountsPayable.delete({
      where: { id },
      include: {
        Driver: true,
        paymentDeliveries: {
          include: {
            delivery: {
              include: {
                orders: true,
              },
            },
          },
        },
      },
    });
  }

  async groupPayments(paymentIds: number[], tenantId: number) {
    try {
      const payments = await this.prisma.accountsPayable.findMany({
        where: {
          id: { in: paymentIds },
          tenantId,
          isGroup: false,
          groupedPaymentId: null,
        },
        include: {
          Driver: true,
          paymentDeliveries: {
            include: {
              delivery: {
                include: {
                  orders: true,
                },
              },
            },
          },
        },
      });

      if (payments.length === 0) {
        throw new Error('Nenhum pagamento elegível encontrado para os IDs fornecidos.');
      }

      const motoristaId = payments[0].motoristaId;
      if (!payments.every(payment => payment.motoristaId === motoristaId)) {
        throw new Error('Todos os pagamentos devem ser do mesmo motorista para serem agrupados.');
      }

      const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
      const deliveryIds = payments.flatMap(payment => payment.paymentDeliveries.map(pd => pd.deliveryId));

      const groupedPayment = await this.prisma.accountsPayable.create({
        data: {
          amount: totalAmount,
          status: 'Pendente',
          tenantId,
          motoristaId,
          isGroup: true,
          paymentDeliveries: {
            create: deliveryIds.map(deliveryId => ({ deliveryId, tenantId })),
          },
        },
        include: {
          Driver: true,
          paymentDeliveries: {
            include: {
              delivery: {
                include: {
                  orders: true,
                },
              },
            },
          },
        },
      });

      await this.prisma.accountsPayable.updateMany({
        where: {
          id: { in: paymentIds },
        },
        data: {
          status: 'Baixado',
          groupedPaymentId: groupedPayment.id,
        },
      });

      return groupedPayment;
    } catch (error) {
      this.logger.error(`Erro ao agrupar pagamentos: ${error.message}`);
      throw error;
    }
  }

  async ungroupPayments(paymentId: number, tenantId: number) {
    try {
      const payment = await this.prisma.accountsPayable.findUnique({
        where: { id: paymentId },
        include: {
          Driver: true,
          paymentDeliveries: {
            include: {
              delivery: {
                include: {
                  orders: true,
                },
              },
            },
          },
        },
      });

      if (!payment || !payment.isGroup) {
        throw new BadRequestException('Pagamento não encontrado ou não é um pagamento agrupado.');
      }

      await this.prisma.accountsPayable.updateMany({
        where: { groupedPaymentId: paymentId },
        data: { status: 'Pendente', groupedPaymentId: null },
      });

      return this.prisma.accountsPayable.delete({
        where: { id: paymentId },
      });
    } catch (error) {
      this.logger.error(`Erro ao desagrupar pagamento: ${error.message}`);
      throw error;
    }
  }
}
