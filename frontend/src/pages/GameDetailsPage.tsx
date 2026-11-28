import {
  ArrowLeft,
  ShieldCheck,
  Gamepad2,
  Building2,
} from 'lucide-react';

import { Link, useParams } from 'react-router-dom';

import { useGame } from '../features/catalog/catalog.hooks';
import { useGameAccent } from '../hooks/useGameAccent';

import { GameImage } from '../components/games/GameImage';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { ErrorState } from '../components/ui/ErrorState';

import { formatCurrency } from '../utils/currency';

import { isAxiosError } from 'axios';

import { AddToCartButton } from '../features/cart/components/AddToCartButton';

export function GameDetailsPage() {
  const { slug } = useParams<{ slug: string }>();

  const gameQuery = useGame(slug ?? '');
  const game = gameQuery.data?.game;

  useGameAccent(game?.accentColor);

  const isNotFound =
  isAxiosError(gameQuery.error) &&
  gameQuery.error.response?.status === 404;

  if (gameQuery.isLoading) {
    return (
      <div
        role="status"
        aria-label="Carregando jogo"
        className="mx-auto max-w-[1600px] space-y-6 px-5 py-8 lg:px-10"
      >
        <LoadingSkeleton className="h-[420px]" />
        <LoadingSkeleton className="h-40" />
      </div>
    );
  }

  if (gameQuery.isError || !game) {
    return (
      <div className="mx-auto max-w-[1600px] space-y-6 px-5 py-12 lg:px-10">
        <Link
          to="/"
          className="accent-text inline-flex items-center gap-2 text-sm font-medium"
        >
          <ArrowLeft size={18} />
          Voltar para a loja
        </Link>

        <ErrorState
            title={
                isNotFound
                ? 'Jogo não encontrado'
                : 'Não foi possível carregar o jogo'
            }
            message={
                isNotFound
                ? 'Este jogo não existe ou não está mais disponível.'
                : 'Ocorreu um erro ao carregar as informações. Tente novamente.'
            }
            onRetry={
                isNotFound
                ? undefined
                : () => {
                    void gameQuery.refetch();
                    }
            }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] px-5 py-8 lg:px-10">

      {/* Back navigation */}
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-text-muted transition-colors hover:text-white"
      >
        <ArrowLeft size={18} />
        Voltar para a loja
      </Link>

      {/* Hero banner */}
      <div className="accent-glow relative isolate min-h-[380px] overflow-hidden rounded-2xl border border-white/10 md:min-h-[480px]">
        <GameImage
          key={game.id}
          src={game.bannerUrl ?? game.imageUrl}
          alt=""
          loading="eager"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-background via-black/30 to-transparent"
        />

        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent"
        />

        <div className="relative flex min-h-[380px] flex-col justify-end p-8 md:min-h-[480px] md:p-12">
          <span className="accent-text mb-4 text-xs font-bold uppercase tracking-[0.2em]">
            {game.category.name}
          </span>

          <h1 className="max-w-4xl text-4xl font-black tracking-tight text-white md:text-6xl">
            {game.title}
          </h1>

          <p className="mt-3 text-sm text-slate-300">
            {game.developer}
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_340px]">

        {/* Game information */}
        <section className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold">
              Sobre o jogo
            </h2>

            <p className="mt-4 leading-relaxed text-text-secondary">
              {game.description}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-surface p-6">
            <h2 className="mb-6 text-lg font-semibold">
              Informações do jogo
            </h2>

            <dl className="grid gap-6 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <Gamepad2
                  size={22}
                  className="accent-text"
                />

                <div>
                  <dt className="text-xs text-text-muted">
                    Categoria
                  </dt>

                  <dd className="mt-1 text-sm font-medium">
                    {game.category.name}
                  </dd>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Building2
                  size={22}
                  className="accent-text"
                />

                <div>
                  <dt className="text-xs text-text-muted">
                    Desenvolvedora
                  </dt>

                  <dd className="mt-1 text-sm font-medium">
                    {game.developer ?? 'Não informado'}
                  </dd>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Building2
                  size={22}
                  className="accent-text"
                />

                <div>
                  <dt className="text-xs text-text-muted">
                    Distribuidora
                  </dt>

                  <dd className="mt-1 text-sm font-medium">
                    {game.publisher ?? 'Não informado'}
                  </dd>
                </div>
              </div>
            </dl>
          </div>
        </section>

        {/* Purchase card */}
        <aside className="overflow-hidden rounded-xl border border-border bg-surface">
          <GameImage
            key={game.id}
            src={game.imageUrl}
            alt={`Capa de ${game.title}`}
            className="aspect-[2/3] w-full object-cover"
          />

          <div className="space-y-5 p-6">
            <div>
              <p className="text-xs text-text-muted">
                Preço do jogo
              </p>

              <p className="accent-text mt-1 text-3xl font-bold">
                {formatCurrency(game.price)}
              </p>
            </div>

            <AddToCartButton game={game} />

            <div className="flex items-start gap-3 border-t border-border pt-5">
              <ShieldCheck
                size={22}
                className="shrink-0 text-success"
              />

              <div>
                <p className="text-sm font-semibold">
                  Ambiente demonstrativo
                </p>

                <p className="mt-1 text-xs leading-relaxed text-text-muted">
                  Pagamentos simulados em sandbox.
                  Nenhuma cobrança real será realizada.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}