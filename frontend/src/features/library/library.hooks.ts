import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useAuth } from '../../hooks/useAuth';
import { libraryService } from './library.service';

export const libraryKeys = {
  all: ['library'] as const,

  items: (userId: string) =>
    [...libraryKeys.all, 'items', userId] as const,
};

export function useLibrary() {
  const { user, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: libraryKeys.items(user?.id ?? ''),
    queryFn: ({ signal }) =>
      libraryService.getLibrary(signal),
    enabled: isAuthenticated && Boolean(user?.id),
    staleTime: 60_000,
  });
}

export function useOwnedGames() {
  const libraryQuery = useLibrary();

  const ownedGameIds = useMemo(
    () =>
      new Set(
        libraryQuery.data?.items.map(
          (item) => item.game.id,
        ) ?? [],
      ),
    [libraryQuery.data],
  );

  return {
    ownedGameIds,
    isLoading: libraryQuery.isLoading,
    isError: libraryQuery.isError,
    isSuccess: libraryQuery.isSuccess,
  };
}