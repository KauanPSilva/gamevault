import { z } from 'zod';
import { prisma } from '../src/config/database.js';

async function main() {
  const emailInput = process.argv[2];

  const result = z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email())
    .safeParse(emailInput);

  if (!result.success) {
    throw new Error(
      'Usage: npm run admin:create -- <email>',
    );
  }

  const email = result.data;

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  if (!user) {
    throw new Error(
      'User not found. Register the account first.',
    );
  }

  if (user.role === 'ADMIN') {
    console.log('User is already an administrator.');
    return;
  }

  const admin = await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      role: 'ADMIN',
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  console.log('Administrator configured successfully.');
  console.table(admin);
}

main()
  .catch((error: unknown) => {
    console.error(
      error instanceof Error
        ? error.message
        : 'Failed to configure administrator.',
    );

    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });