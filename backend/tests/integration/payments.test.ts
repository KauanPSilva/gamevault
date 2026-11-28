import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import request from 'supertest';

import { randomUUID } from 'node:crypto';

import app from '../../src/app.js';

import { prisma } from '../../src/config/database.js';

import { generateToken } from '../../src/utils/jwt.js';

import { gatewayRegistry } from '../../src/modules/payments/gateways/index.js';

import { JuntosSeFazAdapter } from '../../src/modules/payments/gateways/adapters/juntos-se-faz.adapter.js';

import { GatewayError } from '../../src/modules/payments/gateways/errors/gateway.error.js';

const suffix = randomUUID();

const userId = randomUUID();
const otherUserId = randomUUID();
const categoryId = randomUUID();

const gameIds = Array.from(
  { length: 8 },
  () => randomUUID(),
);

const token = generateToken({
  id: userId,
  role: 'CUSTOMER',
});

const otherToken = generateToken({
  id: otherUserId,
  role: 'CUSTOMER',
});

const gateway = gatewayRegistry.get(
  'juntos-se-faz',
) as JuntosSeFazAdapter;

const createPaymentMock = vi.spyOn(
  gateway,
  'createPayment',
);

const getPaymentMock = vi.spyOn(
  gateway,
  'getPayment',
);

const approvePaymentMock = vi.spyOn(
  gateway,
  'approvePayment',
);

const declinePaymentMock = vi.spyOn(
  gateway,
  'declinePayment',
);

const cancelPaymentMock = vi.spyOn(
  gateway,
  'cancelPayment',
);

function paymentInput(
  idempotencyKey = randomUUID(),
) {
  return {
    gatewayCode: 'juntos-se-faz',
    method: 'pix',
    idempotencyKey,
  };
}

async function createOrder(gameId: string) {
  const response = await request(app)
    .post('/orders')
    .set('Authorization', `Bearer ${token}`)
    .send({
      gameIds: [gameId],
    });

  expect(response.status).toBe(201);

  return response.body.order.id as string;
}

async function createPayment(
  orderId: string,
  input = paymentInput(),
) {
  return request(app)
    .post(`/orders/${orderId}/payments`)
    .set('Authorization', `Bearer ${token}`)
    .send(input);
}

async function simulate(
  paymentId: string,
  action: 'approve' | 'decline' | 'cancel',
) {
  return request(app)
    .post(`/payments/${paymentId}/simulate`)
    .set('Authorization', `Bearer ${token}`)
    .send({ action });
}

beforeAll(async () => {
  await prisma.user.createMany({
    data: [
      {
        id: userId,
        name: 'Payment Test User',
        email: `payment-${suffix}@example.com`,
        passwordHash: 'test-only',
      },
      {
        id: otherUserId,
        name: 'Other Payment User',
        email: `other-payment-${suffix}@example.com`,
        passwordHash: 'test-only',
      },
    ],
  });

  await prisma.category.create({
    data: {
      id: categoryId,
      name: `Payment Test ${suffix}`,
      slug: `payment-test-${suffix}`,
    },
  });

  await prisma.game.createMany({
    data: gameIds.map((id, index) => ({
      id,
      title: `Payment Test Game ${index}`,
      slug: `payment-test-${suffix}-${index}`,
      description: 'Payment integration test game',
      price: 10000,
      imageUrl: '/images/test.webp',
      categoryId,
      isActive: true,
    })),
  });

  await prisma.paymentGateway.upsert({
    where: {
      code: 'juntos-se-faz',
    },
    create: {
      code: 'juntos-se-faz',
      name: 'Juntos Se Faz',
      isActive: true,
    },
    update: {},
  });
});

beforeEach(() => {
  vi.resetAllMocks();

  createPaymentMock.mockImplementation(
    async (input) => ({
      externalId: `payments_${randomUUID()}`,
      amount: input.amount,
      currency: input.currency,
      reference: input.reference,
      status: 'pending',
      pixCode: 'SIMULATED_PIX_NOT_PAYABLE',
      simulated: true,
    }),
  );

  getPaymentMock.mockImplementation(
    async (externalId) => ({
      externalId,
      status: 'pending',
      simulated: true,
    }),
  );

  approvePaymentMock.mockImplementation(
    async (externalId) => ({
      externalId,
      status: 'approved',
      simulated: true,
    }),
  );

  declinePaymentMock.mockImplementation(
    async (externalId) => ({
      externalId,
      status: 'declined',
      simulated: true,
    }),
  );

  cancelPaymentMock.mockImplementation(
    async (externalId) => ({
      externalId,
      status: 'cancelled',
      simulated: true,
    }),
  );
});

