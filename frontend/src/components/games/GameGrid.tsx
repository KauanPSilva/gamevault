import { GameCard } from './GameCard';

import type { Game } from '../../types/game';

interface GameGridProps {
  games: Game[];
}

export function GameGrid({ games }: GameGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {games.map((game) => (
        <GameCard
          key={game.id}
          game={game}
        />
      ))}
    </div>
  );
}