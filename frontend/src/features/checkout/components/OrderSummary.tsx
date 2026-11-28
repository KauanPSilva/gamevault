import { ShieldCheck } from 'lucide-react';

import { GameImage } from '../../../components/games/GameImage';

import { formatCurrency } from '../../../utils/currency';

interface SummaryItem {
  id: string;
  title: string;
  imageUrl: string;
  price: number;
}

interface OrderSummaryProps {
  items: SummaryItem[];
  totalAmount: number;
  isConfirmed?: boolean;
}

export function OrderSummary({
  items,
  totalAmount,
  isConfirmed = false,
}: OrderSummaryProps) {
  return (
    <aside className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <h2 className="text-xl font-semibold text-text-primary">
        Resumo do pedido
      </h2>

      <p className="mt-1 text-sm text-text-muted">
        {items.length}{' '}
        {items.length === 1 ? 'jogo' : 'jogos'}
      </p>

      <ul className="my-6 max-h-80 space-y-4 overflow-y-auto">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center gap-3"
          >
            <GameImage
              src={item.imageUrl}
              alt={`Capa de ${item.title}`}
              className="h-20 w-14 shrink-0 rounded-lg object-cover"
            />

            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-medium text-text-primary">
                {item.title}
              </h3>

              <p className="mt-1 text-sm text-text-muted">
                {formatCurrency(item.price)}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <div className="space-y-3 border-t border-border pt-5">
        <div className="flex justify-between text-sm">
          <span className="text-text-muted">
            Subtotal
          </span>

          <span className="text-text-secondary">
            {formatCurrency(totalAmount)}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-text-muted">
            Taxas
          </span>

          <span className="text-text-secondary">
            {formatCurrency(0)}
          </span>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-4">
          <span className="font-semibold">
            Total
          </span>

          <strong className="accent-text text-2xl">
            {formatCurrency(totalAmount)}
          </strong>
        </div>
      </div>

      <div className="mt-5 flex items-start gap-2 rounded-xl bg-background p-3">
        <ShieldCheck
          size={18}
          className="mt-0.5 shrink-0 text-success"
          aria-hidden="true"
        />

        <p className="text-xs leading-relaxed text-text-muted">
          {isConfirmed
            ? 'Valores confirmados pelo servidor.'
            : 'Os valores serão confirmados pelo servidor antes do pagamento.'}
          {' '}Nenhuma cobrança real será realizada.
        </p>
      </div>
    </aside>
  );
}