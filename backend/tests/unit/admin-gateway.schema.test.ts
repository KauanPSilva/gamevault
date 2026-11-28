import { describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';

import {
  adminGatewayIdSchema,
  updateGatewayStatusSchema,
} from '../../src/modules/admin/schemas/admin-gateway.schema.js';

describe('Admin gateway ID schema', () => {
  it('should accept a valid UUID', () => {
    const id = randomUUID();

    const result = adminGatewayIdSchema.safeParse({
      id,
    });

    expect(result.success).toBe(true);
  });

  it.each([
    '',
    'invalid-id',
    'juntos-se-faz',
    '123',
  ])('should reject invalid ID: %s', (id) => {
    const result = adminGatewayIdSchema.safeParse({
      id,
    });

    expect(result.success).toBe(false);
  });

  it('should reject missing ID', () => {
    const result = adminGatewayIdSchema.safeParse({});

    expect(result.success).toBe(false);
  });

  it('should reject unexpected properties', () => {
    const result = adminGatewayIdSchema.safeParse({
      id: randomUUID(),
      extra: true,
    });

    expect(result.success).toBe(false);
  });
});

describe('Update gateway status schema', () => {
  it('should accept activation', () => {
    const result = updateGatewayStatusSchema.parse({
      isActive: true,
    });

    expect(result.isActive).toBe(true);
  });

  it('should accept deactivation', () => {
    const result = updateGatewayStatusSchema.parse({
      isActive: false,
    });

    expect(result.isActive).toBe(false);
  });

  it.each([
    'true',
    'false',
    1,
    0,
    null,
    undefined,
    {},
    [],
  ])('should reject invalid status: %j', (isActive) => {
    const result = updateGatewayStatusSchema.safeParse({
      isActive,
    });

    expect(result.success).toBe(false);
  });

  it('should reject missing status', () => {
    const result =
      updateGatewayStatusSchema.safeParse({});

    expect(result.success).toBe(false);
  });

  it.each([
    { name: 'Modified gateway' },
    { code: 'another-gateway' },
    { id: randomUUID() },
    { isImplemented: true },
    { environment: 'production' },
    { apiToken: 'fake-token' },
  ])('should reject unauthorized properties: %j', (extra) => {
    const result = updateGatewayStatusSchema.safeParse({
      isActive: true,
      ...extra,
    });

    expect(result.success).toBe(false);
  });
});