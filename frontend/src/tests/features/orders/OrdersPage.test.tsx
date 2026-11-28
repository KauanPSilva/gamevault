import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';

import {
  render,
  screen,
  within,
} from '@testing-library/react';

import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { OrdersPage } from '../../../pages/OrdersPage';
import { checkoutService } from '../../../features/checkout/checkout.service';
import { formatCurrency } from '../../../utils/currency';

import type {
  Order,
  OrdersResponse,
} from '../../../types/order';

vi.mock(
  '../../../features/checkout/checkout.service',
  () => ({
    checkoutService: {
      getOrders: vi.fn(),
    },
  }),
);

const paidOrder: Order = {
  id: '11111111-1111-4111-8111-111111111111',
  status: 'PAID',
  totalAmount: 14990,
  currency: 'BRL',
  createdAt: '2026-11-28T12:00:00.000Z',
  updatedAt: '2026-11-28T12:05:00.000Z',
  items: [
    {
      id: 'order-item-1',
      unitPrice: 14990,
      game: {
        id: 'game-1',
        title: 'Cyberpunk 2077',
        slug: 'cyberpunk-2077',
        imageUrl: '/images/cyberpunk.webp',
        accentColor: '#FCEE09',
      },
    },
  ],
  payments: [
    {
      id: 'payment-1',
      status: 'APPROVED',
      amount: 14990,
      currency: 'BRL',
      paymentMethod: 'pix',
      paidAt: '2026-11-28T12:05:00.000Z',
      createdAt: '2026-11-28T12:00:00.000Z',
      gateway: {
        name: 'Juntos Se Faz',
        code: 'juntos-se-faz',
      },
    },
  ],
};

const pendingOrder: Order = {
  ...paidOrder,
  id: '22222222-2222-4222-8222-222222222222',
  status: 'PENDING',
  totalAmount: 29990,
  items: [
    {
      id: 'order-item-2',
      unitPrice: 29990,
      game: {
        id: 'game-2',
        title: 'Battlefield 6',
        slug: 'battlefield-6',
        imageUrl: '/images/battlefield.webp',
        accentColor: '#2DD4BF',
      },
    },
  ],
  payments: [],
};

const cancelledOrder: Order = {
  ...pendingOrder,
  id: '33333333-3333-4333-8333-333333333333',
  status: 'CANCELLED',
};

const failedOrder: Order = {
  ...pendingOrder,
  id: '44444444-4444-4444-8444-444444444444',
  status: 'FAILED',
};

const ordersResponse: OrdersResponse = {
  orders: [paidOrder, pendingOrder],
  pagination: {
    page: 1,
    limit: 10,
    total: 2,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  },
};

