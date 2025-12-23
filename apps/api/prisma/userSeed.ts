import { PrismaClient, Role, Plan } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@organicecom.com';

  const password = await bcrypt.hash('WilldzAdmin2025!', 10);

  await prisma.user.upsert({
    where: { email },
    update: {
      password,
      isActive: true,
      role: Role.ADMIN,
      plan: Plan.ENTERPRISE,
    },
    create: {
      email,
      password,
      role: Role.ADMIN,
      plan: Plan.ENTERPRISE,
      isActive: true,
    },
  });

  console.log(`✅ Admin actualizado/creado: ${email} / WilldzAdmin2025!`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
