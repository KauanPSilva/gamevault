import {
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  render,
  screen,
} from '@testing-library/react';

import userEvent from '@testing-library/user-event';

import { AdminGatewayCard } from '../../features/admin/components/AdminGatewayCard';

import type { AdminGateway } from '../../types/admin';

const gateway: AdminGateway = {
  id: 'gateway-test-id',
  name: 'Juntos Se Faz',
  code: 'juntos-se-faz',
  description: 'Sandbox payment integration',
  isActive: true,
  isImplemented: true,
  environment: 'sandbox',
  createdAt: '2026-11-27T12:00:00.000Z',
  updatedAt: '2026-11-28T12:00:00.000Z',
};

function renderCard(
  overrides: Partial<AdminGateway> = {},
  options: {
    isUpdating?: boolean;
    disabled?: boolean;
  } = {},
) {
  const onToggle = vi.fn();

  const currentGateway = {
    ...gateway,
    ...overrides,
  };

  render(
    <AdminGatewayCard
      gateway={currentGateway}
      isUpdating={options.isUpdating ?? false}
      disabled={options.disabled ?? false}
      onToggle={onToggle}
    />,
  );

  return {
    onToggle,
    currentGateway,
  };
}

describe('AdminGatewayCard', () => {
  it('should display the gateway name', () => {
    renderCard();

    expect(
      screen.getByText('Juntos Se Faz'),
    ).toBeInTheDocument();
  });

  it('should display the gateway code', () => {
    renderCard();

    expect(
      screen.getByText('juntos-se-faz'),
    ).toBeInTheDocument();
  });

  it('should display the gateway description', () => {
    renderCard();

    expect(
      screen.getByText('Sandbox payment integration'),
    ).toBeInTheDocument();
  });

  it('should display the sandbox environment', () => {
    renderCard();

    expect(
      screen.getByText(/^sandbox$/i),
    ).toBeInTheDocument();
  });

  it('should display active status', () => {
    renderCard();

    expect(
      screen.getByText(/^ativo$/i),
    ).toBeInTheDocument();
  });

  it('should display inactive status', () => {
    renderCard({
      isActive: false,
    });

    expect(
      screen.getByText(/^inativo$/i),
    ).toBeInTheDocument();
  });

  it('should identify implemented integrations', () => {
    renderCard();

    expect(
      screen.getByText(/^implementada$/i),
    ).toBeInTheDocument();
  });

  it('should identify unsupported integrations', () => {
    renderCard({
      isActive: false,
      isImplemented: false,
    });

    expect(
      screen.getByText(/^não implementada$/i),
    ).toBeInTheDocument();
  });

  it('should display the deactivation action for active gateways', () => {
    renderCard();

    expect(
      screen.getByRole('button', {
        name: /^desativar gateway$/i,
      }),
    ).toBeEnabled();
  });

  it('should display the activation action for inactive gateways', () => {
    renderCard({
      isActive: false,
    });

    expect(
      screen.getByRole('button', {
        name: /^ativar gateway$/i,
      }),
    ).toBeEnabled();
  });

  it('should request gateway deactivation', async () => {
    const user = userEvent.setup();

    const {
      onToggle,
      currentGateway,
    } = renderCard();

    await user.click(
      screen.getByRole('button', {
        name: /^desativar gateway$/i,
      }),
    );

    expect(onToggle).toHaveBeenCalledTimes(1);

    expect(onToggle).toHaveBeenCalledWith(
      currentGateway,
    );
  });

  it('should request gateway activation', async () => {
    const user = userEvent.setup();

    const {
      onToggle,
      currentGateway,
    } = renderCard({
      isActive: false,
    });

    await user.click(
      screen.getByRole('button', {
        name: /^ativar gateway$/i,
      }),
    );

    expect(onToggle).toHaveBeenCalledTimes(1);

    expect(onToggle).toHaveBeenCalledWith(
      currentGateway,
    );
  });

  it('should prevent activation of unsupported gateways', async () => {
    const user = userEvent.setup();

    const { onToggle } = renderCard({
      isActive: false,
      isImplemented: false,
    });

    const button = screen.getByRole('button', {
      name: /^ativar gateway$/i,
    });

    expect(button).toBeDisabled();

    await user.click(button);

    expect(onToggle).not.toHaveBeenCalled();
  });

  it('should allow deactivation of an unsupported active gateway', () => {
    renderCard({
      isActive: true,
      isImplemented: false,
    });

    expect(
      screen.getByRole('button', {
        name: /^desativar gateway$/i,
      }),
    ).toBeEnabled();
  });

  it('should disable actions while updating', async () => {
    const user = userEvent.setup();

    const { onToggle } = renderCard(
      {},
      {
        isUpdating: true,
      },
    );

    const button = screen.getByRole('button', {
      name: /atualizando/i,
    });

    expect(button).toBeDisabled();

    await user.click(button);

    expect(onToggle).not.toHaveBeenCalled();
  });

  it('should disable actions when another operation is pending', async () => {
    const user = userEvent.setup();

    const { onToggle } = renderCard(
      {},
      {
        disabled: true,
      },
    );

    const button = screen.getByRole('button', {
      name: /^desativar gateway$/i,
    });

    expect(button).toBeDisabled();

    await user.click(button);

    expect(onToggle).not.toHaveBeenCalled();
  });
});