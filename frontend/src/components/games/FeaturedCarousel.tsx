import { useState } from 'react';

import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

import { Link } from 'react-router-dom';

import { GameImage } from './GameImage';

import { useGameAccent } from '../../hooks/useGameAccent';
import { formatCurrency } from '../../utils/currency';

import type { Game } from '../../types/game';

interface FeaturedCarouselProps {
  games: Game[];
}

export function FeaturedCarousel({
  games,
}: FeaturedCarouselProps) {
  const [selectedId, setSelectedId] =
    useState<string | null>(null);

  const selectedIndex = games.findIndex(
    (game) => game.id === selectedId,
  );

  const activeIndex = Math.max(0, selectedIndex);

  const activeGame = games[activeIndex];

  useGameAccent(activeGame?.accentColor);

  if (!activeGame) {
    return null;
  }

  function navigate(direction: number) {
    const nextIndex =
      (activeIndex + direction + games.length) %
      games.length;

    const nextGame = games[nextIndex];

    if (nextGame) {
      setSelectedId(nextGame.id);
    }
  }

  return (
    <section
      aria-label="Jogos em destaque"
      aria-roledescription="carrossel"
      className="space-y-4"
    >
      {/* Main banner */}
      <div className="accent-glow relative isolate min-h-[480px] overflow-hidden rounded-2xl border border-white/10 md:min-h-[540px]">

        {/* Background image */}
        <GameImage
          key={activeGame.id}
          src={
            activeGame.bannerUrl ??
            activeGame.imageUrl
          }
          alt=""
          loading="eager"
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Readability overlays */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent"
        />

        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent"
        />

        {/* Dynamic ambient lighting */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at bottom left, color-mix(in srgb, var(--game-accent) 20%, transparent), transparent 70%)',
          }}
        />

        {/* Banner content */}
        <div
          aria-live="polite"
          className="relative z-10 flex min-h-[480px] max-w-2xl flex-col justify-center px-8 py-16 md:min-h-[540px] md:px-16"
        >
          <div className="accent-text mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em]">
            <Sparkles size={16} />
            Em destaque
          </div>

          <span className="mb-4 w-fit rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white">
            {activeGame.category.name}
          </span>

          <h2 className="text-4xl font-black leading-tight tracking-tight text-white md:text-6xl">
            {activeGame.title}
          </h2>

          <p className="mt-5 max-w-lg text-sm leading-relaxed text-slate-300 md:text-base">
            {activeGame.description}
          </p>

          <p className="mt-4 text-sm text-slate-400">
            {activeGame.developer}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-5">
            <span className="text-3xl font-bold text-white">
              {formatCurrency(activeGame.price)}
            </span>

            <Link
              to={`/games/${activeGame.slug}`}
              className="accent-button flex items-center gap-3 rounded-lg px-6 py-3.5 text-sm font-bold"
            >
              Ver detalhes
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        {/* Carousel navigation */}
        {games.length > 1 && (
          <div className="absolute right-5 bottom-5 z-20 flex gap-2">
            <button
              type="button"
              aria-label="Jogo anterior"
              onClick={() => navigate(-1)}
              className="rounded-full border border-white/15 bg-black/50 p-3 text-white backdrop-blur-md transition-colors hover:bg-white/20"
            >
              <ChevronLeft size={22} />
            </button>

            <button
              type="button"
              aria-label="Próximo jogo"
              onClick={() => navigate(1)}
              className="rounded-full border border-white/15 bg-black/50 p-3 text-white backdrop-blur-md transition-colors hover:bg-white/20"
            >
              <ChevronRight size={22} />
            </button>
          </div>
        )}
      </div>

      {/* Game selection */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {games.map((game, index) => {
          const isActive = index === activeIndex;

          return (
            <button
              key={game.id}
              type="button"
              aria-pressed={isActive}
              aria-label={`Selecionar ${game.title}`}
              onClick={() => setSelectedId(game.id)}
              className={`relative isolate overflow-hidden rounded-xl border-2 text-left transition-all duration-300 ${
                isActive
                  ? 'accent-border accent-glow'
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <GameImage
                src={game.bannerUrl ?? game.imageUrl}
                alt=""
                className="aspect-video w-full object-cover"
              />

              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent"
              />

              <div className="absolute right-0 bottom-0 left-0 p-3">
                <p
                  className={`text-xs font-semibold md:text-sm ${
                    isActive
                      ? 'accent-text'
                      : 'text-white'
                  }`}
                >
                  {game.title}
                </p>
              </div>

              {isActive && (
                <div
                  aria-hidden="true"
                  className="absolute right-0 bottom-0 left-0 h-1"
                  style={{
                    backgroundColor:
                      'var(--game-accent)',
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}