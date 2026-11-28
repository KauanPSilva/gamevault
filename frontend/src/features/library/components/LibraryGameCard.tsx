import type { CSSProperties } from 'react';
import { CalendarDays, CheckCircle2 } from 'lucide-react';

import { GameImage } from '../../../components/games/GameImage';
import type { LibraryItem } from '../../../types/library';

interface LibraryGameCardProps {
  item: LibraryItem;
}

export function LibraryGameCard({
  item,
}: LibraryGameCardProps) {
  const { game, acquiredAt } = item;

  const formattedDate = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
  }).format(new Date(acquiredAt));

  return (
    <article
      className="game-card group overflow-hidden rounded-2xl border border-border bg-surface transition-all duration-300"
      style={
        {
          '--game-accent': game.accentColor,
        } as CSSProperties
      }
    >
      <div className="relative aspect-[2/3] overflow-hidden">
        <GameImage
          src={game.imageUrl}
          alt={`Capa de ${game.title}`}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

        <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full border border-success/30 bg-black/70 px-3 py-1.5 text-xs font-semibold text-success backdrop-blur-md">
          <CheckCircle2 size={14} />
          Adquirido
        </div>

        <div className="absolute inset-x-0 bottom-0 p-4">
          <span className="accent-text text-xs font-semibold uppercase tracking-widest">
            {game.category.name}
          </span>

          <h2 className="mt-1 text-lg font-bold text-white">
            {game.title}
          </h2>
        </div>
      </div>

      <div className="space-y-3 p-4">
        <p className="truncate text-sm text-text-secondary">
          {game.developer ?? 'Desenvolvedora não informada'}
        </p>

        <div className="flex items-center gap-2 border-t border-border pt-3 text-xs text-text-muted">
          <CalendarDays size={15} />

          <time dateTime={acquiredAt}>
            Adquirido em {formattedDate}
          </time>
        </div>
      </div>
    </article>
  );
}