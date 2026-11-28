import {
  beforeEach,
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
import { MemoryRouter } from 'react-router-dom';

import { GameCard } from '../../components/games/GameCard';
import { AddToCartButton } from '../../features/cart/components/AddToCartButton';
import { CartPage } from '../../pages/CartPage';

import { CartProvider } from '../../contexts/CartProvider';
import { useOwnedGames } from '../../features/library/library.hooks';
import { useCart } from '../../hooks/useCart';

import {
  gtaGame,
  cyberpunkGame,
} from '../fixtures/games.fixture';

vi.mock('../../features/library/library.hooks', () => ({
  useOwnedGames: vi.fn(),
}));

function mockOwnedGames(gameIds: string[] = []) {
  vi.mocked(useOwnedGames).mockReturnValue({
    ownedGameIds: new Set(gameIds),
    isLoading: false,
    isError: false,
    isSuccess: true,
  });
}

function CartTestControls() {
  const { addItem } = useCart();

  return (
    <div>
      <button
        type="button"
        onClick={() => addItem(gtaGame)}
      >
        Adicionar GTA
      </button>

      <button
        type="button"
        onClick={() => addItem(cyberpunkGame)}
      >
        Adicionar Cyberpunk
      </button>
    </div>
  );
}

function renderGameCard() {
  return render(
    <MemoryRouter>
      <GameCard game={gtaGame} />
    </MemoryRouter>,
  );
}

function renderAddToCartButton() {
  return render(
    <MemoryRouter>
      <CartProvider>
        <AddToCartButton game={gtaGame} />
      </CartProvider>
    </MemoryRouter>,
  );
}

function renderCartPage() {
  return render(
    <MemoryRouter>
      <CartProvider>
        <CartTestControls />
        <CartPage />
      </CartProvider>
    </MemoryRouter>,
  );
}

describe('Owned games', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockOwnedGames();
  });

  it('should display an owned badge on acquired games', () => {
    mockOwnedGames([gtaGame.id]);

    renderGameCard();

    expect(
      screen.getByText('Na sua biblioteca'),
    ).toBeInTheDocument();
  });

  it('should not display an owned badge on unowned games', () => {
    renderGameCard();

    expect(
      screen.queryByText('Na sua biblioteca'),
    ).not.toBeInTheDocument();
  });

  it('should allow adding an unowned game to the cart', () => {
    renderAddToCartButton();

    expect(
      screen.getByRole('button', {
        name: 'Adicionar ao carrinho',
      }),
    ).toBeEnabled();
  });

  it('should prevent adding an owned game to the cart', () => {
    mockOwnedGames([gtaGame.id]);

    renderAddToCartButton();

    expect(
      screen.queryByRole('button', {
        name: 'Adicionar ao carrinho',
      }),
    ).not.toBeInTheDocument();
  });

  it('should display an ownership message', () => {
    mockOwnedGames([gtaGame.id]);

    renderAddToCartButton();

    expect(
      screen.getByText(
        'Este jogo já está na sua biblioteca',
      ),
    ).toBeInTheDocument();
  });

  it('should provide a link to the customer library', () => {
    mockOwnedGames([gtaGame.id]);

    renderAddToCartButton();

    expect(
      screen.getByRole('link', {
        name: 'Acessar minha biblioteca',
      }),
    ).toHaveAttribute('href', '/library');
  });

  it('should warn when the cart contains an owned game', async () => {
    const user = userEvent.setup();

    mockOwnedGames([gtaGame.id]);

    renderCartPage();

    await user.click(
      screen.getByRole('button', {
        name: 'Adicionar GTA',
      }),
    );

    expect(
      screen.getByRole('alert'),
    ).toHaveTextContent(
      'Você já possui alguns jogos deste carrinho',
    );
  });

  it('should disable checkout when the cart contains owned games', async () => {
    const user = userEvent.setup();

    mockOwnedGames([gtaGame.id]);

    renderCartPage();

    await user.click(
      screen.getByRole('button', {
        name: 'Adicionar GTA',
      }),
    );

    expect(
      screen.getByRole('button', {
        name: 'Finalizar compra',
      }),
    ).toBeDisabled();
  });

  it('should allow checkout when all games are unowned', async () => {
    const user = userEvent.setup();

    renderCartPage();

    await user.click(
      screen.getByRole('button', {
        name: 'Adicionar GTA',
      }),
    );

    expect(
      screen.getByRole('link', {
        name: 'Finalizar compra',
      }),
    ).toHaveAttribute('href', '/checkout');
  });

  it('should remove only owned games from the cart', async () => {
    const user = userEvent.setup();

    mockOwnedGames([gtaGame.id]);

    renderCartPage();

    await user.click(
      screen.getByRole('button', {
        name: 'Adicionar GTA',
      }),
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Adicionar Cyberpunk',
      }),
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Remover jogos já adquiridos',
      }),
    );

    expect(
        screen.queryByRole('link', {
            name: gtaGame.title,
        }),
    ).not.toBeInTheDocument();

    expect(
        screen.getByRole('link', {
            name: cyberpunkGame.title,
        }),
    ).toBeInTheDocument();
  });

  it('should enable checkout after removing owned games', async () => {
    const user = userEvent.setup();

    mockOwnedGames([gtaGame.id]);

    renderCartPage();

    await user.click(
      screen.getByRole('button', {
        name: 'Adicionar GTA',
      }),
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Adicionar Cyberpunk',
      }),
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Remover jogos já adquiridos',
      }),
    );

    expect(
      screen.queryByRole('alert'),
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole('link', {
        name: 'Finalizar compra',
      }),
    ).toHaveAttribute('href', '/checkout');
  });

  it('should display an empty cart after removing all owned games', async () => {
    const user = userEvent.setup();

    mockOwnedGames([gtaGame.id]);

    renderCartPage();

    await user.click(
      screen.getByRole('button', {
        name: 'Adicionar GTA',
      }),
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Remover jogos já adquiridos',
      }),
    );

    expect(
      screen.getByRole('heading', {
        name: 'Seu carrinho está vazio',
      }),
    ).toBeInTheDocument();
  });
});