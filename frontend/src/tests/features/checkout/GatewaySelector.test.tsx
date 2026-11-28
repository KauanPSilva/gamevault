import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '@testing-library/react';

import userEvent from '@testing-library/user-event';

import { GatewaySelector } from '../../../features/checkout/components/GatewaySelector';

import type { PaymentGateway } from '../../../types/payment';

const juntosSeFaz: PaymentGateway = {
  code: 'juntos-se-faz',
  name: 'Juntos Se Faz',
  description: 'Gateway de pagamentos sandbox',
};

const mockGateway: PaymentGateway = {
  code: 'mock-gateway',
  name: 'Mock Gateway',
  description: 'Gateway fictício para testes',
};

function renderSelector(
  gateways: PaymentGateway[] = [
    juntosSeFaz,
    mockGateway,
  ],
  selectedCode = 'juntos-se-faz',
  disabled = false,
) {
  const onSelect = vi.fn();
  const user = userEvent.setup();

  render(
    <GatewaySelector
      gateways={gateways}
      selectedCode={selectedCode}
      onSelect={onSelect}
      disabled={disabled}
    />,
  );

  return {
    user,
    onSelect,
  };
}

describe('GatewaySelector', () => {
  it('should display the gateway selection heading', () => {
    renderSelector();

    expect(
      screen.getByText('Gateway de pagamento'),
    ).toBeInTheDocument();
  });

  it('should display all available gateways', () => {
    renderSelector();

    expect(
      screen.getByRole('radio', {
        name: /juntos se faz/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('radio', {
        name: /mock gateway/i,
      }),
    ).toBeInTheDocument();
  });

  it('should display gateway descriptions', () => {
    renderSelector();

    expect(
      screen.getByText(juntosSeFaz.description!),
    ).toBeInTheDocument();

    expect(
      screen.getByText(mockGateway.description!),
    ).toBeInTheDocument();
  });

  it('should mark the selected gateway as checked', () => {
    renderSelector();

    expect(
      screen.getByRole('radio', {
        name: /juntos se faz/i,
      }),
    ).toBeChecked();
  });

  it('should not check unselected gateways', () => {
    renderSelector();

    expect(
      screen.getByRole('radio', {
        name: /mock gateway/i,
      }),
    ).not.toBeChecked();
  });

  it('should request a gateway selection change', async () => {
    const { user, onSelect } = renderSelector();

    await user.click(
      screen.getByRole('radio', {
        name: /mock gateway/i,
      }),
    );

    expect(onSelect).toHaveBeenCalledExactlyOnceWith(
      'mock-gateway',
    );
  });

  it('should support a single available gateway', () => {
    renderSelector([juntosSeFaz]);

    expect(
      screen.getAllByRole('radio'),
    ).toHaveLength(1);

    expect(
      screen.getByRole('radio'),
    ).toBeChecked();
  });

  it('should display an alert when no gateways are available', () => {
    renderSelector([], '');

    expect(
      screen.getByRole('alert'),
    ).toHaveTextContent(
      /nenhum gateway de pagamento disponível/i,
    );

    expect(
      screen.queryByRole('radio'),
    ).not.toBeInTheDocument();
  });

  it('should disable gateway selection during processing', () => {
    renderSelector(
      [juntosSeFaz, mockGateway],
      'juntos-se-faz',
      true,
    );

    screen.getAllByRole('radio').forEach((radio) => {
      expect(radio).toBeDisabled();
    });
  });

  it('should prevent selection changes when disabled', async () => {
    const { user, onSelect } = renderSelector(
      [juntosSeFaz, mockGateway],
      'juntos-se-faz',
      true,
    );

    await user.click(
      screen.getByRole('radio', {
        name: /mock gateway/i,
      }),
    );

    expect(onSelect).not.toHaveBeenCalled();
  });

  it('should display a fallback description', () => {
    renderSelector([
      {
        ...juntosSeFaz,
        description: null,
      },
    ]);

    expect(
      screen.getByText('Provedor de pagamento'),
    ).toBeInTheDocument();
  });

  it('should identify the sandbox environment', () => {
    renderSelector();

    expect(
      screen.getByText(
        /ambiente sandbox — transações simuladas/i,
      ),
    ).toBeInTheDocument();
  });

  it('should support an empty initial selection', () => {
    renderSelector(
      [juntosSeFaz, mockGateway],
      '',
    );

    screen.getAllByRole('radio').forEach((radio) => {
      expect(radio).not.toBeChecked();
    });
  });
});