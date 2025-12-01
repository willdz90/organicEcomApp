import { PrismaClient, Role, Plan } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@organicecom.com';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('Admin ya existe');
    return;
  }

  const password = await bcrypt.hash('Admin123$', 10);

  await prisma.user.create({
    data: {
      email,
      password,
      role: Role.ADMIN,
      plan: Plan.ENTERPRISE,
      isActive: true,
    },
  });

  console.log(`✅ Admin creado: ${email} / Admin123$`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
