import {
  describe,
  it,
  expect,
} from 'vitest';

import { createOrderSchema } from '../../../src/modules/orders/schemas/create-order.schema.js';
import { orderIdSchema } from '../../../src/modules/orders/schemas/order-id.schema.js';
import { listOrdersSchema } from '../../../src/modules/orders/schemas/list-orders.schema.js';

const gameId =
  '11111111-1111-4111-8111-111111111111';

const secondGameId =
  '22222222-2222-4222-8222-222222222222';

describe('createOrderSchema', () => {
  it('should accept an order with one game', () => {
    const result = createOrderSchema.safeParse({
      gameIds: [gameId],
    });

    expect(result.success).toBe(true);
  });

  it('should accept multiple different games', () => {
    const result = createOrderSchema.safeParse({
      gameIds: [gameId, secondGameId],
    });

    expect(result.success).toBe(true);
  });

  it('should reject an empty cart', () => {
    expect(
      createOrderSchema.safeParse({
        gameIds: [],
      }).success,
    ).toBe(false);
  });

  it('should reject duplicate games', () => {
    expect(
      createOrderSchema.safeParse({
        gameIds: [gameId, gameId],
      }).success,
    ).toBe(false);
  });

  it('should reject invalid game identifiers', () => {
    expect(
      createOrderSchema.safeParse({
        gameIds: ['invalid-id'],
      }).success,
    ).toBe(false);
  });

  it('should reject missing game identifiers', () => {
    expect(
      createOrderSchema.safeParse({}).success,
    ).toBe(false);
  });

  it('should reject game identifiers that are not an array', () => {
    expect(
      createOrderSchema.safeParse({
        gameIds: gameId,
      }).success,
    ).toBe(false);
  });

  it('should accept exactly 50 games', () => {
    const gameIds = Array.from(
      { length: 50 },
      (_, index) =>
        `11111111-1111-4111-8111-${String(
          index,
        ).padStart(12, '0')}`,
    );

    expect(
      createOrderSchema.safeParse({
        gameIds,
      }).success,
    ).toBe(true);
  });

  it('should reject more than 50 games', () => {
    const gameIds = Array.from(
      { length: 51 },
      (_, index) =>
        `11111111-1111-4111-8111-${String(
          index,
        ).padStart(12, '0')}`,
    );

    expect(
      createOrderSchema.safeParse({
        gameIds,
      }).success,
    ).toBe(false);
  });

  it.each([
    { totalAmount: 1 },
    { status: 'PAID' },
    { userId: secondGameId },
    { currency: 'USD' },
    { unitPrice: 1 },
    { discount: 100 },
    { paymentStatus: 'APPROVED' },
  ])('should reject unauthorized fields: %j', (fields) => {
    expect(
      createOrderSchema.safeParse({
        gameIds: [gameId],
        ...fields,
      }).success,
    ).toBe(false);
  });
});

describe('orderIdSchema', () => {
  it('should accept a valid order identifier', () => {
    expect(
      orderIdSchema.safeParse({
        id: gameId,
      }).success,
    ).toBe(true);
  });

  it.each([
    '',
    'invalid-id',
    '123',
    '../orders',
    'null',
  ])('should reject an invalid identifier: %s', (id) => {
    expect(
      orderIdSchema.safeParse({
        id,
      }).success,
    ).toBe(false);
  });

  it('should reject a missing identifier', () => {
    expect(
      orderIdSchema.safeParse({}).success,
    ).toBe(false);
  });

  it('should reject additional fields', () => {
    expect(
      orderIdSchema.safeParse({
        id: gameId,
        userId: secondGameId,
      }).success,
    ).toBe(false);
  });
});

describe('listOrdersSchema', () => {
  it('should apply default pagination', () => {
    expect(
      listOrdersSchema.parse({}),
    ).toEqual({
      page: 1,
      limit: 10,
    });
  });

  it('should convert pagination strings into numbers', () => {
    expect(
      listOrdersSchema.parse({
        page: '2',
        limit: '20',
      }),
    ).toEqual({
      page: 2,
      limit: 20,
    });
  });

  it('should accept maximum pagination values', () => {
    expect(
      listOrdersSchema.safeParse({
        page: '10000',
        limit: '50',
      }).success,
    ).toBe(true);
  });

  it.each([
    '0',
    '-1',
    '1.5',
    'abc',
    '10001',
    '',
  ])('should reject an invalid page: %s', (page) => {
    expect(
      listOrdersSchema.safeParse({
        page,
      }).success,
    ).toBe(false);
  });

  it.each([
    '0',
    '-1',
    '1.5',
    'abc',
    '51',
    '',
  ])('should reject an invalid limit: %s', (limit) => {
    expect(
      listOrdersSchema.safeParse({
        limit,
      }).success,
    ).toBe(false);
  });

  it('should reject unexpected query parameters', () => {
    expect(
      listOrdersSchema.safeParse({
        page: '1',
        userId: gameId,
      }).success,
    ).toBe(false);
  });

  it('should reject repeated pagination parameters', () => {
    expect(
      listOrdersSchema.safeParse({
        page: ['1', '2'],
      }).success,
    ).toBe(false);
  });
});