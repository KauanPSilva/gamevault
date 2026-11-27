import { prisma } from '../src/config/database.js';
import { categories } from './seeds/categories.js';
import { games } from './seeds/games.js';

async function main(): Promise<void> {
  console.log('Starting GameVault database seed...');

  await prisma.$transaction(async (tx) => {
    const categoryIds = new Map<string, string>();

    // Seed categories
    for (const category of categories) {
      const savedCategory = await tx.category.upsert({
        where: {
          slug: category.slug,
        },
        update: {
          name: category.name,
        },
        create: {
          name: category.name,
          slug: category.slug,
        },
      });

      categoryIds.set(category.slug, savedCategory.id);
    }

    console.log(`${categories.length} categories processed.`);

    // Seed games
    for (const game of games) {
      const { categorySlug, ...gameData } = game;

      const categoryId = categoryIds.get(categorySlug);

      if (!categoryId) {
        throw new Error(
          `Category not found for game: ${game.title}`,
        );
      }

      await tx.game.upsert({
        where: {
          slug: game.slug,
        },
        update: {
          ...gameData,
          categoryId,
        },
        create: {
          ...gameData,
          categoryId,
        },
      });
    }

    console.log(`${games.length} games processed.`);

    // Seed payment gateway
    await tx.paymentGateway.upsert({
      where: {
        code: 'juntos-se-faz',
      },
      update: {
        name: 'Juntos Se Faz',
        description: 'Payment gateway for sandbox transactions.',
      },
      create: {
        name: 'Juntos Se Faz',
        code: 'juntos-se-faz',
        description: 'Payment gateway for sandbox transactions.',
        isActive: true,
      },
    });

    console.log('Payment gateway processed.');
  }, {
    timeout: 30000,
  });

  console.log('GameVault database seed completed successfully.');
}

main()
  .catch((error: unknown) => {
    console.error('Database seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });