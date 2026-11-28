import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  render,
  screen,
  waitFor,
} from '@testing-library/react';

import userEvent from '@testing-library/user-event';

import { MemoryRouter } from 'react-router-dom';

import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';

import { CheckoutPage } from '../../../pages/CheckoutPage';

import { checkoutService } from '../../../features/checkout/checkout.service';

import { useCart } from '../../../hooks/useCart';

import type { Order } from '../../../types/order';

import type { Payment } from '../../../types/payment';

vi.mock(
  '../../../features/checkout/checkout.service',
  () => ({
    checkoutService: {
      getGateways: vi.fn(),
      createOrder: vi.fn(),
      createPayment: vi.fn(),
      getPayment: vi.fn(),
      simulatePayment: vi.fn(),
      getGatewayStatus: vi.fn(),
      getOrder: vi.fn(),
    },
  }),
);

vi.mock('../../../hooks/useCart', () => ({
  useCart: vi.fn(),
}));

const gameId = '11111111-1111-4111-8111-111111111111';

const cartItem = {
  gameId,
  title: 'Cyberpunk 2077',
  slug: 'cyberpunk-2077',
  imageUrl: '/images/cyberpunk.webp',
  accentColor: '#FCEE09',
  price: 14990,
};

const order: Order = {
  id: 'order-test-001',
  status: 'PENDING',
  totalAmount: 15990,
  currency: 'BRL',
  createdAt: '2026-11-28T14:00:00.000Z',
  updatedAt: '2026-11-28T14:00:00.000Z',

  items: [
    {
      id: 'order-item-001',
      unitPrice: 15990,
      game: {
        id: gameId,
        title: cartItem.title,
        slug: cartItem.slug,
        imageUrl: cartItem.imageUrl,
        accentColor: cartItem.accentColor,
      },
    },
  ],

  payments: [],
};

const payment: Payment = {
  id: 'payment-test-001',
  externalId: 'payments_test_001',
  orderId: order.id,
  amount: order.totalAmount,
  currency: 'BRL',
  status: 'PENDING',
  paymentMethod: 'pix',
  failureReason: null,
  pixCode: 'SIMULATED_PIX_NOT_PAYABLE',
  simulated: true,
  paidAt: null,
  createdAt: '2026-11-28T14:00:00.000Z',
  updatedAt: '2026-11-28T14:00:00.000Z',

  gateway: {
    id: 'gateway-test-001',
    name: 'Juntos Se Faz',
    code: 'juntos-se-faz',
  },
};

const removeItem = vi.fn();

const cart = {
  items: [cartItem],
  subtotal: cartItem.price,
  itemCount: 1,
  addItem: vi.fn(),
  removeItem,
  hasItem: vi.fn(),
  clearCart: vi.fn(),
};

function renderCheckout(
  initialPath = '/checkout',
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Infinity,
      },
      mutations: {
        retry: false,
      },
    },
  });

  const user = userEvent.setup();

  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialPath]}>
        <CheckoutPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );

  return { user };
}

async function confirmOrder(
  user: ReturnType<typeof userEvent.setup>,
) {
  const button = await screen.findByRole('button', {
    name: 'Confirmar pedido',
  });

  await waitFor(() => {
    expect(button).toBeEnabled();
  });

  await user.click(button);

  return screen.findByRole('button', {
    name: 'Gerar pagamento PIX',
  });
}

async function generatePayment(
  user: ReturnType<typeof userEvent.setup>,
) {
  const button = await confirmOrder(user);

  await user.click(button);

  await screen.findByRole('heading', {
    name: 'Pagamento via PIX',
  });
}

beforeEach(() => {
  vi.resetAllMocks();

  vi.mocked(useCart).mockReturnValue(cart);

  vi.mocked(
    checkoutService.getGateways,
  ).mockResolvedValue({
    gateways: [
      {
        code: 'juntos-se-faz',
        name: 'Juntos Se Faz',
        description: 'Gateway sandbox',
      },
    ],
  });

  vi.mocked(
    checkoutService.createOrder,
  ).mockResolvedValue({ order });

  vi.mocked(
    checkoutService.createPayment,
  ).mockResolvedValue({ payment });

  vi.mocked(
    checkoutService.getPayment,
  ).mockResolvedValue({ payment });

  vi.mocked(
    checkoutService.getOrder,
  ).mockResolvedValue({ order });
});

