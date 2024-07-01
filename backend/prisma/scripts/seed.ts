import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Criação de Tenants
  const tenant1 = await prisma.tenant.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, name: 'Tenant 1' },
  });

  const tenant2 = await prisma.tenant.upsert({
    where: { id: 2 },
    update: {},
    create: { id: 2, name: 'Tenant 2' },
  });

  // Criação de Roles
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

  // Criação de Usuários
  const passwordHash = await bcrypt.hash('password', 10);

  const user1 = await prisma.user.upsert({
    where: { email: 'admin@tenant1.com' },
    update: {},
    create: {
      email: 'admin@tenant1.com',
      password: passwordHash,
      roleId: adminRole.id,
      tenantId: tenant1.id,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'user@tenant1.com' },
    update: {},
    create: {
      email: 'user@tenant1.com',
      password: passwordHash,
      roleId: userRole.id,
      tenantId: tenant1.id,
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: 'admin@tenant2.com' },
    update: {},
    create: {
      email: 'admin@tenant2.com',
      password: passwordHash,
      roleId: adminRole.id,
      tenantId: tenant2.id,
    },
  });

  const user4 = await prisma.user.upsert({
    where: { email: 'user@tenant2.com' },
    update: {},
    create: {
      email: 'user@tenant2.com',
      password: passwordHash,
      roleId: userRole.id,
      tenantId: tenant2.id,
    },
  });

  // Criar motoristas
  await prisma.driver.upsert({
    where: { cpf_tenantId: { cpf: '123.456.789-00', tenantId: 1 } },
    update: {},
    create: {
      name: 'Driver One',
      license: 'ABC123456',
      cpf: '123.456.789-00',
      tenantId: 1,
    },
  });

  await prisma.driver.upsert({
    where: { cpf_tenantId: { cpf: '987.654.321-00', tenantId: 2 } },
    update: {},
    create: {
      name: 'Driver Two',
      license: 'DEF654321',
      cpf: '987.654.321-00',
      tenantId: 2,
    },
  });

  // Criar categorias
  await prisma.category.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, name: 'Category A', valor: 100 },
  });

  await prisma.category.upsert({
    where: { id: 2 },
    update: {},
    create: { id: 2, name: 'Category B', valor: 200 },
  });

  // Criar veículos
  await prisma.vehicle.upsert({
    where: { plate_tenantId: { plate: 'XYZ9876', tenantId: 1 } },
    update: {},
    create: {
      model: 'Toyota Corolla',
      plate: 'XYZ9876',
      driverId: 1,
      tenantId: 1,
      categoryId: 1,
    },
  });

  await prisma.vehicle.upsert({
    where: { plate_tenantId: { plate: 'ABC1234', tenantId: 2 } },
    update: {},
    create: {
      model: 'Honda Civic',
      plate: 'ABC1234',
      driverId: 2,
      tenantId: 2,
      categoryId: 2,
    },
  });

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
