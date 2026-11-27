import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
} from 'vitest';

import {
  GatewayRegistry,
} from '../../../../src/modules/payments/gateways/gateway.registry.js';

import type {
  PaymentGateway,
} from '../../../../src/modules/payments/gateways/interfaces/payment-gateway.interface.js';

function createMockGateway(
  code: string,
  name: string
): PaymentGateway {
  return {
    code,
    name,
    createPayment: vi.fn<PaymentGateway['createPayment']>(),
    getPayment: vi.fn<PaymentGateway['getPayment']>(),
  };
}

describe('GatewayRegistry', () => {
  let registry: GatewayRegistry;
  let gateway: PaymentGateway;

  beforeEach(() => {
    registry = new GatewayRegistry();

    gateway = createMockGateway(
      'juntos-se-faz',
      'Juntos Se Faz'
    );
  });

  it('should initialize an empty registry', () => {
    expect(registry.list()).toEqual([]);
  });

  it('should register a payment gateway', () => {
    registry.register(gateway);

    expect(registry.has('juntos-se-faz')).toBe(true);
  });

  it('should initialize with registered gateways', () => {
    const initializedRegistry = new GatewayRegistry([
      gateway,
    ]);

    expect(
      initializedRegistry.has('juntos-se-faz')
    ).toBe(true);
  });

  it('should retrieve a registered gateway', () => {
    registry.register(gateway);

    expect(
      registry.get('juntos-se-faz')
    ).toBe(gateway);
  });

  it('should reject an unsupported gateway', () => {
    expect(() => {
      registry.get('unknown-gateway');
    }).toThrow(
      expect.objectContaining({
        statusCode: 400,
        code: 'GATEWAY_NOT_SUPPORTED',
      })
    );
  });

  it('should reject duplicate gateway registration', () => {
    registry.register(gateway);

    const duplicate = createMockGateway(
      'juntos-se-faz',
      'Duplicate Gateway'
    );

    expect(() => {
      registry.register(duplicate);
    }).toThrow(
      expect.objectContaining({
        statusCode: 500,
        code: 'GATEWAY_ALREADY_REGISTERED',
      })
    );

    expect(
      registry.get('juntos-se-faz')
    ).toBe(gateway);
  });

  it('should return false for an unregistered gateway', () => {
    expect(
      registry.has('unknown-gateway')
    ).toBe(false);
  });

  it('should list only public gateway information', () => {
    registry.register(gateway);

    expect(registry.list()).toEqual([
      {
        code: 'juntos-se-faz',
        name: 'Juntos Se Faz',
      },
    ]);
  });

  it('should support multiple payment gateways', () => {
    const secondGateway = createMockGateway(
      'mock-gateway',
      'Mock Gateway'
    );

    registry.register(gateway);
    registry.register(secondGateway);

    expect(registry.list()).toHaveLength(2);

    expect(
      registry.get('juntos-se-faz')
    ).toBe(gateway);

    expect(
      registry.get('mock-gateway')
    ).toBe(secondGateway);
  });
});