describe('CheckoutPage', () => {
  it('should display the empty cart state', () => {
    vi.mocked(useCart).mockReturnValue({
      ...cart,
      items: [],
      itemCount: 0,
      subtotal: 0,
    });

    renderCheckout();

    expect(
      screen.getByRole('heading', {
        name: 'Seu carrinho está vazio',
      }),
    ).toBeInTheDocument();
  });

  it('should display the available gateway', async () => {
    renderCheckout();

    expect(
      await screen.findByRole('radio', {
        name: /juntos se faz/i,
      }),
    ).toBeChecked();
  });

  it('should prevent checkout without available gateways', async () => {
    vi.mocked(
      checkoutService.getGateways,
    ).mockResolvedValue({
      gateways: [],
    });

    renderCheckout();

    expect(
      await screen.findByRole('alert'),
    ).toHaveTextContent(
      /nenhum gateway de pagamento disponível/i,
    );

    expect(
      screen.getByRole('button', {
        name: 'Confirmar pedido',
      }),
    ).toBeDisabled();
  });

  it('should create an order using only game identifiers', async () => {
    const { user } = renderCheckout();

    await confirmOrder(user);

    expect(
      checkoutService.createOrder,
    ).toHaveBeenCalledExactlyOnceWith({
      gameIds: [gameId],
    });

    expect(
      checkoutService.createPayment,
    ).not.toHaveBeenCalled();
  });

  it('should display server-confirmed prices before payment', async () => {
    const { user } = renderCheckout();

    await confirmOrder(user);

    expect(
      screen.getAllByText(/159,90/).length,
    ).toBeGreaterThan(0);

    expect(
      screen.getByText(
        /valores confirmados pelo servidor/i,
      ),
    ).toBeInTheDocument();

    expect(
      screen.queryByText(/149,90/),
    ).not.toBeInTheDocument();
  });

  it('should generate a PIX payment with an idempotency key', async () => {
    const { user } = renderCheckout();

    await generatePayment(user);

    expect(
      checkoutService.createPayment,
    ).toHaveBeenCalledExactlyOnceWith(
      order.id,
      {
        gatewayCode: 'juntos-se-faz',
        method: 'pix',
        idempotencyKey: expect.stringMatching(
          /^[0-9a-f-]{36}$/i,
        ),
      },
    );

    expect(
      screen.getByLabelText('PIX copia e cola'),
    ).toHaveValue(payment.pixCode);
  });

  it('should reuse the idempotency key after a failed request', async () => {
    vi.mocked(
      checkoutService.createPayment,
    ).mockRejectedValueOnce(
      new Error('Temporary connection failure'),
    );

    const { user } = renderCheckout();

    const button = await confirmOrder(user);

    await user.click(button);

    await screen.findByRole('alert');

    await user.click(
      screen.getByRole('button', {
        name: 'Gerar pagamento PIX',
      }),
    );

    await screen.findByRole('heading', {
      name: 'Pagamento via PIX',
    });

    const calls = vi.mocked(
      checkoutService.createPayment,
    ).mock.calls;

    expect(calls).toHaveLength(2);

    expect(calls[0]?.[1].idempotencyKey).toBe(
      calls[1]?.[1].idempotencyKey,
    );

    expect(
      checkoutService.createOrder,
    ).toHaveBeenCalledTimes(1);
  });

  it('should prevent duplicate order submissions', async () => {
    let resolveOrder!: (
      value: { order: Order },
    ) => void;

    vi.mocked(
      checkoutService.createOrder,
    ).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveOrder = resolve;
        }),
    );

    const { user } = renderCheckout();

    const button = await screen.findByRole('button', {
      name: 'Confirmar pedido',
    });

    await waitFor(() => {
      expect(button).toBeEnabled();
    });

    await user.dblClick(button);

    expect(
      checkoutService.createOrder,
    ).toHaveBeenCalledTimes(1);

    resolveOrder({ order });

    await screen.findByRole('button', {
      name: 'Gerar pagamento PIX',
    });
  });

  it('should remove purchased games after approval', async () => {
    vi.mocked(
      checkoutService.simulatePayment,
    ).mockResolvedValue({
      payment: {
        ...payment,
        status: 'APPROVED',
        paidAt: '2026-11-28T14:05:00.000Z',
      },
    });

    const { user } = renderCheckout();

    await generatePayment(user);

    await user.click(
      screen.getByRole('button', {
        name: 'Simular aprovação',
      }),
    );

    expect(
      await screen.findByRole('heading', {
        name: 'Compra realizada com sucesso!',
      }),
    ).toBeInTheDocument();

    expect(
      checkoutService.simulatePayment,
    ).toHaveBeenCalledExactlyOnceWith(
      payment.id,
      'approve',
    );

    expect(removeItem).toHaveBeenCalledExactlyOnceWith(
      gameId,
    );
  });

  it('should preserve the cart after payment decline', async () => {
    vi.mocked(
      checkoutService.simulatePayment,
    ).mockResolvedValue({
      payment: {
        ...payment,
        status: 'FAILED',
        failureReason: 'PAYMENT_DECLINED',
      },
    });

    const { user } = renderCheckout();

    await generatePayment(user);

    await user.click(
      screen.getByRole('button', {
        name: 'Simular recusa',
      }),
    );

    expect(
      await screen.findByRole('heading', {
        name: 'Pagamento não concluído',
      }),
    ).toBeInTheDocument();

    expect(removeItem).not.toHaveBeenCalled();
  });

  it('should preserve the cart after payment cancellation', async () => {
    vi.mocked(
      checkoutService.simulatePayment,
    ).mockResolvedValue({
      payment: {
        ...payment,
        status: 'CANCELLED',
      },
    });

    const { user } = renderCheckout();

    await generatePayment(user);

    await user.click(
      screen.getByRole('button', {
        name: 'Cancelar pagamento',
      }),
    );

    expect(
      await screen.findByRole('heading', {
        name: 'Pagamento cancelado',
      }),
    ).toBeInTheDocument();

    expect(removeItem).not.toHaveBeenCalled();
  });

  it('should display order creation errors', async () => {
    vi.mocked(
      checkoutService.createOrder,
    ).mockRejectedValueOnce(
      new Error('Order creation failed'),
    );

    const { user } = renderCheckout();

    const button = await screen.findByRole('button', {
      name: 'Confirmar pedido',
    });

    await waitFor(() => {
      expect(button).toBeEnabled();
    });

    await user.click(button);

    expect(
      await screen.findByRole('alert'),
    ).toBeInTheDocument();

    expect(
      checkoutService.createPayment,
    ).not.toHaveBeenCalled();

    expect(removeItem).not.toHaveBeenCalled();
  });
  it('should query the external payment gateway', async () => {
  vi.mocked(
    checkoutService.getGatewayStatus,
  ).mockResolvedValue({
    status: {
      paymentId: payment.id,
      externalId: payment.externalId!,
      gatewayCode: 'juntos-se-faz',
      localStatus: 'PENDING',
      gatewayStatus: 'pending',
      simulated: true,
      checkedAt: '2026-11-28T14:10:00.000Z',
    },
  });

  const { user } = renderCheckout();

  await generatePayment(user);

  await user.click(
    screen.getByRole('button', {
      name: 'Consultar status no gateway',
    }),
  );

  expect(
    await screen.findByText('Status no gateway'),
  ).toBeInTheDocument();

  expect(
    checkoutService.getGatewayStatus,
  ).toHaveBeenCalledExactlyOnceWith(payment.id);

  expect(
    screen.getByText(payment.externalId!),
  ).toBeInTheDocument();
});

