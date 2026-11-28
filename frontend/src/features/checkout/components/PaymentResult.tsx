import { Link } from 'react-router-dom';

import {
  CheckCircle2,
  XCircle,
  CircleMinus,
  LibraryBig,
  ReceiptText,
  ArrowRight,
  ShoppingCart,
  Store,
} from 'lucide-react';

import type { Payment } from '../../../types/payment';

import { formatCurrency } from '../../../utils/currency';

interface PaymentResultProps {
  payment: Payment;
}

export function PaymentResult({
  payment,
}: PaymentResultProps) {
  const isApproved = payment.status === 'APPROVED';

  const isCancelled =
    payment.status === 'CANCELLED';

  const result = isApproved
    ? {
        icon: CheckCircle2,
        title: 'Compra realizada com sucesso!',
        description:
          'Seus novos jogos já estão disponíveis na sua biblioteca. Prepare-se para sua próxima aventura!',
        color: 'text-success',
        background: 'bg-success/10',
        statusLabel: 'Aprovado',
      }
    : isCancelled
      ? {
          icon: CircleMinus,
          title: 'Pagamento cancelado',
          description:
            'Sua transação foi cancelada. Você pode retornar ao carrinho e iniciar uma nova compra.',
          color: 'text-warning',
          background: 'bg-warning/10',
          statusLabel: 'Cancelado',
        }
      : {
          icon: XCircle,
          title: 'Pagamento não concluído',
          description:
            'Não foi possível concluir sua compra. Você pode retornar ao carrinho e tentar novamente.',
          color: 'text-danger',
          background: 'bg-danger/10',
          statusLabel: 'Não concluído',
        };

  const ResultIcon = result.icon;

  return (
    <section className="rounded-2xl border border-border bg-surface p-6 sm:p-10">
      <div
        role="status"
        className="text-center"
      >
        <div
          className={`
            mx-auto flex h-24 w-24
            items-center justify-center
            rounded-full
            ${result.background}
          `}
        >
          <ResultIcon
            size={52}
            className={result.color}
            aria-hidden="true"
          />
        </div>

        <h2 className="mt-6 text-2xl font-bold sm:text-3xl">
          {result.title}
        </h2>

        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-text-muted">
          {result.description}
        </p>
      </div>

      <div className="mt-8 space-y-4 rounded-xl border border-border bg-background p-5">
        <div className="flex items-center gap-2">
          <ReceiptText
            size={18}
            className="text-text-muted"
            aria-hidden="true"
          />

          <h3 className="font-semibold">
            Detalhes da transação
          </h3>
        </div>

        <dl className="space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-text-muted">
              Status
            </dt>

            <dd className={`font-medium ${result.color}`}>
              {result.statusLabel}
            </dd>
          </div>

          <div className="flex justify-between gap-4">
            <dt className="text-text-muted">
              Valor
            </dt>

            <dd className="font-semibold">
              {formatCurrency(payment.amount)}
            </dd>
          </div>

          <div className="flex justify-between gap-4">
            <dt className="text-text-muted">
              Gateway
            </dt>

            <dd>{payment.gateway.name}</dd>
          </div>

          <div className="flex justify-between gap-4">
            <dt className="text-text-muted">
              Método
            </dt>

            <dd>PIX</dd>
          </div>

          <div className="flex justify-between gap-4">
            <dt className="text-text-muted">
              Ambiente
            </dt>

            <dd>Sandbox</dd>
          </div>

          {payment.paidAt && (
            <div className="flex justify-between gap-4">
              <dt className="text-text-muted">
                Confirmado em
              </dt>

              <dd className="text-right">
                {new Date(
                  payment.paidAt,
                ).toLocaleString('pt-BR')}
              </dd>
            </div>
          )}

          <div className="border-t border-border pt-3">
            <dt className="text-xs text-text-muted">
              Identificador da transação
            </dt>

            <dd className="mt-1 break-all font-mono text-xs text-text-secondary">
              {payment.id}
            </dd>
          </div>
        </dl>
      </div>

      <div className="mt-8 space-y-3">
        {isApproved ? (
          <Link
            to="/library"
            className="accent-button flex w-full items-center justify-center gap-2 rounded-xl px-5 py-4 font-semibold"
          >
            <LibraryBig size={20} />

            Acessar minha biblioteca

            <ArrowRight size={18} />
          </Link>
        ) : (
          <Link
            to="/cart"
            className="accent-button flex w-full items-center justify-center gap-2 rounded-xl px-5 py-4 font-semibold"
          >
            <ShoppingCart size={20} />

            Voltar ao carrinho
          </Link>
        )}

        <Link
          to="/"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-medium text-text-secondary transition-colors hover:bg-elevated"
        >
          <Store size={18} />

          Continuar explorando a loja
        </Link>
      </div>

      <p className="mt-6 text-center text-xs text-text-muted">
        Transação demonstrativa. Nenhum valor real
        foi cobrado.
      </p>
    </section>
  );
}