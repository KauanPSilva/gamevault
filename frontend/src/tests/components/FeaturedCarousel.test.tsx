import { describe, expect, it } from 'vitest';

import {
  render,
  screen,
} from '@testing-library/react';

import userEvent from '@testing-library/user-event';

import { MemoryRouter } from 'react-router-dom';

import { FeaturedCarousel } from '../../components/games/FeaturedCarousel';
import { ThemeProvider } from '../../contexts/ThemeProvider';

import { featuredGames } from '../fixtures/games.fixture';

import type { Game } from '../../types/game';

function renderCarousel(games: Game[] = featuredGames) {
  return render(
    <MemoryRouter>
      <ThemeProvider>
        <FeaturedCarousel games={games} />
      </ThemeProvider>
    </MemoryRouter>,
  );
}

describe('FeaturedCarousel', () => {
  it('should display the first featured game', () => {
    renderCarousel();

    expect(
      screen.getByRole('heading', {
        name: 'Grand Theft Auto VI',
      }),
    ).toBeInTheDocument();
  });

  it('should display the game price', () => {
    renderCarousel();

    expect(
      screen.getByText(/R\$\s*349,90/),
    ).toBeInTheDocument();
  });

  it('should navigate to the next game', async () => {
    const user = userEvent.setup();

    renderCarousel();

    await user.click(
      screen.getByRole('button', {
        name: 'Próximo jogo',
      }),
    );

    expect(
      screen.getByRole('heading', {
        name: 'Cyberpunk 2077',
      }),
    ).toBeInTheDocument();
  });

  it('should navigate to the previous game', async () => {
    const user = userEvent.setup();

    renderCarousel();

    await user.click(
      screen.getByRole('button', {
        name: 'Jogo anterior',
      }),
    );

    expect(
      screen.getByRole('heading', {
        name: 'Cyberpunk 2077',
      }),
    ).toBeInTheDocument();
  });

  it('should return to the first game after the last one', async () => {
    const user = userEvent.setup();

    renderCarousel();

    const nextButton = screen.getByRole('button', {
      name: 'Próximo jogo',
    });

    await user.click(nextButton);
    await user.click(nextButton);

    expect(
      screen.getByRole('heading', {
        name: 'Grand Theft Auto VI',
      }),
    ).toBeInTheDocument();
  });

  it('should select a game through its thumbnail', async () => {
    const user = userEvent.setup();

    renderCarousel();

    const thumbnail = screen.getByRole('button', {
      name: 'Selecionar Cyberpunk 2077',
    });

    await user.click(thumbnail);

    expect(thumbnail).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    expect(
      screen.getByRole('heading', {
        name: 'Cyberpunk 2077',
      }),
    ).toBeInTheDocument();
  });

  it('should apply the initial game accent color', () => {
    renderCarousel();

    expect(
      document.documentElement.style.getPropertyValue(
        '--game-accent',
      ),
    ).toBe('#F472B6');
  });

  it('should update the accent color when selecting another game', async () => {
    const user = userEvent.setup();

    renderCarousel();

    await user.click(
      screen.getByRole('button', {
        name: 'Selecionar Cyberpunk 2077',
      }),
    );

    expect(
      document.documentElement.style.getPropertyValue(
        '--game-accent',
      ),
    ).toBe('#FCEE09');
  });

  it('should link to the selected game details', () => {
    renderCarousel();

    expect(
      screen.getByRole('link', {
        name: 'Ver detalhes',
      }),
    ).toHaveAttribute(
      'href',
      '/games/grand-theft-auto-vi',
    );
  });

  it('should hide navigation arrows when there is only one game', () => {
    renderCarousel(featuredGames.slice(0, 1));

    expect(
      screen.queryByRole('button', {
        name: 'Próximo jogo',
      }),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole('button', {
        name: 'Jogo anterior',
      }),
    ).not.toBeInTheDocument();
  });

  it('should render nothing when there are no games', () => {
    const { container } = renderCarousel([]);

    expect(container).toBeEmptyDOMElement();
  });
});