it('should preserve approved payments when the gateway returns pending', async () => {
  vi.mocked(
    checkoutService.simulatePayment,
  ).mockResolvedValue({
    payment: {
      ...payment,
      status: 'APPROVED',
      paidAt: '2026-11-28T14:05:00.000Z',
    },
  });

  vi.mocked(
    checkoutService.getGatewayStatus,
  ).mockResolvedValue({
    status: {
      paymentId: payment.id,
      externalId: payment.externalId!,
      gatewayCode: 'juntos-se-faz',
      localStatus: 'APPROVED',
      gatewayStatus: 'pending',
      simulated: true,
      checkedAt: '2026-11-28T14:10:00.000Z',
    },
  });

  const { user } = renderCheckout();

  await generatePayment(user);

  await user.click(
    screen.getByRole('button', {
      name: 'Simular aprovação',
    }),
  );

  await screen.findByRole('heading', {
    name: 'Compra realizada com sucesso!',
  });

  await user.click(
    screen.getByRole('button', {
      name: 'Consultar status no gateway',
    }),
  );

  expect(
    await screen.findByText('Status no gateway'),
  ).toBeInTheDocument();

  expect(
    screen.getByText('APPROVED'),
  ).toBeInTheDocument();

  expect(
    screen.getByText('PENDING'),
  ).toBeInTheDocument();

  expect(
    screen.getByRole('heading', {
      name: 'Compra realizada com sucesso!',
    }),
  ).toBeInTheDocument();

    expect(removeItem).toHaveBeenCalledExactlyOnceWith(
    gameId,
  );
});

