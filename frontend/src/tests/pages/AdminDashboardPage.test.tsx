import {
  afterEach,
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

import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';

import { AdminDashboardPage } from '../../pages/AdminDashboardPage';
import { adminService } from '../../features/admin/admin.service';

import type { AdminGateway } from '../../types/admin';

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    isAdmin: true,
  }),
}));

vi.mock('../../features/admin/admin.service', () => ({
  adminService: {
    getGateways: vi.fn(),
    updateGatewayStatus: vi.fn(),
  },
}));

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

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AdminDashboardPage />
    </QueryClientProvider>,
  );
}

describe('AdminDashboardPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    vi.mocked(
      adminService.getGateways,
    ).mockResolvedValue({
      gateways: [gateway],
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should display the administrative dashboard', async () => {
    renderPage();

    expect(
      screen.getByRole('heading', {
        name: 'Painel administrativo',
      }),
    ).toBeInTheDocument();

    expect(
      await screen.findByText('Juntos Se Faz'),
    ).toBeInTheDocument();
  });

  it('should display the sandbox notice', () => {
    renderPage();

    expect(
      screen.getByText('Ambiente sandbox'),
    ).toBeInTheDocument();
  });

  it('should display administrative statistics', async () => {
    renderPage();

    expect(
      await screen.findByText('Gateways cadastrados'),
    ).toBeInTheDocument();

    expect(
      screen.getByText('Gateways ativos'),
    ).toBeInTheDocument();

    expect(
      screen.getByText('Gateways inativos'),
    ).toBeInTheDocument();

    expect(
      screen.getByText('Integrações implementadas'),
    ).toBeInTheDocument();
  });

  it('should display a loading state', () => {
    vi.mocked(
      adminService.getGateways,
    ).mockImplementation(
      () => new Promise(() => {}),
    );

    renderPage();

    expect(
      screen.getByRole('status', {
        name: 'Carregando painel administrativo',
      }),
    ).toBeInTheDocument();
  });

  it('should display an error when loading fails', async () => {
    vi.mocked(
      adminService.getGateways,
    ).mockRejectedValue(
      new Error('Network error'),
    );

    renderPage();

    expect(
      await screen.findByText(
        'Não foi possível carregar os gateways',
      ),
    ).toBeInTheDocument();
  });

  it('should recover after retrying a failed request', async () => {
    const user = userEvent.setup();

    vi.mocked(adminService.getGateways)
      .mockRejectedValueOnce(
        new Error('Network error'),
      )
      .mockResolvedValue({
        gateways: [gateway],
      });

    renderPage();

    await user.click(
      await screen.findByRole('button', {
        name: /tentar novamente/i,
      }),
    );

    expect(
      await screen.findByText('Juntos Se Faz'),
    ).toBeInTheDocument();
  });

  it('should display an empty state', async () => {
    vi.mocked(
      adminService.getGateways,
    ).mockResolvedValue({
      gateways: [],
    });

    renderPage();

    expect(
      await screen.findByText(
        'Nenhum gateway cadastrado',
      ),
    ).toBeInTheDocument();
  });

  it('should warn when no gateway is active', async () => {
    vi.mocked(
      adminService.getGateways,
    ).mockResolvedValue({
      gateways: [
        {
          ...gateway,
          isActive: false,
        },
      ],
    });

    renderPage();

    expect(
      await screen.findByText(
        'Nenhum gateway ativo',
      ),
    ).toBeInTheDocument();
  });

  it('should not display the warning when a gateway is active', async () => {
    renderPage();

    await screen.findByText('Juntos Se Faz');

    expect(
      screen.queryByText('Nenhum gateway ativo'),
    ).not.toBeInTheDocument();
  });

  it('should cancel a status update when confirmation is rejected', async () => {
    const user = userEvent.setup();

    const confirm = vi
      .spyOn(window, 'confirm')
      .mockReturnValue(false);

    renderPage();

    await user.click(
      await screen.findByRole('button', {
        name: /^desativar gateway$/i,
      }),
    );

    expect(confirm).toHaveBeenCalledTimes(1);

    expect(
      adminService.updateGatewayStatus,
    ).not.toHaveBeenCalled();

    expect(
      screen.getByText(/^ativo$/i),
    ).toBeInTheDocument();
  });

  it('should deactivate a gateway after confirmation', async () => {
    const user = userEvent.setup();

    vi.spyOn(window, 'confirm')
      .mockReturnValue(true);

    const updatedGateway = {
      ...gateway,
      isActive: false,
    };

    vi.mocked(adminService.getGateways)
      .mockResolvedValueOnce({
        gateways: [gateway],
      })
      .mockResolvedValue({
        gateways: [updatedGateway],
      });

    vi.mocked(
      adminService.updateGatewayStatus,
    ).mockResolvedValue({
      gateway: updatedGateway,
    });

    renderPage();

    await user.click(
      await screen.findByRole('button', {
        name: /^desativar gateway$/i,
      }),
    );

    await waitFor(() => {
      expect(
        adminService.updateGatewayStatus,
      ).toHaveBeenCalledWith(
        gateway.id,
        {
          isActive: false,
        },
      );
    });

    expect(
      await screen.findByText(
        'Juntos Se Faz desativado com sucesso.',
      ),
    ).toBeInTheDocument();

    expect(
      await screen.findByText(
        'Nenhum gateway ativo',
      ),
    ).toBeInTheDocument();
  });

  it('should activate a gateway after confirmation', async () => {
    const user = userEvent.setup();

    vi.spyOn(window, 'confirm')
      .mockReturnValue(true);

    vi.mocked(adminService.getGateways)
      .mockResolvedValueOnce({
        gateways: [
          {
            ...gateway,
            isActive: false,
          },
        ],
      })
      .mockResolvedValue({
        gateways: [gateway],
      });

    vi.mocked(
      adminService.updateGatewayStatus,
    ).mockResolvedValue({
      gateway,
    });

    renderPage();

    await user.click(
      await screen.findByRole('button', {
        name: /^ativar gateway$/i,
      }),
    );

    await waitFor(() => {
      expect(
        adminService.updateGatewayStatus,
      ).toHaveBeenCalledWith(
        gateway.id,
        {
          isActive: true,
        },
      );
    });

    expect(
      await screen.findByText(
        'Juntos Se Faz ativado com sucesso.',
      ),
    ).toBeInTheDocument();

    expect(
      screen.queryByText('Nenhum gateway ativo'),
    ).not.toBeInTheDocument();
  });

  it('should display an error when a status update fails', async () => {
    const user = userEvent.setup();

    vi.spyOn(window, 'confirm')
      .mockReturnValue(true);

    vi.mocked(
      adminService.updateGatewayStatus,
    ).mockRejectedValue(
      new Error('Update failed'),
    );

    renderPage();

    await user.click(
      await screen.findByRole('button', {
        name: /^desativar gateway$/i,
      }),
    );

    expect(
      await screen.findByText(
        'Não foi possível atualizar o gateway.',
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/^ativo$/i),
    ).toBeInTheDocument();
  });

  it('should refresh the gateway list', async () => {
    const user = userEvent.setup();

    renderPage();

    await screen.findByText('Juntos Se Faz');

    await user.click(
      screen.getByRole('button', {
        name: /^atualizar$/i,
      }),
    );

    await waitFor(() => {
      expect(
        adminService.getGateways,
      ).toHaveBeenCalledTimes(2);
    });
  });
});