function renderOrders() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Infinity,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <OrdersPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('OrdersPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    vi.mocked(checkoutService.getOrders)
      .mockResolvedValue(ordersResponse);
  });

  it('should display the orders heading', async () => {
    renderOrders();

    expect(
      screen.getByRole('heading', {
        name: 'Meus pedidos',
      }),
    ).toBeInTheDocument();

    await screen.findByText('Cyberpunk 2077');
  });

  it('should display the loading state', async () => {
    renderOrders();

    expect(
      screen.getByRole('status', {
        name: 'Carregando pedidos',
      }),
    ).toBeInTheDocument();

    await screen.findByText('Cyberpunk 2077');
  });

  it('should display customer orders', async () => {
    renderOrders();

    expect(
      await screen.findByText('Cyberpunk 2077'),
    ).toBeInTheDocument();

    expect(
      screen.getByText('Battlefield 6'),
    ).toBeInTheDocument();

    expect(screen.getAllByRole('article')).toHaveLength(2);
  });

  it('should display the order identifier', async () => {
    renderOrders();

    expect(
      await screen.findByText('Pedido #11111111'),
    ).toBeInTheDocument();
  });

  it('should display the total number of orders', async () => {
    renderOrders();

    expect(
      await screen.findByText('2 pedidos encontrados'),
    ).toBeInTheDocument();
  });

  it('should display the original purchase price', async () => {
        renderOrders();

        await screen.findByText('Cyberpunk 2077');

        const card = screen.getAllByRole('article')[0]!;

        const expectedPrice = formatCurrency(14990)
            .replace(/\s+/g, ' ')
            .trim();

        expect(
            within(card).getAllByText(expectedPrice),
        ).toHaveLength(2);
    });

  it('should identify paid orders', async () => {
    renderOrders();

    expect(
      await screen.findByText('Pago'),
    ).toBeInTheDocument();
  });

  it('should identify pending orders', async () => {
    renderOrders();

    expect(
      await screen.findByText('Pendente'),
    ).toBeInTheDocument();
  });

  it('should identify cancelled orders', async () => {
    vi.mocked(checkoutService.getOrders)
      .mockResolvedValue({
        ...ordersResponse,
        orders: [cancelledOrder],
      });

    renderOrders();

    expect(
      await screen.findByText('Cancelado'),
    ).toBeInTheDocument();
  });

  it('should identify failed orders', async () => {
    vi.mocked(checkoutService.getOrders)
      .mockResolvedValue({
        ...ordersResponse,
        orders: [failedOrder],
      });

    renderOrders();

    expect(
      await screen.findByText('Não concluído'),
    ).toBeInTheDocument();
  });

  it('should display the payment gateway', async () => {
    renderOrders();

    expect(
      await screen.findByText('Juntos Se Faz'),
    ).toBeInTheDocument();

    expect(
      screen.getByText('PIX · Sandbox'),
    ).toBeInTheDocument();
  });

  it('should allow resuming a pending order', async () => {
    renderOrders();

    const link = await screen.findByRole('link', {
      name: 'Continuar pagamento',
    });

    expect(link).toHaveAttribute(
      'href',
      `/checkout?orderId=${pendingOrder.id}`,
    );
  });

  it('should provide library access for paid orders', async () => {
    renderOrders();

    const link = await screen.findByRole('link', {
      name: 'Acessar biblioteca',
    });

    expect(link).toHaveAttribute('href', '/library');
  });

  it('should not allow resuming completed orders', async () => {
    vi.mocked(checkoutService.getOrders)
      .mockResolvedValue({
        ...ordersResponse,
        orders: [
          paidOrder,
          cancelledOrder,
          failedOrder,
        ],
      });

    renderOrders();

    await screen.findByText('Pago');

    expect(
      screen.queryByRole('link', {
        name: 'Continuar pagamento',
      }),
    ).not.toBeInTheDocument();
  });

  it('should display an empty order history', async () => {
    vi.mocked(checkoutService.getOrders)
      .mockResolvedValue({
        orders: [],
        pagination: {
          ...ordersResponse.pagination,
          total: 0,
          totalPages: 0,
        },
      });

    renderOrders();

    expect(
      await screen.findByText('Nenhum pedido encontrado'),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('link', {
        name: 'Explorar loja',
      }),
    ).toHaveAttribute('href', '/');
  });

  it('should display an error when the request fails', async () => {
    vi.mocked(checkoutService.getOrders)
      .mockRejectedValue(new Error('Network error'));

    renderOrders();

    expect(
      await screen.findByText(
        'Não foi possível carregar seus pedidos',
      ),
    ).toBeInTheDocument();
  });

  it('should retry a failed request', async () => {
    const user = userEvent.setup();

    vi.mocked(checkoutService.getOrders)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(ordersResponse);

    renderOrders();

    await screen.findByText(
      'Não foi possível carregar seus pedidos',
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Tentar novamente',
      }),
    );

    expect(
      await screen.findByText('Cyberpunk 2077'),
    ).toBeInTheDocument();

    expect(
      checkoutService.getOrders,
    ).toHaveBeenCalledTimes(2);
  });

  it('should navigate between order history pages', async () => {
    const user = userEvent.setup();

    vi.mocked(checkoutService.getOrders)
      .mockImplementation(async (page = 1) => ({
        orders: page === 1
          ? [paidOrder]
          : [pendingOrder],
        pagination: {
          page,
          limit: 10,
          total: 11,
          totalPages: 2,
          hasNextPage: page === 1,
          hasPreviousPage: page === 2,
        },
      }));

    renderOrders();

    await screen.findByText('Cyberpunk 2077');

    expect(
      screen.getByRole('button', {
        name: 'Anterior',
      }),
    ).toBeDisabled();

    await user.click(
      screen.getByRole('button', {
        name: 'Próxima',
      }),
    );

    expect(
      await screen.findByText('Battlefield 6'),
    ).toBeInTheDocument();

    expect(
      screen.getByText('2 de 2'),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', {
        name: 'Próxima',
      }),
    ).toBeDisabled();

    await user.click(
      screen.getByRole('button', {
        name: 'Anterior',
      }),
    );

    expect(
      await screen.findByText('Cyberpunk 2077'),
    ).toBeInTheDocument();
  });
});