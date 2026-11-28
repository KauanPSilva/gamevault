import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ReceiptText,
  ShoppingBag,
  ShieldCheck,
} from 'lucide-react';

import { useOrders } from '../features/checkout/checkout.hooks';
import { OrderCard } from '../features/orders/components/OrderCard';
import { ErrorState } from '../components/ui/ErrorState';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';

const PAGE_SIZE = 10;

export function OrdersPage() {
  const [page, setPage] = useState(1);

  const ordersQuery = useOrders(page, PAGE_SIZE);

  const orders = ordersQuery.data?.orders ?? [];
  const pagination = ordersQuery.data?.pagination;

  return (
    <div className="mx-auto max-w-[1200px] px-5 py-10 lg:px-10">
      <section className="relative mb-8 overflow-hidden rounded-3xl border border-border bg-surface p-6 md:p-10">
        <div className="pointer-events-none absolute -right-16 -top-16 h-80 w-80 rounded-full bg-primary/10 blur-[100px]" />

        <div className="relative">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
            <ReceiptText size={17} />
            Histórico de transações
          </div>

          <h1 className="text-3xl font-bold md:text-5xl">
            Meus pedidos
          </h1>

          <p className="mt-3 max-w-xl text-text-secondary">
            Acompanhe suas compras, consulte pagamentos e
            continue pedidos pendentes.
          </p>

          <div className="mt-6 flex items-center gap-2 text-sm text-text-muted">
            <ShieldCheck
              size={18}
              className="shrink-0 text-success"
            />

            Todas as transações são realizadas em ambiente
            de simulação.
          </div>
        </div>
      </section>

      {ordersQuery.isLoading ? (
        <div
          role="status"
          aria-label="Carregando pedidos"
          className="space-y-5"
        >
          {Array.from({ length: 3 }, (_, index) => (
            <LoadingSkeleton
              key={index}
              className="h-64 rounded-2xl"
            />
          ))}
        </div>
      ) : ordersQuery.isError ? (
        <ErrorState
          title="Não foi possível carregar seus pedidos"
          message="Tente novamente em alguns instantes."
          onRetry={() => {
            void ordersQuery.refetch();
          }}
        />
      ) : orders.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-border bg-surface/50 px-6 py-20 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ReceiptText size={36} />
          </div>

          <h2 className="text-2xl font-bold">
            Nenhum pedido encontrado
          </h2>

          <p className="mx-auto mt-3 max-w-md text-text-secondary">
            Seus pedidos aparecerão aqui após iniciar
            uma compra na loja.
          </p>

          <Link
            to="/"
            className="accent-button mt-7 inline-flex items-center gap-2 rounded-xl px-6 py-3 font-semibold"
          >
            <ShoppingBag size={18} />
            Explorar loja
          </Link>

          {page > 1 && (
            <button
              type="button"
              onClick={() => setPage(1)}
              className="mx-auto mt-4 block text-sm font-semibold text-primary"
            >
              Voltar à primeira página
            </button>
          )}
        </section>
      ) : (
        <>
          <div className="mb-5 flex items-center justify-between">
            <p className="text-sm text-text-muted">
              {pagination?.total ?? orders.length} pedidos
              encontrados
            </p>
          </div>

          <div className="space-y-5">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
              />
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <nav
              aria-label="Paginação dos pedidos"
              className="mt-8 flex items-center justify-center gap-4"
            >
              <button
                type="button"
                disabled={
                  !pagination.hasPreviousPage ||
                  ordersQuery.isFetching
                }
                onClick={() => {
                  setPage((current) =>
                    Math.max(1, current - 1),
                  );
                }}
                className="rounded-xl border border-border bg-surface px-4 py-2 text-sm font-semibold hover:border-primary disabled:cursor-not-allowed disabled:opacity-40"
              >
                Anterior
              </button>

              <span className="text-sm text-text-muted">
                {page} de {pagination.totalPages}
              </span>

              <button
                type="button"
                disabled={
                  !pagination.hasNextPage ||
                  ordersQuery.isFetching
                }
                onClick={() => {
                  setPage((current) => current + 1);
                }}
                className="rounded-xl border border-border bg-surface px-4 py-2 text-sm font-semibold hover:border-primary disabled:cursor-not-allowed disabled:opacity-40"
              >
                Próxima
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}