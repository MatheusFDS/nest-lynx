import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  create(createPaymentDto: CreatePaymentDto) {
    const { deliveryId, amount, status, motoristaId, tenantId } = createPaymentDto;

    return this.prisma.accountsPayable.create({
      data: {
        deliveryId,
        amount,
        status,
        tenantId,
        motoristaId,
      },
    });
  }

  findAll() {
    return this.prisma.accountsPayable.findMany();
  }

  findOne(id: number) {
    return this.prisma.accountsPayable.findUnique({
      where: { id },
    });
  }

  update(id: number, updatePaymentDto: UpdatePaymentDto) {
    return this.prisma.accountsPayable.update({
      where: { id },
      data: updatePaymentDto,
    });
  }

  remove(id: number) {
    return this.prisma.accountsPayable.delete({
      where: { id },
    });
  }
}
