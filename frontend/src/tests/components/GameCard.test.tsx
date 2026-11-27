import { describe, expect, it } from 'vitest';

import {
  render,
  screen,
  fireEvent,
} from '@testing-library/react';

import { MemoryRouter } from 'react-router-dom';

import { GameCard } from '../../components/games/GameCard';

import { gtaGame } from '../fixtures/games.fixture';

import type { Game } from '../../types/game';

function renderCard(game: Game = gtaGame) {
  return render(
    <MemoryRouter>
      <GameCard game={game} />
    </MemoryRouter>,
  );
}

describe('GameCard', () => {
  it('should display the game title', () => {
    renderCard();

    expect(
      screen.getByRole('heading', {
        name: gtaGame.title,
      }),
    ).toBeInTheDocument();
  });

  it('should display the game category', () => {
    renderCard();

    expect(
      screen.getByText('Ação'),
    ).toBeInTheDocument();
  });

  it('should display the formatted price', () => {
    renderCard();

    expect(
      screen.getByText(/R\$\s*349,90/),
    ).toBeInTheDocument();
  });

  it('should display the developer', () => {
    renderCard();

    expect(
      screen.getByText('Rockstar Games'),
    ).toBeInTheDocument();
  });

  it('should display the game cover', () => {
    renderCard();

    expect(
      screen.getByRole('img', {
        name: gtaGame.title,
      }),
    ).toHaveAttribute('src', gtaGame.imageUrl);
  });

  it('should link to the game details page', () => {
    renderCard();

    expect(
      screen.getByRole('link'),
    ).toHaveAttribute(
      'href',
      `/games/${gtaGame.slug}`,
    );
  });

  it('should display the featured badge', () => {
    renderCard();

    expect(
      screen.getByText('Destaque'),
    ).toBeInTheDocument();
  });

  it('should hide the featured badge for regular games', () => {
    renderCard({
      ...gtaGame,
      isFeatured: false,
    });

    expect(
      screen.queryByText('Destaque'),
    ).not.toBeInTheDocument();
  });

  it('should display a fallback when the image fails', () => {
    renderCard();

    const image = screen.getByRole('img', {
      name: gtaGame.title,
    });

    fireEvent.error(image);

    const fallback = screen.getByRole('img', {
      name: gtaGame.title,
    });

    expect(fallback.tagName).toBe('DIV');
    expect(fallback).not.toHaveAttribute('src');
  });
});