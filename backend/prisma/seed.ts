// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log(`Iniciando o processo de seed...`);

  // 1. Criar Roles Essenciais
  const superAdminRole = await prisma.role.upsert({
    where: { name: 'superadmin' },
    update: { description: 'Administrador Geral da Plataforma', isPlatformRole: true },
    create: {
      name: 'superadmin',
      description: 'Administrador Geral da Plataforma',
      isPlatformRole: true,
    },
  });

  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: { description: 'Administrador do Tenant', isPlatformRole: false },
    create: {
      name: 'admin',
      description: 'Administrador do Tenant',
      isPlatformRole: false,
    },
  });

  const userRole = await prisma.role.upsert({
    where: { name: 'user' },
    update: { description: 'Usuário Padrão do Tenant', isPlatformRole: false },
    create: {
      name: 'user',
      description: 'Usuário Padrão do Tenant',
      isPlatformRole: false,
    },
  });

  const driverRole = await prisma.role.upsert({
    where: { name: 'driver' },
    update: { description: 'Motorista do Tenant', isPlatformRole: false },
    create: {
      name: 'driver',
      description: 'Motorista do Tenant',
      isPlatformRole: false,
    },
  });

  console.log('Roles criadas/atualizadas:', superAdminRole, adminRole, userRole, driverRole);

  // 2. Criar o Usuário Super Admin a partir do .env
  const saEmail = process.env.PLATFORM_ADMIN_EMAIL;
  const saPassword = process.env.PLATFORM_ADMIN_PASSWORD;
  const saName = process.env.PLATFORM_ADMIN_NAME;

  if (!saEmail || !saPassword || !saName) {
    console.error(
      'Variáveis de ambiente PLATFORM_ADMIN_EMAIL, PLATFORM_ADMIN_PASSWORD ou PLATFORM_ADMIN_NAME não definidas no .env',
    );
    process.exit(1);
  }

  const existingSuperAdmin = await prisma.user.findUnique({
    where: { email: saEmail },
  });

  if (!existingSuperAdmin) {
    const hashedPassword = await bcrypt.hash(saPassword, 10);
    const superAdminUser = await prisma.user.create({
      data: {
        email: saEmail,
        password: hashedPassword,
        name: saName,
        roleId: superAdminRole.id, // Atribui a role 'superadmin'
        tenantId: null,
      },
    });
    console.log('Usuário Super Admin criado:', superAdminUser);
  } else {
    console.log('Usuário Super Admin já existe:', existingSuperAdmin.email);
  }

  console.log(`Seed finalizado.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });