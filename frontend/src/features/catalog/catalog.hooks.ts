import {
  useQuery,
  keepPreviousData,
} from '@tanstack/react-query';

import { catalogService } from './catalog.service';

import type { GameFilters } from '../../types/game';

export const catalogKeys = {
  all: ['catalog'] as const,

  games: (filters: GameFilters) =>
    ['catalog', 'games', filters] as const,

  game: (slug: string) =>
    ['catalog', 'game', slug] as const,

  categories: () =>
    ['catalog', 'categories'] as const,
};

export function useGames(filters: GameFilters = {}) {
  return useQuery({
    queryKey: catalogKeys.games(filters),

    queryFn: ({ signal }) =>
      catalogService.getGames(filters, signal),

    placeholderData: keepPreviousData,
  });
}

export function useFeaturedGames() {
  return useGames({
    featured: true,
    limit: 12,
  });
}

export function useGame(slug: string) {
  return useQuery({
    queryKey: catalogKeys.game(slug),

    queryFn: ({ signal }) =>
      catalogService.getGameBySlug(slug, signal),

    enabled: Boolean(slug),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: catalogKeys.categories(),

    queryFn: ({ signal }) =>
      catalogService.getCategories(signal),
  });
}