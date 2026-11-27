import { useState } from 'react';
import { SearchX, LayoutGrid } from 'lucide-react';

import { CatalogFilters } from './CatalogFilters';

import {
  useGames,
  useCategories,
} from './catalog.hooks';

import { GameGrid } from '../../components/games/GameGrid';
import { Pagination } from '../../components/ui/Pagination';
import { ErrorState } from '../../components/ui/ErrorState';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';

import { useDebounce } from '../../hooks/useDebounce';

import type { GameSort } from '../../types/game';

const PAGE_SIZE = 10;

export function CatalogSection() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState<GameSort>('newest');
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(
    search.trim(),
    400,
  );

  const categoriesQuery = useCategories();

  const gamesQuery = useGames({
    search: debouncedSearch || undefined,
    category: category || undefined,
    sort,
    page,
    limit: PAGE_SIZE,
  });

  const games = gamesQuery.data?.games ?? [];
  const pagination = gamesQuery.data?.pagination;

  const isUpdating =
    gamesQuery.isFetching ||
    search.trim() !== debouncedSearch;

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

 function handleCategoryChange(value: string) {
  setCategory((current) =>
    current === value ? '' : value,
  );

  setPage(1);
}

  function handleSortChange(value: GameSort) {
    setSort(value);
    setPage(1);
  }

  function clearFilters() {
    setSearch('');
    setCategory('');
    setSort('newest');
    setPage(1);
  }

  return (
    <section
      aria-labelledby="catalog-title"
      className="mt-16 space-y-6"
    >
      {/* Section heading */}
      <div>
        <div className="accent-text mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em]">
          <LayoutGrid size={16} />
          Descubra novos jogos
        </div>

        <h2
          id="catalog-title"
          className="text-3xl font-bold tracking-tight"
        >
          Explore o catálogo
        </h2>

        <p className="mt-2 text-sm text-text-muted">
          Encontre sua próxima aventura.
        </p>
      </div>

      {/* Filters */}
      <CatalogFilters
        search={search}
        category={category}
        sort={sort}
        categories={categoriesQuery.data?.categories ?? []}
        onSearchChange={handleSearchChange}
        onCategoryChange={handleCategoryChange}
        onSortChange={handleSortChange}
      />

      {categoriesQuery.isError && (
        <div
          role="alert"
          className="flex flex-wrap items-center gap-3 text-sm text-text-muted"
        >
          Não foi possível carregar as categorias.

          <button
            type="button"
            onClick={() => {
              void categoriesQuery.refetch();
            }}
            className="accent-text underline"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Results count */}
      <div
        aria-live="polite"
        className="flex items-center justify-between"
      >
        <p className="text-sm text-text-muted">
          {pagination
            ? `${pagination.total} ${
                pagination.total === 1
                  ? 'jogo encontrado'
                  : 'jogos encontrados'
              }`
            : 'Carregando catálogo...'}
        </p>

        {isUpdating && (
          <span className="accent-text text-xs">
            Atualizando...
          </span>
        )}
      </div>

      {/* Loading */}
      {gamesQuery.isLoading && (
        <div
          role="status"
          aria-label="Carregando catálogo"
          className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
        >
          {Array.from(
            { length: PAGE_SIZE },
            (_, index) => (
              <LoadingSkeleton
                key={index}
                className="aspect-[2/3]"
              />
            ),
          )}
        </div>
      )}

      {/* Error */}
      {gamesQuery.isError && (
        <ErrorState
          title="Não foi possível carregar o catálogo"
          message="Tente novamente em alguns instantes."
          onRetry={() => {
            void gamesQuery.refetch();
          }}
        />
      )}

      {/* Empty state */}
      {!gamesQuery.isLoading &&
        !gamesQuery.isError &&
        games.length === 0 && (
          <div className="flex flex-col items-center rounded-xl border border-border bg-surface px-6 py-16 text-center">
            <SearchX
              size={48}
              className="accent-text mb-4"
            />

            <h3 className="text-xl font-semibold">
              Nenhum jogo encontrado
            </h3>

            <p className="mt-2 text-sm text-text-muted">
              Experimente outros termos ou categorias.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="accent-button mt-6 rounded-lg px-5 py-3 text-sm font-semibold"
            >
              Limpar filtros
            </button>
          </div>
        )}

      {/* Game grid */}
      {!gamesQuery.isLoading &&
        !gamesQuery.isError &&
        games.length > 0 && (
          <div
            aria-busy={isUpdating}
            className={`transition-opacity ${
              isUpdating ? 'opacity-60' : 'opacity-100'
            }`}
          >
            <GameGrid games={games} />

            {pagination && (
              <Pagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                disabled={isUpdating}
                onPageChange={setPage}
              />
            )}
          </div>
        )}
    </section>
  );
}