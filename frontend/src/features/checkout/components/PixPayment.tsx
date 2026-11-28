import { useState } from 'react';

import {
  Copy,
  Check,
  X,
  Clock,
  LoaderCircle,
  Wallet,
  ShieldAlert,
  RefreshCw,
} from 'lucide-react';

import type {
  Payment,
  SimulationAction,
} from '../../../types/payment';

import { formatCurrency } from '../../../utils/currency';

interface PixPaymentProps {
  payment: Payment;
  isProcessing: boolean;
  onSimulate: (action: SimulationAction) => void;
  onRefresh: () => void;
}

export function PixPayment({
  payment,
  isProcessing,
  onSimulate,
  onRefresh,
}: PixPaymentProps) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  const canSimulate =
    payment.status === 'PENDING' &&
    payment.simulated &&
    Boolean(payment.externalId) &&
    !isProcessing;

  async function handleCopy() {
    if (!payment.pixCode) return;

    try {
      await navigator.clipboard.writeText(
        payment.pixCode,
      );

      setCopied(true);
      setCopyError(false);
    } catch {
      setCopied(false);
      setCopyError(true);
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-elevated">
          <Wallet
            size={28}
            className="accent-text"
            aria-hidden="true"
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold">
            Pagamento via PIX
          </h2>

          <p className="mt-1 text-sm text-text-muted">
            Processado por {payment.gateway.name}
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-warning/30 bg-warning/10 p-4">
        <div className="flex items-center gap-2 text-warning">
          <ShieldAlert size={18} aria-hidden="true" />

          <strong className="text-sm">
            Pagamento simulado
          </strong>
        </div>

        <p className="mt-2 text-xs leading-relaxed text-text-secondary">
          Este código PIX é fictício e não pode ser
          utilizado em aplicativos bancários.
          Nenhum dinheiro real será movimentado.
        </p>
      </div>

      <div className="my-6 text-center">
        <p className="text-sm text-text-muted">
          Valor do pagamento
        </p>

        <strong className="accent-text mt-2 block text-4xl">
          {formatCurrency(payment.amount)}
        </strong>

        <div
          role="status"
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-warning/10 px-4 py-2 text-sm text-warning"
        >
          <Clock size={16} aria-hidden="true" />

          {payment.status === 'PROCESSING'
            ? 'Processamento em andamento'
            : 'Aguardando pagamento'}
        </div>
      </div>

      {payment.pixCode && (
        <div>
          <label
            htmlFor="pix-code"
            className="text-sm font-medium"
          >
            PIX copia e cola
          </label>

          <div className="mt-2 flex gap-2">
            <input
              id="pix-code"
              readOnly
              value={payment.pixCode}
              onFocus={(event) =>
                event.currentTarget.select()
              }
              className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-3 font-mono text-xs text-text-secondary"
            />

            <button
              type="button"
              onClick={handleCopy}
              className="rounded-xl border border-border bg-elevated px-4 hover:border-primary"
              aria-label="Copiar código PIX"
            >
              {copied ? (
                <Check
                  size={18}
                  className="text-success"
                />
              ) : (
                <Copy size={18} />
              )}
            </button>
          </div>

          {copied && (
            <p
              role="status"
              className="mt-2 text-xs text-success"
            >
              Código copiado!
            </p>
          )}

          {copyError && (
            <p
              role="alert"
              className="mt-2 text-xs text-danger"
            >
              Não foi possível copiar automaticamente.
              Selecione e copie o código manualmente.
            </p>
          )}
        </div>
      )}

      <div className="mt-8 border-t border-border pt-6">
        <h3 className="font-semibold">
          Simulador de pagamento
        </h3>

        <p className="mt-2 text-sm text-text-muted">
          Selecione o resultado da transação para
          demonstrar a integração com o gateway.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            disabled={!canSimulate}
            onClick={() => onSimulate('approve')}
            className="flex items-center justify-center gap-2 rounded-xl bg-success px-4 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isProcessing ? (
              <LoaderCircle
                size={18}
                className="animate-spin"
              />
            ) : (
              <Check size={18} />
            )}

            Simular aprovação
          </button>

          <button
            type="button"
            disabled={!canSimulate}
            onClick={() => onSimulate('decline')}
            className="flex items-center justify-center gap-2 rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm font-semibold text-danger hover:bg-danger/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={18} />

            Simular recusa
          </button>
        </div>

        <button
          type="button"
          disabled={!canSimulate}
          onClick={() => onSimulate('cancel')}
          className="mt-3 w-full rounded-xl border border-border px-4 py-3 text-sm text-text-muted hover:bg-elevated disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancelar pagamento
        </button>

        <button
          type="button"
          disabled={isProcessing}
          onClick={onRefresh}
          className="mx-auto mt-5 flex items-center gap-2 text-sm text-text-muted hover:text-text-primary disabled:opacity-50"
        >
          <RefreshCw size={15} />

          Atualizar status
        </button>
      </div>
    </section>
  );
}