import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Gamepad2,
  LibraryBig,
  Search,
  ShoppingBag,
  X,
} from 'lucide-react';

import { useLibrary } from '../features/library/library.hooks';
import { LibraryGameCard } from '../features/library/components/LibraryGameCard';
import { ErrorState } from '../components/ui/ErrorState';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { useAuth } from '../hooks/useAuth';

export function LibraryPage() {
  const { user } = useAuth();
  const libraryQuery = useLibrary();

  const [search, setSearch] = useState('');

  const items = libraryQuery.data?.items;

  const total = libraryQuery.data?.total ?? 0;

  const filteredItems = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return (items ?? []).filter(({ game }) => {
      return (
        game.title.toLowerCase().includes(normalizedSearch) ||
        game.category.name
          .toLowerCase()
          .includes(normalizedSearch) ||
        game.developer
          ?.toLowerCase()
          .includes(normalizedSearch)
      );
    });
  }, [items, search]);

  const firstName = user?.name.split(' ')[0];

  return (
    <div className="mx-auto max-w-[1600px] px-5 py-10 lg:px-10">
      <section className="relative mb-10 overflow-hidden rounded-3xl border border-border bg-surface p-6 md:p-10">
        <div className="pointer-events-none absolute -right-16 -top-16 h-80 w-80 rounded-full bg-primary/10 blur-[100px]" />

        <div className="relative">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
            <LibraryBig size={17} />
            Sua coleção digital
          </div>

          <h1 className="text-3xl font-bold md:text-5xl">
            Minha biblioteca
          </h1>

          <p className="mt-3 max-w-xl text-text-secondary">
            {firstName ? `${firstName}, explore` : 'Explore'} todos
            os jogos que você adquiriu no GameVault.
          </p>

          <div className="mt-8 inline-flex items-center gap-4 rounded-xl border border-border bg-background/60 p-4 pr-8">
            <div className="rounded-xl bg-primary/10 p-3 text-primary">
              <Gamepad2 size={26} />
            </div>

            <div>
              <p className="text-3xl font-bold">
                {libraryQuery.isLoading ? '—' : total}
              </p>

              <p className="text-sm text-text-muted">
                {total === 1 ? 'Jogo adquirido' : 'Jogos adquiridos'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {libraryQuery.isLoading ? (
        <div
          role="status"
          aria-label="Carregando biblioteca"
          className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
        >
          {Array.from({ length: 5 }, (_, index) => (
            <LoadingSkeleton
              key={index}
              className="aspect-[2/3] rounded-2xl"
            />
          ))}
        </div>
      ) : libraryQuery.isError ? (
        <ErrorState
          title="Não foi possível carregar sua biblioteca"
          message="Tente novamente em alguns instantes."
          onRetry={() => {
            void libraryQuery.refetch();
          }}
        />
      ) : total === 0 ? (
        <section className="rounded-2xl border border-dashed border-border bg-surface/50 px-6 py-20 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <LibraryBig size={36} />
          </div>

          <h2 className="text-2xl font-bold">
            Sua biblioteca está vazia
          </h2>

          <p className="mx-auto mt-3 max-w-md text-text-secondary">
            Descubra novos jogos na loja e comece a construir
            sua coleção digital.
          </p>

          <Link
            to="/"
            className="accent-button mt-7 inline-flex items-center gap-2 rounded-xl px-6 py-3 font-semibold"
          >
            <ShoppingBag size={18} />
            Explorar loja
          </Link>
        </section>
      ) : (
        <section>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                Meus jogos
              </h2>

              <p className="mt-1 text-sm text-text-muted">
                {filteredItems.length} de {total} jogos
              </p>
            </div>

            <div className="relative w-full sm:max-w-xs">
              <Search
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar na biblioteca..."
                aria-label="Buscar na biblioteca"
                className="w-full rounded-xl border border-border bg-surface py-3 pl-12 pr-10 text-sm outline-none transition-colors focus:border-primary"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  aria-label="Limpar pesquisa"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>

          {filteredItems.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border py-16 text-center">
              <Search
                size={32}
                className="mx-auto mb-4 text-text-muted"
              />

              <h3 className="text-lg font-semibold">
                Nenhum jogo encontrado
              </h3>

              <p className="mt-2 text-sm text-text-muted">
                Tente pesquisar por outro título ou categoria.
              </p>

              <button
                type="button"
                onClick={() => setSearch('')}
                className="mt-4 font-semibold text-primary"
              >
                Limpar pesquisa
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {filteredItems.map((item) => (
                <LibraryGameCard
                  key={item.id}
                  item={item}
                />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}