import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '@testing-library/react';

import userEvent from '@testing-library/user-event';

import { PixPayment } from '../../../features/checkout/components/PixPayment';

import type { Payment } from '../../../types/payment';

const basePayment: Payment = {
  id: 'payment-test-001',
  externalId: 'payments_test_001',
  orderId: 'order-test-001',
  amount: 14990,
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

function renderPayment(
  overrides: Partial<Payment> = {},
  isProcessing = false,
) {
  const onSimulate = vi.fn();
  const onRefresh = vi.fn();
  const user = userEvent.setup();

  render(
    <PixPayment
      payment={{
        ...basePayment,
        ...overrides,
      }}
      isProcessing={isProcessing}
      onSimulate={onSimulate}
      onRefresh={onRefresh}
    />,
  );

  return {
    user,
    onSimulate,
    onRefresh,
  };
}

describe('PixPayment', () => {
  it('should display the payment heading', () => {
    renderPayment();

    expect(
      screen.getByRole('heading', {
        name: 'Pagamento via PIX',
      }),
    ).toBeInTheDocument();
  });

  it('should display the gateway name', () => {
    renderPayment();

    expect(
      screen.getByText(/processado por juntos se faz/i),
    ).toBeInTheDocument();
  });

  it('should display the payment amount', () => {
    renderPayment();

    expect(
      screen.getByText(/149,90/),
    ).toBeInTheDocument();
  });

  it('should clearly identify simulated payments', () => {
    renderPayment();

    expect(
      screen.getByText('Pagamento simulado'),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /nenhum dinheiro real será movimentado/i,
      ),
    ).toBeInTheDocument();
  });

  it('should display the pending payment status', () => {
    renderPayment();

    expect(
      screen.getByText('Aguardando pagamento'),
    ).toBeInTheDocument();
  });

  it('should display the PIX code as read-only', () => {
    renderPayment();

    const input = screen.getByLabelText(
      'PIX copia e cola',
    );

    expect(input).toHaveValue(basePayment.pixCode);

    expect(input).toHaveAttribute('readonly');
  });

  it('should not display a missing PIX code', () => {
    renderPayment({
      pixCode: null,
    });

    expect(
      screen.queryByLabelText('PIX copia e cola'),
    ).not.toBeInTheDocument();
  });

  it('should request payment approval', async () => {
    const { user, onSimulate } = renderPayment();

    await user.click(
      screen.getByRole('button', {
        name: 'Simular aprovação',
      }),
    );

    expect(onSimulate).toHaveBeenCalledExactlyOnceWith(
      'approve',
    );
  });

  it('should request payment decline', async () => {
    const { user, onSimulate } = renderPayment();

    await user.click(
      screen.getByRole('button', {
        name: 'Simular recusa',
      }),
    );

    expect(onSimulate).toHaveBeenCalledExactlyOnceWith(
      'decline',
    );
  });

  it('should request payment cancellation', async () => {
    const { user, onSimulate } = renderPayment();

    await user.click(
      screen.getByRole('button', {
        name: 'Cancelar pagamento',
      }),
    );

    expect(onSimulate).toHaveBeenCalledExactlyOnceWith(
      'cancel',
    );
  });

  it('should request a payment status refresh', async () => {
    const { user, onRefresh } = renderPayment();

    await user.click(
      screen.getByRole('button', {
        name: 'Atualizar status',
      }),
    );

    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it('should copy the simulated PIX code', async () => {
    const { user } = renderPayment();

    const clipboardSpy = vi.spyOn(
      navigator.clipboard,
      'writeText',
    );

    try {
      await user.click(
        screen.getByRole('button', {
          name: 'Copiar código PIX',
        }),
      );

      expect(clipboardSpy).toHaveBeenCalledWith(
        basePayment.pixCode,
      );

      expect(
        screen.getByText('Código copiado!'),
      ).toBeInTheDocument();
    } finally {
      clipboardSpy.mockRestore();
    }
  });

  it('should display an error when copying fails', async () => {
    const { user } = renderPayment();

    const clipboardSpy = vi
      .spyOn(navigator.clipboard, 'writeText')
      .mockRejectedValueOnce(
        new Error('Clipboard unavailable'),
      );

    try {
      await user.click(
        screen.getByRole('button', {
          name: 'Copiar código PIX',
        }),
      );

      expect(
        screen.getByRole('alert'),
      ).toHaveTextContent(
        /não foi possível copiar automaticamente/i,
      );
    } finally {
      clipboardSpy.mockRestore();
    }
  });

  it.each([
    'Simular aprovação',
    'Simular recusa',
    'Cancelar pagamento',
    'Atualizar status',
  ])(
    'should disable %s during an active operation',
    async (buttonName) => {
      const { user, onSimulate, onRefresh } =
        renderPayment({}, true);

      const button = screen.getByRole('button', {
        name: buttonName,
      });

      expect(button).toBeDisabled();

      await user.click(button);

      expect(onSimulate).not.toHaveBeenCalled();
      expect(onRefresh).not.toHaveBeenCalled();
    },
  );

  it('should display the processing status', () => {
    renderPayment({
      status: 'PROCESSING',
    });

    expect(
      screen.getByText('Processamento em andamento'),
    ).toBeInTheDocument();
  });

  it('should prevent simulation for processing payments', () => {
    renderPayment({
      status: 'PROCESSING',
    });

    expect(
      screen.getByRole('button', {
        name: 'Simular aprovação',
      }),
    ).toBeDisabled();

    expect(
      screen.getByRole('button', {
        name: 'Simular recusa',
      }),
    ).toBeDisabled();

    expect(
      screen.getByRole('button', {
        name: 'Cancelar pagamento',
      }),
    ).toBeDisabled();
  });

  it('should prevent simulation without an external identifier', () => {
    renderPayment({
      externalId: null,
    });

    expect(
      screen.getByRole('button', {
        name: 'Simular aprovação',
      }),
    ).toBeDisabled();
  });

  it('should prevent simulation for non-sandbox payments', () => {
    renderPayment({
      simulated: false,
    });

    expect(
      screen.getByRole('button', {
        name: 'Simular aprovação',
      }),
    ).toBeDisabled();
  });
});