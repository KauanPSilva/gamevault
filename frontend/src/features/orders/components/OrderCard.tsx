import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  CreditCard,
  LibraryBig,
  ReceiptText,
} from 'lucide-react';

import { GameImage } from '../../../components/games/GameImage';
import { formatCurrency } from '../../../utils/currency';
import type { Order } from '../../../types/order';
import { OrderStatusBadge } from './OrderStatusBadge';

interface OrderCardProps {
  order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
  const latestPayment = order.payments[0];

  const formattedDate = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(order.createdAt));

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-surface">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-background/40 p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-3 text-primary">
            <ReceiptText size={22} />
          </div>

          <div>
            <h2 className="font-bold">
              Pedido #{order.id.slice(0, 8).toUpperCase()}
            </h2>

            <div className="mt-1 flex items-center gap-1.5 text-xs text-text-muted">
              <CalendarDays size={13} />

              <time dateTime={order.createdAt}>
                {formattedDate}
              </time>
            </div>
          </div>
        </div>

        <OrderStatusBadge status={order.status} />
      </header>

      <ul
        aria-label="Jogos do pedido"
        className="divide-y divide-border px-5"
      >
        {order.items.map((item) => (
          <li
            key={item.id}
            className="flex items-center gap-4 py-4"
          >
            <GameImage
              src={item.game.imageUrl}
              alt={`Capa de ${item.game.title}`}
              className="h-20 w-14 shrink-0 rounded-lg object-cover"
            />

            <div className="min-w-0 flex-1">
              <p className="font-semibold">
                {item.game.title}
              </p>

              <p className="mt-1 text-xs text-text-muted">
                Licença digital
              </p>
            </div>

            <span className="shrink-0 text-sm font-semibold">
              {formatCurrency(item.unitPrice)}
            </span>
          </li>
        ))}
      </ul>

      <footer className="border-t border-border p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs text-text-muted">
              Valor total
            </p>

            <p className="mt-1 text-xl font-bold text-primary">
              {formatCurrency(order.totalAmount)}
            </p>
          </div>

          {latestPayment && (
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <CreditCard size={18} />

              <div>
                <p>{latestPayment.gateway.name}</p>

                <p className="text-xs text-text-muted">
                  {latestPayment.paymentMethod?.toUpperCase()
                    ?? 'Pagamento'} · Sandbox
                </p>
              </div>
            </div>
          )}
        </div>

        {order.status === 'PENDING' && (
          <Link
            to={`/checkout?orderId=${encodeURIComponent(order.id)}`}
            className="accent-button mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold sm:w-fit"
          >
            Continuar pagamento
            <ArrowRight size={17} />
          </Link>
        )}

        {order.status === 'PAID' && (
          <Link
            to="/library"
            className="mt-5 inline-flex items-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-semibold transition-colors hover:border-primary hover:text-primary"
          >
            <LibraryBig size={17} />
            Acessar biblioteca
          </Link>
        )}
      </footer>
    </article>
  );
}