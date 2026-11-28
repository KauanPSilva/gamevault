import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LibraryPage } from '../../../pages/LibraryPage';
import { libraryService } from '../../../features/library/library.service';
import type { LibraryResponse } from '../../../types/library';

vi.mock('../../../features/library/library.service', () => ({
  libraryService: {
    getLibrary: vi.fn(),
  },
}));

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: 'customer-test-id',
      name: 'Test Customer',
      role: 'CUSTOMER',
    },
    isAuthenticated: true,
  }),
}));

const library: LibraryResponse = {
  total: 2,
  items: [
    {
      id: 'library-item-1',
      acquiredAt: '2026-11-28T12:00:00.000Z',
      game: {
        id: 'game-1',
        title: 'Cyberpunk 2077',
        slug: 'cyberpunk-2077',
        description: 'An open-world RPG.',
        imageUrl: '/images/cyberpunk.webp',
        bannerUrl: null,
        accentColor: '#FCEE09',
        developer: 'CD Projekt Red',
        publisher: 'CD Projekt',
        category: {
          id: 'category-1',
          name: 'RPG',
          slug: 'rpg',
        },
      },
    },
    {
      id: 'library-item-2',
      acquiredAt: '2026-11-27T12:00:00.000Z',
      game: {
        id: 'game-2',
        title: 'Battlefield 6',
        slug: 'battlefield-6',
        description: 'A first-person shooter.',
        imageUrl: '/images/battlefield.webp',
        bannerUrl: null,
        accentColor: '#2DD4BF',
        developer: 'Battlefield Studios',
        publisher: 'Electronic Arts',
        category: {
          id: 'category-2',
          name: 'FPS',
          slug: 'fps',
        },
      },
    },
  ],
};

function renderLibrary() {
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
        <LibraryPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('LibraryPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    vi.mocked(libraryService.getLibrary)
      .mockResolvedValue(library);
  });

  it('should display the library heading', async () => {
    renderLibrary();

    expect(
      screen.getByRole('heading', {
        name: 'Minha biblioteca',
      }),
    ).toBeInTheDocument();

    await screen.findByText('Cyberpunk 2077');
  });

  it('should display the loading state', async () => {
    renderLibrary();

    expect(
      screen.getByRole('status', {
        name: 'Carregando biblioteca',
      }),
    ).toBeInTheDocument();

    await screen.findByText('Cyberpunk 2077');
  });

  it('should display all owned games', async () => {
    renderLibrary();

    expect(
      await screen.findByText('Cyberpunk 2077'),
    ).toBeInTheDocument();

    expect(
      screen.getByText('Battlefield 6'),
    ).toBeInTheDocument();

    expect(screen.getAllByRole('article')).toHaveLength(2);
  });

  it('should display the total number of owned games', async () => {
    renderLibrary();

    expect(
      await screen.findByText('2 de 2 jogos'),
    ).toBeInTheDocument();
  });

  it('should identify games as acquired', async () => {
    renderLibrary();

    await screen.findByText('Cyberpunk 2077');

    expect(
      screen.getAllByText('Adquirido'),
    ).toHaveLength(2);
  });

  it('should display the acquisition date', async () => {
    renderLibrary();

    await screen.findByText('Cyberpunk 2077');

    const cards = screen.getAllByRole('article');

    expect(
      within(cards[0]!).getByText(/Adquirido em/),
    ).toBeInTheDocument();
  });

  it('should filter games by title', async () => {
    const user = userEvent.setup();

    renderLibrary();

    await screen.findByText('Cyberpunk 2077');

    await user.type(
      screen.getByRole('searchbox', {
        name: 'Buscar na biblioteca',
      }),
      'cyberpunk',
    );

    expect(
      screen.getByText('Cyberpunk 2077'),
    ).toBeInTheDocument();

    expect(
      screen.queryByText('Battlefield 6'),
    ).not.toBeInTheDocument();

    expect(
      screen.getByText('1 de 2 jogos'),
    ).toBeInTheDocument();
  });

  it('should filter games by category', async () => {
    const user = userEvent.setup();

    renderLibrary();

    await screen.findByText('Cyberpunk 2077');

    await user.type(
      screen.getByRole('searchbox'),
      'FPS',
    );

    expect(
      screen.getByText('Battlefield 6'),
    ).toBeInTheDocument();

    expect(
      screen.queryByText('Cyberpunk 2077'),
    ).not.toBeInTheDocument();
  });

  it('should filter games by developer', async () => {
    const user = userEvent.setup();

    renderLibrary();

    await screen.findByText('Cyberpunk 2077');

    await user.type(
      screen.getByRole('searchbox'),
      'CD Projekt',
    );

    expect(
      screen.getByText('Cyberpunk 2077'),
    ).toBeInTheDocument();

    expect(
      screen.queryByText('Battlefield 6'),
    ).not.toBeInTheDocument();
  });

  it('should display an empty search result', async () => {
    const user = userEvent.setup();

    renderLibrary();

    await screen.findByText('Cyberpunk 2077');

    await user.type(
      screen.getByRole('searchbox'),
      'Nonexistent game',
    );

    expect(
      screen.getByText('Nenhum jogo encontrado'),
    ).toBeInTheDocument();

    expect(
      screen.queryAllByRole('article'),
    ).toHaveLength(0);
  });

  it('should restore all games after clearing the search', async () => {
    const user = userEvent.setup();

    renderLibrary();

    await screen.findByText('Cyberpunk 2077');

    await user.type(
      screen.getByRole('searchbox'),
      'Cyberpunk',
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Limpar pesquisa',
      }),
    );

    expect(screen.getAllByRole('article')).toHaveLength(2);
  });

  it('should display the empty library state', async () => {
    vi.mocked(libraryService.getLibrary)
      .mockResolvedValue({
        items: [],
        total: 0,
      });

    renderLibrary();

    expect(
      await screen.findByText('Sua biblioteca está vazia'),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('link', {
        name: 'Explorar loja',
      }),
    ).toHaveAttribute('href', '/');
  });

  it('should display an error when the request fails', async () => {
    vi.mocked(libraryService.getLibrary)
      .mockRejectedValue(new Error('Network error'));

    renderLibrary();

    expect(
      await screen.findByText(
        'Não foi possível carregar sua biblioteca',
      ),
    ).toBeInTheDocument();
  });

  it('should retry a failed library request', async () => {
    const user = userEvent.setup();

    vi.mocked(libraryService.getLibrary)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(library);

    renderLibrary();

    await screen.findByText(
      'Não foi possível carregar sua biblioteca',
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
      libraryService.getLibrary,
    ).toHaveBeenCalledTimes(2);
  });
});