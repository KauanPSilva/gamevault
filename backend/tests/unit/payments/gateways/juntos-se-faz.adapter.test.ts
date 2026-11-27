import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
} from 'vitest';

import {
  JuntosSeFazAdapter,
} from '../../../../src/modules/payments/gateways/adapters/juntos-se-faz.adapter.js';

import type {
  CreatePaymentInput,
} from '../../../../src/modules/payments/gateways/interfaces/payment-gateway.interface.js';

const BASE_URL = 'https://gateway.example.com/api/v1';
const API_TOKEN = 'fake-test-token';
const PAYMENT_ID = 'payments_test_123';

const paymentInput: CreatePaymentInput = {
  amount: 3990,
  currency: 'BRL',
  reference: 'gamevault-test-001',
  description: 'GameVault test purchase',
  method: 'pix',
};

const baseResponse = {
  id: PAYMENT_ID,
  type: 'payments',
  status: 'pending',
  environment: 'staging',
  simulated: true,
  created_at: '2026-11-27T12:00:00.000Z',
};

const creationResponse = {
  ...baseResponse,
  amount: 39.9,
  currency: 'BRL',
  reference: paymentInput.reference,
  pix_code: `SIMULATED_PIX_NOT_PAYABLE_${PAYMENT_ID}`,
};

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

