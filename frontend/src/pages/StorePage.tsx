import { FeaturedCarousel } from '../components/games/FeaturedCarousel';

import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { ErrorState } from '../components/ui/ErrorState';

import { useFeaturedGames } from '../features/catalog/catalog.hooks';
import { CatalogSection } from '../features/catalog/CatalogSection';

const featuredOrder = [
  'grand-theft-auto-vi',
  '007-first-light',
  'cyberpunk-2077',
  'battlefield-6',
];

function getFeaturedPosition(slug: string): number {
  const position = featuredOrder.indexOf(slug);

  return position === -1
    ? Number.MAX_SAFE_INTEGER
    : position;
}

export function StorePage() {
  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useFeaturedGames();

  const featuredGames = [...(data?.games ?? [])].sort(
    (first, second) =>
      getFeaturedPosition(first.slug) -
      getFeaturedPosition(second.slug),
  );

  return (
    <section className="mx-auto max-w-[1600px] px-5 py-8 lg:px-10">

      {/* Store introduction */}
      <div className="mb-8">
        <p className="accent-text text-xs font-semibold uppercase tracking-[0.2em]">
          Explore novos mundos
        </p>

        <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
          Sua próxima aventura{' '}
          <span className="accent-text">
            começa aqui.
          </span>
        </h1>

        <p className="mt-3 text-sm text-text-muted">
          Descubra os melhores jogos e encontre sua
          próxima experiência.
        </p>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div
          role="status"
          aria-label="Carregando jogos em destaque"
          className="space-y-4"
        >
          <LoadingSkeleton className="h-[480px] md:h-[540px]" />

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <LoadingSkeleton
                key={index}
                className="aspect-video"
              />
            ))}
          </div>
        </div>
      )}

      {/* Error state */}
      {isError && (
        <ErrorState
          title="Não foi possível carregar os destaques"
          message="Verifique sua conexão e tente novamente."
          onRetry={() => {
            void refetch();
          }}
        />
      )}

      {/* Empty state */}
      {!isLoading &&
        !isError &&
        featuredGames.length === 0 && (
          <div className="rounded-xl border border-border bg-surface p-10 text-center">
            <p className="text-text-muted">
              Nenhum jogo em destaque no momento.
            </p>
          </div>
        )}

      {/* Featured carousel */}
      {!isLoading &&
        !isError &&
        featuredGames.length > 0 && (
          <FeaturedCarousel games={featuredGames} />
        )}
        <CatalogSection />
    </section>
  );
}