it('should restore an existing order from the URL', async () => {
  renderCheckout(
    `/checkout?orderId=${order.id}`,
  );

  expect(
    await screen.findByRole('button', {
      name: 'Gerar pagamento PIX',
    }),
  ).toBeInTheDocument();

  expect(
    checkoutService.getOrder,
  ).toHaveBeenCalledWith(
    order.id,
    expect.anything(),
  );

  expect(
    checkoutService.createOrder,
  ).not.toHaveBeenCalled();
});

it('should restore an existing pending payment', async () => {
  vi.mocked(
    checkoutService.getOrder,
  ).mockResolvedValue({
    order: {
      ...order,
      payments: [payment],
    },
  });

  renderCheckout(
    `/checkout?orderId=${order.id}`,
  );

  expect(
    await screen.findByRole('heading', {
      name: 'Pagamento via PIX',
    }),
  ).toBeInTheDocument();

  expect(
    screen.getByLabelText('PIX copia e cola'),
  ).toHaveValue(payment.pixCode);

  expect(
    checkoutService.createOrder,
  ).not.toHaveBeenCalled();

  expect(
    checkoutService.createPayment,
  ).not.toHaveBeenCalled();
});

it('should restore an approved purchase with an empty cart', async () => {
  const approvedPayment: Payment = {
    ...payment,
    status: 'APPROVED',
    paidAt: '2026-11-28T14:05:00.000Z',
  };

  vi.mocked(useCart).mockReturnValue({
    ...cart,
    items: [],
    subtotal: 0,
    itemCount: 0,
  });

  vi.mocked(
    checkoutService.getOrder,
  ).mockResolvedValue({
    order: {
      ...order,
      status: 'PAID',
      payments: [approvedPayment],
    },
  });

  vi.mocked(
    checkoutService.getPayment,
  ).mockResolvedValue({
    payment: approvedPayment,
  });

  renderCheckout(
    `/checkout?orderId=${order.id}`,
  );

  expect(
    await screen.findByRole('heading', {
      name: 'Compra realizada com sucesso!',
    }),
  ).toBeInTheDocument();

  expect(
    checkoutService.createOrder,
  ).not.toHaveBeenCalled();

  expect(
    checkoutService.createPayment,
  ).not.toHaveBeenCalled();
});

  it('should display an error when an order cannot be restored', async () => {
    vi.mocked(
      checkoutService.getOrder,
    ).mockRejectedValue(
      new Error('Order not found'),
    );

    renderCheckout(
      '/checkout?orderId=invalid-order',
    );

    expect(
      await screen.findByRole('heading', {
        name: 'Não foi possível recuperar o pedido',
      }),
    ).toBeInTheDocument();

    expect(
      checkoutService.createOrder,
    ).not.toHaveBeenCalled();

    expect(
      checkoutService.createPayment,
    ).not.toHaveBeenCalled();
  });
});
