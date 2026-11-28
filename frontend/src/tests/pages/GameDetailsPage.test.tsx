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

import {
  MemoryRouter,
  Routes,
  Route,
} from 'react-router-dom';

import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';

import { AxiosError } from 'axios';

import type { AxiosResponse } from 'axios';

import { GameDetailsPage } from '../../pages/GameDetailsPage';
import { ThemeProvider } from '../../contexts/ThemeProvider';
import { CartProvider } from '../../contexts/CartProvider';

import { catalogService } from '../../features/catalog/catalog.service';
import { cartStorage } from '../../services/cart-storage';

import { gtaGame } from '../fixtures/games.fixture';

vi.mock('../../features/catalog/catalog.service', () => ({
  catalogService: {
    getGameBySlug: vi.fn(),
  },
}));

function renderPage(slug = gtaGame.slug) {
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
      <ThemeProvider>
        <CartProvider>
          <MemoryRouter
            initialEntries={[`/games/${slug}`]}
          >
            <Routes>
              <Route
                path="/games/:slug"
                element={<GameDetailsPage />}
              />
            </Routes>
          </MemoryRouter>
        </CartProvider>
      </ThemeProvider>
    </QueryClientProvider>,
  );
}

describe('GameDetailsPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    cartStorage.clear();

    vi.mocked(
      catalogService.getGameBySlug,
    ).mockResolvedValue({
      game: gtaGame,
    });
  });

  it('should display the loading state', () => {
    vi.mocked(
      catalogService.getGameBySlug,
    ).mockImplementation(
      () => new Promise(() => {}),
    );

    renderPage();

    expect(
      screen.getByRole('status', {
        name: 'Carregando jogo',
      }),
    ).toBeInTheDocument();
  });

  it('should display the game title', async () => {
    renderPage();

    expect(
      await screen.findByRole('heading', {
        name: gtaGame.title,
      }),
    ).toBeInTheDocument();
  });

  it('should request the game using the route slug', async () => {
    renderPage();

    await screen.findByRole('heading', {
      name: gtaGame.title,
    });

    expect(
      catalogService.getGameBySlug,
    ).toHaveBeenCalledWith(
      gtaGame.slug,
      expect.anything(),
    );
  });

  it('should display the game description', async () => {
    renderPage();

    expect(
      await screen.findByText(gtaGame.description),
    ).toBeInTheDocument();
  });

  it('should display the formatted price', async () => {
    renderPage();

    expect(
      await screen.findByText(/R\$\s*349,90/),
    ).toBeInTheDocument();
  });

  it('should display the game cover', async () => {
    renderPage();

    expect(
      await screen.findByRole('img', {
        name: `Capa de ${gtaGame.title}`,
      }),
    ).toHaveAttribute('src', gtaGame.imageUrl);
  });

  it('should display the developer and publisher information', async () => {
    renderPage();

    expect(
      await screen.findByText('Desenvolvedora'),
    ).toBeInTheDocument();

    expect(
      screen.getByText('Distribuidora'),
    ).toBeInTheDocument();

    expect(
      screen.getAllByText('Rockstar Games'),
    ).toHaveLength(3);
  });

  it('should apply the game accent color', async () => {
    renderPage();

    await screen.findByRole('heading', {
      name: gtaGame.title,
    });

    await waitFor(() => {
      expect(
        document.documentElement.style.getPropertyValue(
          '--game-accent',
        ),
      ).toBe(gtaGame.accentColor);
    });
  });

  it('should provide a link back to the store', async () => {
    renderPage();

    expect(
      await screen.findByRole('link', {
        name: 'Voltar para a loja',
      }),
    ).toHaveAttribute('href', '/');
  });

  it('should display the sandbox payment disclaimer', async () => {
    renderPage();

    expect(
      await screen.findByText(
        /nenhuma cobrança real será realizada/i,
      ),
    ).toBeInTheDocument();
  });

  it('should display an enabled add to cart button', async () => {
    renderPage();

    expect(
      await screen.findByRole('button', {
        name: 'Adicionar ao carrinho',
      }),
    ).toBeEnabled();
  });

  it('should add the game to the cart', async () => {
    const user = userEvent.setup();

    renderPage();

    await user.click(
      await screen.findByRole('button', {
        name: 'Adicionar ao carrinho',
      }),
    );

    expect(
      await screen.findByText(
        'Adicionado ao carrinho',
      ),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole('button', {
        name: 'Adicionar ao carrinho',
      }),
    ).not.toBeInTheDocument();
  });

  it('should provide a link to the cart after adding a game', async () => {
    const user = userEvent.setup();

    renderPage();

    await user.click(
      await screen.findByRole('button', {
        name: 'Adicionar ao carrinho',
      }),
    );

    expect(
      await screen.findByRole('link', {
        name: 'Ir para o carrinho',
      }),
    ).toHaveAttribute('href', '/cart');
  });

  it('should display an error when the request fails', async () => {
    vi.mocked(
      catalogService.getGameBySlug,
    ).mockRejectedValue(
      new Error('Network error'),
    );

    renderPage();

    expect(
      await screen.findByRole('heading', {
        name: 'Não foi possível carregar o jogo',
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', {
        name: 'Tentar novamente',
      }),
    ).toBeInTheDocument();
  });

  it('should display a specific error for a missing game', async () => {
    const response = {
      status: 404,
      data: {
        error: {
          code: 'GAME_NOT_FOUND',
          message: 'Game not found',
        },
      },
    } as AxiosResponse;

    const error = new AxiosError(
      'Game not found',
      'ERR_BAD_REQUEST',
      undefined,
      undefined,
      response,
    );

    vi.mocked(
      catalogService.getGameBySlug,
    ).mockRejectedValue(error);

    renderPage('nonexistent-game');

    expect(
      await screen.findByRole('heading', {
        name: 'Jogo não encontrado',
      }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole('button', {
        name: 'Tentar novamente',
      }),
    ).not.toBeInTheDocument();
  });

  it('should recover after retrying a failed request', async () => {
    const user = userEvent.setup();

    vi.mocked(
      catalogService.getGameBySlug,
    ).mockRejectedValueOnce(
      new Error('Network error'),
    );

    renderPage();

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