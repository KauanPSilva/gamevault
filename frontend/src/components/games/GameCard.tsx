import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { GameImage } from './GameImage';
import { formatCurrency } from '../../utils/currency';

import type { Game } from '../../types/game';

interface GameCardProps {
  game: Game;
}

export function GameCard({ game }: GameCardProps) {
  return (
    <Link
      to={`/games/${game.slug}`}
      className="game-card group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface"
    >
      <div className="relative overflow-hidden">
        <GameImage
          src={game.imageUrl}
          alt={game.title}
          className="aspect-[2/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"
        />

        {game.isFeatured && (
          <span className="absolute top-3 left-3 rounded-md bg-black/70 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            Destaque
          </span>
        )}

        <div className="absolute right-3 bottom-3 rounded-full bg-black/60 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          <ArrowUpRight size={18} />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <span className="text-xs font-medium uppercase tracking-wider text-text-muted">
          {game.category.name}
        </span>

        <h3 className="mt-2 line-clamp-2 text-base font-semibold text-text-primary">
          {game.title}
        </h3>

        <p className="mt-1 truncate text-xs text-text-muted">
          {game.developer}
        </p>

        <div className="mt-auto pt-4">
          <span className="accent-text text-lg font-bold">
            {formatCurrency(game.price)}
          </span>
        </div>
      </div>
    </Link>
  );
}