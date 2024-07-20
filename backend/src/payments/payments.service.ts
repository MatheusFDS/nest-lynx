import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor() {}

  async create(prisma: PrismaClient, createPaymentDto: CreatePaymentDto, tenantId: number) {
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

    return prisma.accountsPayable.create({
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

  async findAll(prisma: PrismaClient, tenantId: number) {
    return prisma.accountsPayable.findMany({
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

  async findOne(prisma: PrismaClient, id: number, tenantId: number) {
    const payment = await prisma.accountsPayable.findUnique({
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

  async update(prisma: PrismaClient, id: number, updatePaymentDto: UpdatePaymentDto, tenantId: number) {
    const payment = await prisma.accountsPayable.findUnique({
      where: { id },
    });

    if (!payment) {
      throw new NotFoundException('Pagamento não encontrado');
    }

    // Regra 1: Não permitir cancelar baixas de lançamentos que tenham groupedPaymentId preenchido
    if (payment.groupedPaymentId) {
      throw new BadRequestException('Não é possível cancelar a baixa de um pagamento parte de um agrupamento.');
    }

    // Regra 2: Permitir atualizar status para 'Pendente' se o pagamento estiver baixado
    if (payment.status === 'Baixado' && updatePaymentDto.status !== 'Pendente') {
      throw new BadRequestException('Não é possível atualizar um pagamento baixado para outro status além de "Pendente".');
    }

    return prisma.accountsPayable.update({
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

  async remove(prisma: PrismaClient, id: number, tenantId: number) {
    const payment = await prisma.accountsPayable.findUnique({
      where: { id },
    });

    if (!payment || payment.status === 'Baixado' || payment.isGroup || payment.groupedPaymentId) {
      throw new BadRequestException('Não é possível excluir um pagamento baixado, agrupado ou parte de um agrupamento.');
    }

    return prisma.accountsPayable.delete({
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

  async groupPayments(prisma: PrismaClient, paymentIds: number[], tenantId: number) {
    try {
      const payments = await prisma.accountsPayable.findMany({
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

      // Regra 3: Não permitir agrupar lançamentos que já foram baixados
      if (payments.some(payment => payment.status === 'Baixado')) {
        throw new Error('Não é possível agrupar pagamentos que já foram baixados.');
      }

      const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
      const deliveryIds = payments.flatMap(payment => payment.paymentDeliveries.map(pd => pd.delivery.id));

      const groupedPayment = await prisma.accountsPayable.create({
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

      await prisma.accountsPayable.updateMany({
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

  async ungroupPayments(prisma: PrismaClient, paymentId: number, tenantId: number) {
    try {
      const payment = await prisma.accountsPayable.findUnique({
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

      // Regra: Não permitir desagrupar se o pagamento estiver baixado
      if (payment.status === 'Baixado') {
        throw new BadRequestException('Não é possível desagrupar um pagamento baixado. Cancele a baixa primeiro.');
      }

      await prisma.accountsPayable.updateMany({
        where: { groupedPaymentId: paymentId },
        data: { status: 'Pendente', groupedPaymentId: null },
      });

      return prisma.accountsPayable.delete({
        where: { id: paymentId },
      });
    } catch (error) {
      this.logger.error(`Erro ao desagrupar pagamento: ${error.message}`);
      throw error;
    }
  }
}