describe('JuntosSeFazAdapter', () => {
  let adapter: JuntosSeFazAdapter;

  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    fetchMock.mockReset();

    vi.stubGlobal('fetch', fetchMock);

    adapter = new JuntosSeFazAdapter(
      BASE_URL,
      API_TOKEN,
      1000
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('createPayment', () => {
    it('should create a PIX payment and convert monetary values', async () => {
      fetchMock.mockResolvedValue(
        jsonResponse(creationResponse, 201)
      );

      const result = await adapter.createPayment(paymentInput);

      expect(result).toEqual({
        externalId: PAYMENT_ID,
        status: 'pending',
        amount: 3990,
        currency: 'BRL',
        reference: paymentInput.reference,
        pixCode: creationResponse.pix_code,
        simulated: true,
      });

      expect(fetchMock).toHaveBeenCalledWith(
        `${BASE_URL}/payments`,
        expect.objectContaining({
          method: 'POST',
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            ...paymentInput,
            amount: 39.9,
          }),
          redirect: 'error',
          signal: expect.any(AbortSignal),
        })
      );
    });

    it.each([0, -100, 10.5, NaN, Infinity])(
      'should reject invalid amount: %s',
      async (amount) => {
        await expect(
          adapter.createPayment({
            ...paymentInput,
            amount,
          })
        ).rejects.toMatchObject({
          statusCode: 400,
          code: 'INVALID_PAYMENT_AMOUNT',
        });

        expect(fetchMock).not.toHaveBeenCalled();
      }
    );

    it.each([
      { amount: 99.9 },
      { currency: 'USD' },
      { reference: 'different-reference' },
      { pix_code: undefined },
    ])(
      'should reject inconsistent payment data: %j',
      async (override) => {
        fetchMock.mockResolvedValue(
          jsonResponse({
            ...creationResponse,
            ...override,
          })
        );

        await expect(
          adapter.createPayment(paymentInput)
        ).rejects.toMatchObject({
          code: 'GATEWAY_PAYMENT_MISMATCH',
        });
      }
    );
  });

  describe('getPayment', () => {
    it('should retrieve a payment by its external ID', async () => {
      fetchMock.mockResolvedValue(
        jsonResponse(baseResponse)
      );

      const result = await adapter.getPayment(PAYMENT_ID);

      expect(result).toMatchObject({
        externalId: PAYMENT_ID,
        status: 'pending',
        simulated: true,
      });

      expect(fetchMock).toHaveBeenCalledWith(
        `${BASE_URL}/payments/${PAYMENT_ID}`,
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('should reject an unexpected payment ID', async () => {
      fetchMock.mockResolvedValue(
        jsonResponse({
          ...baseResponse,
          id: 'different-payment',
        })
      );

      await expect(
        adapter.getPayment(PAYMENT_ID)
      ).rejects.toMatchObject({
        code: 'GATEWAY_PAYMENT_MISMATCH',
      });
    });
  });

  describe('sandbox actions', () => {
    it.each([
      ['approvePayment', 'approve', 'approved'],
      ['declinePayment', 'decline', 'declined'],
      ['cancelPayment', 'cancel', 'cancelled'],
    ] as const)(
      'should execute %s successfully',
      async (method, action, status) => {
        fetchMock.mockResolvedValue(
          jsonResponse({
            ...baseResponse,
            status,
          })
        );

        const result = await adapter[method](PAYMENT_ID);

        expect(result.status).toBe(status);

        expect(fetchMock).toHaveBeenCalledWith(
          `${BASE_URL}/payments/${PAYMENT_ID}/${action}`,
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({
              reason: `GameVault sandbox ${action}`,
            }),
          })
        );
      }
    );

    it('should reject an unexpected action status', async () => {
      fetchMock.mockResolvedValue(
        jsonResponse(baseResponse)
      );

      await expect(
        adapter.approvePayment(PAYMENT_ID)
      ).rejects.toMatchObject({
        code: 'GATEWAY_STATUS_MISMATCH',
      });
    });
  });

  describe('response validation', () => {
    it.each([
      { environment: 'production' },
      { simulated: false },
      { status: 'unknown' },
      { id: '' },
      { type: 'customers' },
      { created_at: 'invalid-date' },
    ])(
      'should reject an invalid gateway response: %j',
      async (override) => {
        fetchMock.mockResolvedValue(
          jsonResponse({
            ...baseResponse,
            ...override,
          })
        );

        await expect(
          adapter.getPayment(PAYMENT_ID)
        ).rejects.toMatchObject({
          code: 'GATEWAY_INVALID_RESPONSE',
        });
      }
    );

    it('should reject malformed JSON', async () => {
      fetchMock.mockResolvedValue(
        new Response('invalid json', {
          status: 200,
        })
      );

      await expect(
        adapter.getPayment(PAYMENT_ID)
      ).rejects.toMatchObject({
        code: 'GATEWAY_INVALID_RESPONSE',
      });
    });
  });

  describe('error handling', () => {
    it('should reject requests without an API token', async () => {
      const unconfiguredAdapter = new JuntosSeFazAdapter(
        BASE_URL,
        '',
        1000
      );

      await expect(
        unconfiguredAdapter.getPayment(PAYMENT_ID)
      ).rejects.toMatchObject({
        statusCode: 503,
        code: 'GATEWAY_NOT_CONFIGURED',
      });

      expect(fetchMock).not.toHaveBeenCalled();
    });

    it.each([
      [401, 502, 'GATEWAY_AUTH_ERROR'],
      [403, 502, 'GATEWAY_AUTH_ERROR'],
      [429, 503, 'GATEWAY_RATE_LIMIT'],
      [503, 503, 'GATEWAY_UNAVAILABLE'],
      [500, 502, 'GATEWAY_REQUEST_ERROR'],
      [422, 502, 'GATEWAY_REQUEST_ERROR'],
    ] as const)(
      'should handle HTTP %s correctly',
      async (httpStatus, statusCode, code) => {
        fetchMock.mockResolvedValue(
          jsonResponse({}, httpStatus)
        );

        await expect(
          adapter.getPayment(PAYMENT_ID)
        ).rejects.toMatchObject({
          statusCode,
          code,
        });
      }
    );

    it('should handle network failures', async () => {
      fetchMock.mockRejectedValue(
        new TypeError('Network failure')
      );

      await expect(
        adapter.getPayment(PAYMENT_ID)
      ).rejects.toMatchObject({
        statusCode: 502,
        code: 'GATEWAY_CONNECTION_ERROR',
      });
    });

    it('should handle request timeouts', async () => {
      const timeoutAdapter = new JuntosSeFazAdapter(
        BASE_URL,
        API_TOKEN,
        10
      );

      fetchMock.mockImplementation(
        async (_input, options) => {
          return new Promise<Response>((_resolve, reject) => {
            const signal = options?.signal;

            if (!signal) {
              reject(new Error('Missing abort signal'));
              return;
            }

            if (signal.aborted) {
              reject(signal.reason);
              return;
            }

            signal.addEventListener(
              'abort',
              () => reject(signal.reason),
              { once: true }
            );
          });
        }
      );

      await expect(
        timeoutAdapter.getPayment(PAYMENT_ID)
      ).rejects.toMatchObject({
        statusCode: 504,
        code: 'GATEWAY_TIMEOUT',
      });
    });

    it('should not automatically retry payment creation', async () => {
      fetchMock.mockRejectedValue(
        new TypeError('Network failure')
      );

      await expect(
        adapter.createPayment(paymentInput)
      ).rejects.toMatchObject({
        code: 'GATEWAY_CONNECTION_ERROR',
      });

      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
  });
});