afterAll(async () => {
  vi.restoreAllMocks();

  const users = [userId, otherUserId];

  await prisma.$transaction([
    prisma.libraryItem.deleteMany({
      where: {
        userId: { in: users },
      },
    }),

    prisma.payment.deleteMany({
      where: {
        order: {
          userId: { in: users },
        },
      },
    }),

    prisma.orderItem.deleteMany({
      where: {
        order: {
          userId: { in: users },
        },
      },
    }),

    prisma.order.deleteMany({
      where: {
        userId: { in: users },
      },
    }),

    prisma.game.deleteMany({
      where: {
        id: { in: gameIds },
      },
    }),

    prisma.category.deleteMany({
      where: {
        id: categoryId,
      },
    }),

    prisma.user.deleteMany({
      where: {
        id: { in: users },
      },
    }),
  ]);

  await prisma.$disconnect();
});

describe('Payment integration', () => {
  it('should require authentication', async () => {
    const response = await request(app)
      .get('/payment-gateways');

    expect(response.status).toBe(401);
  });

  it('should list implemented active gateways', async () => {
    const response = await request(app)
      .get('/payment-gateways')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(response.body.gateways).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'juntos-se-faz',
        }),
      ]),
    );
  });

  it('should create and persist a payment', async () => {
    const orderId = await createOrder(gameIds[0]!);

    const response = await createPayment(orderId);

    expect(response.status).toBe(201);

    expect(response.body.payment).toMatchObject({
      orderId,
      amount: 10000,
      currency: 'BRL',
      status: 'PENDING',
      simulated: true,
      paymentMethod: 'pix',
    });

    expect(createPaymentMock).toHaveBeenCalledTimes(1);

    const persisted = await prisma.payment.findUnique({
      where: {
        id: response.body.payment.id,
      },
    });

    expect(persisted?.status).toBe('PENDING');
    expect(persisted?.pixCode).toBeTruthy();
  });

  it('should reuse an existing idempotency key', async () => {
    const orderId = await createOrder(gameIds[1]!);
    const input = paymentInput();

    const first = await createPayment(orderId, input);
    const second = await createPayment(orderId, input);

    expect(first.status).toBe(201);
    expect(second.status).toBe(200);

    expect(second.body.payment.id).toBe(
      first.body.payment.id,
    );

    expect(createPaymentMock).toHaveBeenCalledTimes(1);
  });

  it('should reject another active payment', async () => {
    const orderId = await createOrder(gameIds[2]!);

    const first = await createPayment(orderId);
    const second = await createPayment(orderId);

    expect(first.status).toBe(201);
    expect(second.status).toBe(409);

    expect(second.body.error.code).toBe(
      'PAYMENT_ALREADY_EXISTS',
    );

    expect(createPaymentMock).toHaveBeenCalledTimes(1);
  });

  it('should prevent access to another user payment', async () => {
    const orderId = await createOrder(gameIds[3]!);

    const created = await createPayment(orderId);
    expect(created.status).toBe(201);

    const paymentId = created.body.payment.id;

    const response = await request(app)
      .get(`/payments/${paymentId}`)
      .set(
        'Authorization',
        `Bearer ${otherToken}`,
      );

    expect(response.status).toBe(404);

    const simulation = await request(app)
      .post(`/payments/${paymentId}/simulate`)
      .set(
        'Authorization',
        `Bearer ${otherToken}`,
      )
      .send({ action: 'approve' });

    expect(simulation.status).toBe(404);

    expect(approvePaymentMock).not.toHaveBeenCalled();
  });

  it('should approve a payment and unlock the game', async () => {
    const gameId = gameIds[4]!;
    const orderId = await createOrder(gameId);

    const created = await createPayment(orderId);
    expect(created.status).toBe(201);

    const paymentId = created.body.payment.id;

    const response = await simulate(
      paymentId,
      'approve',
    );

    expect(response.status).toBe(200);

    expect(response.body.payment.status).toBe(
      'APPROVED',
    );

    expect(response.body.payment.paidAt).toBeTruthy();

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    expect(order?.status).toBe('PAID');

    const libraryItem =
      await prisma.libraryItem.findUnique({
        where: {
          userId_gameId: {
            userId,
            gameId,
          },
        },
      });

    expect(libraryItem).not.toBeNull();

    // Repeating the approval must not duplicate purchases.
    const repeated = await simulate(
      paymentId,
      'approve',
    );

    expect(repeated.status).toBe(200);

    expect(repeated.body.payment.paidAt).toBe(
      response.body.payment.paidAt,
    );

    expect(approvePaymentMock).toHaveBeenCalledTimes(1);

    const libraryCount =
      await prisma.libraryItem.count({
        where: {
          userId,
          gameId,
        },
      });

    expect(libraryCount).toBe(1);

    // An approved payment cannot be cancelled.
    const cancelled = await simulate(
      paymentId,
      'cancel',
    );

    expect(cancelled.status).toBe(409);
    expect(cancelPaymentMock).not.toHaveBeenCalled();

    // Stateless sandbox responses must not overwrite
    // the locally approved payment.
    const gatewayStatus = await request(app)
      .get(`/payments/${paymentId}/gateway-status`)
      .set('Authorization', `Bearer ${token}`);

    expect(gatewayStatus.status).toBe(200);

    expect(gatewayStatus.body.status).toMatchObject({
      localStatus: 'APPROVED',
      gatewayStatus: 'pending',
      simulated: true,
    });

    const persisted = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    expect(persisted?.status).toBe('APPROVED');
  });

  it('should decline a payment without unlocking games', async () => {
    const gameId = gameIds[5]!;
    const orderId = await createOrder(gameId);

    const created = await createPayment(orderId);
    expect(created.status).toBe(201);

    const response = await simulate(
      created.body.payment.id,
      'decline',
    );

    expect(response.status).toBe(200);

    expect(response.body.payment.status).toBe('FAILED');

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    expect(order?.status).toBe('FAILED');

    expect(
      await prisma.libraryItem.count({
        where: { userId, gameId },
      }),
    ).toBe(0);
  });

  it('should cancel a pending payment', async () => {
    const gameId = gameIds[6]!;
    const orderId = await createOrder(gameId);

    const created = await createPayment(orderId);
    expect(created.status).toBe(201);

    const response = await simulate(
      created.body.payment.id,
      'cancel',
    );

    expect(response.status).toBe(200);

    expect(response.body.payment.status).toBe(
      'CANCELLED',
    );

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    expect(order?.status).toBe('CANCELLED');

    expect(
      await prisma.libraryItem.count({
        where: { userId, gameId },
      }),
    ).toBe(0);
  });

  it('should prevent automatic retries after a timeout', async () => {
    const orderId = await createOrder(gameIds[7]!);

    const input = paymentInput();

    createPaymentMock.mockRejectedValueOnce(
      new GatewayError(
        'Gateway timeout',
        504,
        'GATEWAY_TIMEOUT',
      ),
    );

    const response = await createPayment(
      orderId,
      input,
    );

    expect(response.status).toBe(504);

    const persisted = await prisma.payment.findUnique({
      where: {
        idempotencyKey: input.idempotencyKey,
      },
    });

    expect(persisted?.status).toBe('PROCESSING');

    expect(persisted?.failureReason).toBe(
      'GATEWAY_TIMEOUT',
    );

    const repeated = await createPayment(
      orderId,
      input,
    );

    expect(repeated.status).toBe(200);

    expect(repeated.body.payment.status).toBe(
      'PROCESSING',
    );

    const anotherAttempt = await createPayment(orderId);

    expect(anotherAttempt.status).toBe(409);

    expect(createPaymentMock).toHaveBeenCalledTimes(1);
  });
  it('should prevent concurrent duplicate payments', async () => {
    const orderId = await createOrder(gameIds[0]!);

    const [first, second] = await Promise.all([
        createPayment(orderId),
        createPayment(orderId),
    ]);

    const statuses = [
        first.status,
        second.status,
    ].sort((a, b) => a - b);

    expect(statuses).toEqual([201, 409]);

    expect(createPaymentMock).toHaveBeenCalledTimes(1);

    const payments = await prisma.payment.findMany({
        where: {
        orderId,
        },
    });

    expect(payments).toHaveLength(1);

    expect(payments[0]?.status).toBe('PENDING');
    });
});