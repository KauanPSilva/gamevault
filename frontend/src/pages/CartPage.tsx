import { Link } from 'react-router-dom';

import {
  ShoppingCart,
  Trash2,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Gamepad2,
} from 'lucide-react';

import { useCart } from '../hooks/useCart';
import { GameImage } from '../components/games/GameImage';
import { formatCurrency } from '../utils/currency';

export function CartPage() {
  const {
    items,
    itemCount,
    subtotal,
    removeItem,
    clearCart,
  } = useCart();

  if (itemCount === 0) {
    return (
      <section className="mx-auto flex min-h-[65vh] max-w-xl flex-col items-center justify-center px-5 py-16 text-center">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl border border-border bg-surface">
          <ShoppingCart
            size={42}
            className="text-text-muted"
            aria-hidden="true"
          />
        </div>

        <h1 className="text-3xl font-bold">
          Seu carrinho está vazio
        </h1>

        <p className="mt-3 max-w-md text-text-muted">
          Sua próxima aventura está esperando.
          Explore nosso catálogo e encontre seus
          próximos jogos favoritos.
        </p>

        <Link
          to="/"
          className="accent-button mt-8 inline-flex items-center gap-2 rounded-xl px-6 py-3.5 font-bold"
        >
          <Gamepad2 size={20} aria-hidden="true" />
          Explorar jogos
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-[1400px] px-5 py-10 lg:px-10 lg:py-14">
      <Link
        to="/"
        className="mb-8 inline-flex items-center gap-2 text-sm text-text-muted transition-colors hover:text-primary"
      >
        <ArrowLeft size={18} aria-hidden="true" />
        Continuar comprando
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold md:text-4xl">
          Seu carrinho
        </h1>

        <p className="mt-2 text-text-muted">
          {itemCount === 1
            ? '1 jogo selecionado'
            : `${itemCount} jogos selecionados`}
        </p>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={clearCart}
              className="inline-flex items-center gap-2 text-sm text-text-muted transition-colors hover:text-danger"
            >
              <Trash2 size={16} aria-hidden="true" />
              Esvaziar carrinho
            </button>
          </div>

          <ul
            aria-label="Jogos no carrinho"
            className="space-y-4"
          >
            {items.map((item) => (
              <li
                key={item.gameId}
                className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 sm:gap-6 sm:p-5"
              >
                <Link
                  to={`/games/${item.slug}`}
                  className="w-20 shrink-0 overflow-hidden rounded-lg sm:w-24"
                >
                  <GameImage
                    src={item.imageUrl}
                    alt={`Capa de ${item.title}`}
                    className="aspect-[2/3] w-full object-cover"
                  />
                </Link>

                <div className="min-w-0 flex-1">
                  <Link
                    to={`/games/${item.slug}`}
                    className="text-base font-bold transition-colors hover:text-primary sm:text-xl"
                  >
                    {item.title}
                  </Link>

                  <p className="mt-1 text-sm text-text-muted">
                    Licença digital
                  </p>

                  <p className="mt-3 text-lg font-bold text-primary">
                    {formatCurrency(item.price)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    removeItem(item.gameId)
                  }
                  aria-label={`Remover ${item.title} do carrinho`}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-danger/10 hover:text-danger"
                >
                  <Trash2
                    size={20}
                    aria-hidden="true"
                  />
                </button>
              </li>
            ))}
          </ul>
        </div>

        <aside className="rounded-2xl border border-border bg-surface p-6 lg:sticky lg:top-28">
          <h2 className="text-xl font-bold">
            Resumo do pedido
          </h2>

          <dl className="mt-6 space-y-4">
            <div className="flex justify-between gap-4 text-text-secondary">
              <dt>Subtotal ({itemCount})</dt>

              <dd className="font-medium">
                {formatCurrency(subtotal)}
              </dd>
            </div>

            <div className="flex justify-between gap-4 text-text-secondary">
              <dt>Taxas adicionais</dt>

              <dd className="text-success">
                R$ 0,00
              </dd>
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-border pt-5">
              <dt className="text-lg font-bold">
                Total
              </dt>

              <dd className="text-2xl font-bold text-primary">
                {formatCurrency(subtotal)}
              </dd>
            </div>
          </dl>

          <Link
            to="/checkout"
            className="accent-button mt-6 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-4 font-bold"
          >
            Finalizar compra

            <ArrowRight
              size={20}
              aria-hidden="true"
            />
          </Link>

          <div className="mt-5 flex items-start gap-3 rounded-xl border border-success/20 bg-success/5 p-4">
            <ShieldCheck
              size={22}
              className="shrink-0 text-success"
              aria-hidden="true"
            />

            <div>
              <p className="text-sm font-semibold text-success">
                Ambiente seguro de testes
              </p>

              <p className="mt-1 text-xs leading-relaxed text-text-muted">
                Todos os pagamentos são simulados.
                Nenhuma cobrança real será realizada.
              </p>
            </div>
          </div>

          <p className="mt-4 text-center text-xs text-text-muted">
            Os valores serão confirmados no checkout.
          </p>
        </aside>
      </div>
    </section>
  );
}