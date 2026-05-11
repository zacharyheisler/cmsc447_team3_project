import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcryptjs';
import 'dotenv/config';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const company = await prisma.company.upsert({
    where: { name: 'AG Associates' },
    update: {},
    create: { name: 'AG Associates' },
  });

  const password = await bcrypt.hash('Password123!', 12);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@test.com',
      phoneNumber: '1111111111',
      password,
      companyId: company.companyId,
    },
  });

  const admin = await prisma.admin.upsert({
    where: { userId: adminUser.userId },
    update: {},
    create: {
      userId: adminUser.userId,
    },
  });

  await prisma.user.update({
    where: { userId: adminUser.userId },
    data: {
      verifiedByAdminId: admin.adminId,
    },
  });

  const agentUser = await prisma.user.upsert({
    where: { email: 'agent@test.com' },
    update: {},
    create: {
      username: 'agent',
      email: 'agent@test.com',
      phoneNumber: '2222222222',
      password,
      companyId: company.companyId,
      verifiedByAdminId: admin.adminId,
    },
  });

  const agent = await prisma.agent.upsert({
    where: { userId: agentUser.userId },
    update: {},
    create: {
      userId: agentUser.userId,
    },
  });

  const normalUser = await prisma.user.upsert({
    where: { email: 'user@test.com' },
    update: {},
    create: {
      username: 'user',
      email: 'user@test.com',
      phoneNumber: '3333333333',
      password,
      companyId: company.companyId,
      verifiedByAdminId: admin.adminId,
    },
  });

  await prisma.ticket.create({
    data: {
      type: 'TECH_SUPPORT',
      description: 'Cannot log into the customer dashboard.',
      createdById: normalUser.userId,
      assignedToId: agent.agentId,
    },
  });

  await prisma.ticket.create({
    data: {
      type: 'BUG',
      description: 'Payment page throws an error after submission.',
      createdById: normalUser.userId,
    },
  });

  console.log('Seed complete');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });