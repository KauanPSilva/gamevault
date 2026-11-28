import { describe, expect, it } from 'vitest';

import { randomUUID } from 'node:crypto';

import { createPaymentSchema } from '../../../src/modules/payments/schemas/create-payment.schema.js';

import { paymentIdSchema } from '../../../src/modules/payments/schemas/payment-id.schema.js';

import { simulatePaymentSchema } from '../../../src/modules/payments/schemas/simulate-payment.schema.js';

const validPayment = {
  gatewayCode: 'juntos-se-faz',
  method: 'pix',
  idempotencyKey: randomUUID(),
};

describe('createPaymentSchema', () => {
  it('should accept valid payment data', () => {
    const result =
      createPaymentSchema.safeParse(validPayment);

    expect(result.success).toBe(true);
  });

  it('should trim gateway code', () => {
    const result = createPaymentSchema.parse({
      ...validPayment,
      gatewayCode: ' juntos-se-faz ',
    });

    expect(result.gatewayCode).toBe('juntos-se-faz');
  });

  it.each([
    '',
    ' ',
    'JUNTOS-SE-FAZ',
    'juntos se faz',
    '../gateway',
    'gateway--test',
    '-gateway',
    'gateway-',
    'a'.repeat(101),
  ])('should reject invalid gateway code: %s', (gatewayCode) => {
    const result = createPaymentSchema.safeParse({
      ...validPayment,
      gatewayCode,
    });

    expect(result.success).toBe(false);
  });

  it.each([
    'credit_card',
    'boleto',
    'PIX',
    '',
    null,
  ])('should reject unsupported payment method: %s', (method) => {
    const result = createPaymentSchema.safeParse({
      ...validPayment,
      method,
    });

    expect(result.success).toBe(false);
  });

  it.each([
    '',
    'invalid-key',
    '123',
    null,
  ])('should reject invalid idempotency key: %s', (idempotencyKey) => {
    const result = createPaymentSchema.safeParse({
      ...validPayment,
      idempotencyKey,
    });

    expect(result.success).toBe(false);
  });

  it.each([
    'gatewayCode',
    'method',
    'idempotencyKey',
  ])('should reject missing field: %s', (field) => {
    const input: Record<string, unknown> = {
      ...validPayment,
    };

    delete input[field];

    expect(
      createPaymentSchema.safeParse(input).success,
    ).toBe(false);
  });

  it.each([
    { amount: 1 },
    { currency: 'USD' },
    { status: 'APPROVED' },
    { userId: randomUUID() },
    { orderId: randomUUID() },
    { simulated: false },
    { externalId: 'fake-payment' },
    { pixCode: 'fake-pix' },
  ])('should reject unauthorized fields: %j', (fields) => {
    const result = createPaymentSchema.safeParse({
      ...validPayment,
      ...fields,
    });

    expect(result.success).toBe(false);
  });
});

describe('paymentIdSchema', () => {
  it('should accept a valid UUID', () => {
    expect(
      paymentIdSchema.safeParse({
        id: randomUUID(),
      }).success,
    ).toBe(true);
  });

  it.each([
    '',
    '123',
    'invalid-id',
    null,
  ])('should reject invalid payment ID: %s', (id) => {
    expect(
      paymentIdSchema.safeParse({ id }).success,
    ).toBe(false);
  });

  it('should reject missing ID', () => {
    expect(
      paymentIdSchema.safeParse({}).success,
    ).toBe(false);
  });

  it('should reject additional fields', () => {
    expect(
      paymentIdSchema.safeParse({
        id: randomUUID(),
        userId: randomUUID(),
      }).success,
    ).toBe(false);
  });
});

describe('simulatePaymentSchema', () => {
  it.each([
    'approve',
    'decline',
    'cancel',
  ])('should accept supported action: %s', (action) => {
    expect(
      simulatePaymentSchema.safeParse({
        action,
      }).success,
    ).toBe(true);
  });

  it.each([
    'refund',
    'capture',
    'APPROVE',
    'approved',
    '',
    null,
  ])('should reject unsupported action: %s', (action) => {
    expect(
      simulatePaymentSchema.safeParse({
        action,
      }).success,
    ).toBe(false);
  });

  it('should reject missing action', () => {
    expect(
      simulatePaymentSchema.safeParse({}).success,
    ).toBe(false);
  });

  it.each([
    { status: 'APPROVED' },
    { amount: 1 },
    { simulated: false },
    { userId: randomUUID() },
    { paidAt: new Date().toISOString() },
  ])('should reject unauthorized fields: %j', (fields) => {
    expect(
      simulatePaymentSchema.safeParse({
        action: 'approve',
        ...fields,
      }).success,
    ).toBe(false);
  });
});