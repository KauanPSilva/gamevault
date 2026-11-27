import { describe, it, expect, afterAll } from 'vitest';

import { prisma } from '../../src/config/database.js';

describe('Database connection', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should successfully connect to PostgreSQL', async () => {
    const result = await prisma.$queryRaw`
      SELECT 1 AS connected
    `;

    expect(result).toEqual([
      { connected: 1 },
    ]);
  });
});