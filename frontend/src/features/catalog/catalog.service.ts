import { api } from '../../services/api';

import type {
  GameFilters,
  GamesResponse,
  GameResponse,
  CategoriesResponse,
} from '../../types/game';

export const catalogService = {
  async getGames(
    filters: GameFilters = {},
    signal?: AbortSignal,
  ): Promise<GamesResponse> {
    const { data } = await api.get<GamesResponse>(
      '/games',
      {
        params: filters,
        signal,
      },
    );

    return data;
  },

  async getGameBySlug(
    slug: string,
    signal?: AbortSignal,
  ): Promise<GameResponse> {
    const { data } = await api.get<GameResponse>(
      `/games/${encodeURIComponent(slug)}`,
      { signal },
    );

    return data;
  },

  async getCategories(
    signal?: AbortSignal,
  ): Promise<CategoriesResponse> {
    const { data } = await api.get<CategoriesResponse>(
      '/categories',
      { signal },
    );

    return data;
  },
};