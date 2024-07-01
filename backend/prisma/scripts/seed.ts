import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Hashing de senha
  const passwordHash = await bcrypt.hash('password', 10);

  // Inserir dados na tabela Role
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: { name: 'admin' },
  });

  const userRole = await prisma.role.upsert({
    where: { name: 'user' },
    update: {},
    create: { name: 'user' },
  });

  // Inserir dados na tabela Tenant
  const tenant1 = await prisma.tenant.upsert({
    where: { name: 'Tenant1' },
    update: {},
    create: { name: 'Tenant1' },
  });

  const tenant2 = await prisma.tenant.upsert({
    where: { name: 'Tenant2' },
    update: {},
    create: { name: 'Tenant2' },
  });

  // Inserir dados na tabela User
  await prisma.user.upsert({
    where: { email: 'admin@tenant1.com' },
    update: {},
    create: {
      email: 'admin@tenant1.com',
      password: passwordHash,
      roleId: adminRole.id,
      tenantId: tenant1.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'user@tenant1.com' },
    update: {},
    create: {
      email: 'user@tenant1.com',
      password: passwordHash,
      roleId: userRole.id,
      tenantId: tenant1.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@tenant2.com' },
    update: {},
    create: {
      email: 'admin@tenant2.com',
      password: passwordHash,
      roleId: adminRole.id,
      tenantId: tenant2.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'user@tenant2.com' },
    update: {},
    create: {
      email: 'user@tenant2.com',
      password: passwordHash,
      roleId: userRole.id,
      tenantId: tenant2.id,
    },
  });

  // Inserir dados na tabela Driver
  const driver1 = await prisma.driver.upsert({
    where: { cpf_tenantId: { cpf: '123.456.789-00', tenantId: tenant1.id } },
    update: {},
    create: {
      name: 'John Doe',
      license: 'ABC123456',
      cpf: '123.456.789-00',
      tenantId: tenant1.id,
    },
  });

  const driver2 = await prisma.driver.upsert({
    where: { cpf_tenantId: { cpf: '987.654.321-00', tenantId: tenant2.id } },
    update: {},
    create: {
      name: 'Jane Smith',
      license: 'DEF789101',
      cpf: '987.654.321-00',
      tenantId: tenant2.id,
    },
  });

  // Inserir dados na tabela Vehicle
  await prisma.vehicle.upsert({
    where: { plate_tenantId: { plate: 'XYZ9876', tenantId: tenant1.id } },
    update: {},
    create: {
      model: 'Toyota Corolla',
      plate: 'XYZ9876',
      driverId: driver1.id,
      tenantId: tenant1.id,
    },
  });

  await prisma.vehicle.upsert({
    where: { plate_tenantId: { plate: 'ABC1234', tenantId: tenant2.id } },
    update: {},
    create: {
      model: 'Honda Civic',
      plate: 'ABC1234',
      driverId: driver2.id,
      tenantId: tenant2.id,
    },
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
