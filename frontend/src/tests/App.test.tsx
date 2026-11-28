import {
  describe,
  it,
  expect,
  vi,
} from 'vitest';

import {
  render,
  screen,
} from '@testing-library/react';

import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';

import App from '../App';

import { AuthProvider } from '../contexts/AuthProvider';
import { CartProvider } from '../contexts/CartProvider';


vi.mock('../features/catalog/catalog.service', () => ({
  catalogService: {
    getGames: vi.fn().mockResolvedValue({
      games: [],
      pagination: {
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    }),
  },

  getCategories: vi.fn().mockResolvedValue({
    categories: [],
  }),
}));

function renderApp() {
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
        <CartProvider>
          <App />
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}



describe('App', () => {
  it('should render the store page', () => {
    renderApp();

    expect(
      screen.getByRole('heading', {
        name: /sua próxima aventura começa aqui/i,
      }),
    ).toBeInTheDocument();
  });

  it('should render the main navigation', () => {
    renderApp();

    expect(
      screen.getByRole('navigation', {
        name: 'Navegação principal',
      }),
    ).toBeInTheDocument();
  });

  it('should render the sandbox disclaimer', () => {
    renderApp();

    expect(
      screen.getByText(
        /pagamentos simulados em sandbox/i,
      ),
    ).toBeInTheDocument();
  });

  it('should render the empty featured games state', async () => {
    renderApp();

    expect(
      await screen.findByText(
        /nenhum jogo em destaque no momento/i,
      ),
    ).toBeInTheDocument();
  });
});