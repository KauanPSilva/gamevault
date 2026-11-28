import {
  describe,
  expect,
  it,
  vi,
  beforeEach,
} from 'vitest';

import {
  render,
  screen,
  waitFor,
} from '@testing-library/react';

import userEvent from '@testing-library/user-event';

import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthProvider';

import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';

import { CatalogSection } from '../../features/catalog/CatalogSection';
import { catalogService } from '../../features/catalog/catalog.service';

import {
  gtaGame,
  cyberpunkGame,
} from '../fixtures/games.fixture';

import type {
  Game,
  GamesResponse,
} from '../../types/game';

vi.mock('../../features/catalog/catalog.service', () => ({
  catalogService: {
    getGames: vi.fn(),
    getCategories: vi.fn(),
  },
}));

function createGamesResponse(
  games: Game[],
): GamesResponse {
  return {
    games,
    pagination: {
      page: 1,
      limit: 10,
      total: games.length,
      totalPages: games.length > 0 ? 1 : 0,
      hasNextPage: false,
      hasPreviousPage: false,
    },
  };
}

function renderCatalog() {
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
      <AuthProvider>
        <MemoryRouter>
          <CatalogSection />
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>,
  );
}

describe('CatalogSection', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    vi.mocked(
      catalogService.getCategories,
    ).mockResolvedValue({
      categories: [
        {
          ...gtaGame.category,
          gameCount: 1,
        },
        {
          ...cyberpunkGame.category,
          gameCount: 1,
        },
      ],
    });

    vi.mocked(
      catalogService.getGames,
    ).mockResolvedValue(
      createGamesResponse([
        gtaGame,
        cyberpunkGame,
      ]),
    );
  });

  it('should display the catalog heading', () => {
    renderCatalog();

    expect(
      screen.getByRole('heading', {
        name: 'Explore o catálogo',
      }),
    ).toBeInTheDocument();
  });

  it('should display games returned by the API', async () => {
    renderCatalog();

    expect(
      await screen.findByRole('heading', {
        name: gtaGame.title,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', {
        name: cyberpunkGame.title,
      }),
    ).toBeInTheDocument();
  });

  it('should display the total number of games', async () => {
    renderCatalog();

    expect(
      await screen.findByText('2 jogos encontrados'),
    ).toBeInTheDocument();
  });

  it('should request the first page with the default filters', async () => {
    renderCatalog();

    await waitFor(() => {
      expect(
        catalogService.getGames,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 10,
          sort: 'newest',
        }),
        expect.anything(),
      );
    });
  });

  it('should filter games by category', async () => {
    const user = userEvent.setup();

    renderCatalog();

    const rpgButton = await screen.findByRole(
      'button',
      { name: /rpg/i },
    );

    vi.mocked(
      catalogService.getGames,
    ).mockResolvedValue(
      createGamesResponse([cyberpunkGame]),
    );

    await user.click(rpgButton);

    await waitFor(() => {
      expect(
        catalogService.getGames,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'rpg',
          page: 1,
        }),
        expect.anything(),
      );
    });

    expect(rpgButton).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await waitFor(() => {
      expect(
        screen.queryByRole('heading', {
          name: gtaGame.title,
        }),
      ).not.toBeInTheDocument();
    });
  });

  it('should deselect a category when clicked again', async () => {
    const user = userEvent.setup();

    renderCatalog();

    const rpgButton = await screen.findByRole(
      'button',
      { name: /rpg/i },
    );

    await user.click(rpgButton);

    expect(rpgButton).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await user.click(rpgButton);

    expect(rpgButton).toHaveAttribute(
      'aria-pressed',
      'false',
    );

    expect(
      screen.getByRole('button', {
        name: 'Todos',
      }),
    ).toHaveAttribute('aria-pressed', 'true');
  });

  it('should search games after the debounce delay', async () => {
    const user = userEvent.setup();

    renderCatalog();

    await screen.findByRole('heading', {
      name: gtaGame.title,
    });

    vi.mocked(
      catalogService.getGames,
    ).mockResolvedValue(
      createGamesResponse([cyberpunkGame]),
    );

    await user.type(
      screen.getByRole('searchbox'),
      'Cyberpunk',
    );

    await waitFor(() => {
      expect(
        catalogService.getGames,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'Cyberpunk',
          page: 1,
        }),
        expect.anything(),
      );
    });

    await waitFor(() => {
      expect(
        screen.queryByRole('heading', {
          name: gtaGame.title,
        }),
      ).not.toBeInTheDocument();
    });
  });

  it('should request games using the selected sorting option', async () => {
    const user = userEvent.setup();

    renderCatalog();

    await user.selectOptions(
      screen.getByRole('combobox', {
        name: 'Ordenar jogos',
      }),
      'price_asc',
    );

    await waitFor(() => {
      expect(
        catalogService.getGames,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          sort: 'price_asc',
          page: 1,
        }),
        expect.anything(),
      );
    });
  });

  it('should display the empty state when no games are found', async () => {
    vi.mocked(
      catalogService.getGames,
    ).mockResolvedValue(
      createGamesResponse([]),
    );

    renderCatalog();

    expect(
      await screen.findByRole('heading', {
        name: 'Nenhum jogo encontrado',
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', {
        name: 'Limpar filtros',
      }),
    ).toBeInTheDocument();
  });

  it('should display an error when the API request fails', async () => {
    vi.mocked(
      catalogService.getGames,
    ).mockRejectedValue(
      new Error('Network error'),
    );

    renderCatalog();

    expect(
      await screen.findByRole('heading', {
        name: 'Não foi possível carregar o catálogo',
      }),
    ).toBeInTheDocument();
  });

  it('should recover after retrying a failed request', async () => {
    const user = userEvent.setup();

    vi.mocked(
      catalogService.getGames,
    ).mockRejectedValueOnce(
      new Error('Network error'),
    );

    renderCatalog();

    await user.click(
      await screen.findByRole('button', {
        name: 'Tentar novamente',
      }),
    );

    expect(
      await screen.findByRole('heading', {
        name: gtaGame.title,
      }),
    ).toBeInTheDocument();
  });
});