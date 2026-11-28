import { describe, expect, it } from 'vitest';

import { render, screen } from '@testing-library/react';

import { MemoryRouter } from 'react-router-dom';

import { PaymentResult } from '../../../features/checkout/components/PaymentResult';

import type { Payment } from '../../../types/payment';

const basePayment: Payment = {
  id: 'payment-test-001',
  externalId: 'payments_test_001',
  orderId: 'order-test-001',
  amount: 14990,
  currency: 'BRL',
  status: 'APPROVED',
  paymentMethod: 'pix',
  failureReason: null,
  pixCode: 'SIMULATED_PIX_NOT_PAYABLE',
  simulated: true,
  paidAt: '2026-11-28T14:00:00.000Z',
  createdAt: '2026-11-28T13:59:00.000Z',
  updatedAt: '2026-11-28T14:00:00.000Z',

  gateway: {
    id: 'gateway-test-001',
    name: 'Juntos Se Faz',
    code: 'juntos-se-faz',
  },
};

function renderResult(
  overrides: Partial<Payment> = {},
) {
  const payment = {
    ...basePayment,
    ...overrides,
  };

  return render(
    <MemoryRouter>
      <PaymentResult payment={payment} />
    </MemoryRouter>,
  );
}

describe('PaymentResult', () => {
  it('should display successful purchase message', () => {
    renderResult();

    expect(
      screen.getByRole('heading', {
        name: 'Compra realizada com sucesso!',
      }),
    ).toBeInTheDocument();
  });

  it('should provide access to the library', () => {
    renderResult();

    expect(
      screen.getByRole('link', {
        name: /acessar minha biblioteca/i,
      }),
    ).toHaveAttribute('href', '/library');
  });

  it('should display the payment amount', () => {
    renderResult();

    expect(
      screen.getByText(/149,90/),
    ).toBeInTheDocument();
  });

  it('should display the gateway name', () => {
    renderResult();

    expect(
      screen.getByText('Juntos Se Faz'),
    ).toBeInTheDocument();
  });

  it('should display the transaction identifier', () => {
    renderResult();

    expect(
      screen.getByText(basePayment.id),
    ).toBeInTheDocument();
  });

  it('should display the payment method', () => {
    renderResult();

    expect(
      screen.getByText('PIX'),
    ).toBeInTheDocument();
  });

  it('should identify the sandbox environment', () => {
    renderResult();

    expect(
      screen.getByText('Sandbox'),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/nenhum valor real foi cobrado/i),
    ).toBeInTheDocument();
  });

  it('should display the confirmation date', () => {
    renderResult();

    expect(
      screen.getByText('Confirmado em'),
    ).toBeInTheDocument();
  });

  it('should display a declined payment message', () => {
    renderResult({
      status: 'FAILED',
      failureReason: 'PAYMENT_DECLINED',
      paidAt: null,
    });

    expect(
      screen.getByRole('heading', {
        name: 'Pagamento não concluído',
      }),
    ).toBeInTheDocument();
  });

  it('should allow returning to the cart after failure', () => {
    renderResult({
      status: 'FAILED',
      paidAt: null,
    });

    expect(
      screen.getByRole('link', {
        name: /voltar ao carrinho/i,
      }),
    ).toHaveAttribute('href', '/cart');
  });

  it('should display a cancelled payment message', () => {
    renderResult({
      status: 'CANCELLED',
      paidAt: null,
    });

    expect(
      screen.getByRole('heading', {
        name: 'Pagamento cancelado',
      }),
    ).toBeInTheDocument();
  });

  it.each(['FAILED', 'CANCELLED'] as const)(
    'should not provide library access for %s payments',
    (status) => {
      renderResult({
        status,
        paidAt: null,
      });

      expect(
        screen.queryByRole('link', {
          name: /acessar minha biblioteca/i,
        }),
      ).not.toBeInTheDocument();
    },
  );

  it('should not display confirmation date for unpaid transactions', () => {
    renderResult({
      status: 'FAILED',
      paidAt: null,
    });

    expect(
      screen.queryByText('Confirmado em'),
    ).not.toBeInTheDocument();
  });

  it('should allow returning to the store', () => {
    renderResult();

    expect(
      screen.getByRole('link', {
        name: /continuar explorando a loja/i,
      }),
    ).toHaveAttribute('href', '/');
  });
});