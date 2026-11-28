import {
  RefreshCw,
  Server,
  LoaderCircle,
  Info,
} from 'lucide-react';

import type {
  GatewayPaymentStatus,
} from '../../../types/payment';

interface GatewayStatusPanelProps {
  status: GatewayPaymentStatus | null;
  isProcessing: boolean;
  onCheck: () => void;
}

export function GatewayStatusPanel({
  status,
  isProcessing,
  onCheck,
}: GatewayStatusPanelProps) {
  return (
    <section className="mt-6 rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <Server
          size={22}
          className="accent-text"
          aria-hidden="true"
        />

        <h2 className="font-semibold">
          Consulta ao gateway
        </h2>
      </div>

      <p className="mt-2 text-sm text-text-muted">
        Consulte diretamente o provedor de pagamento
        para verificar a resposta da integração.
      </p>

      <button
        type="button"
        disabled={isProcessing}
        onClick={onCheck}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium hover:bg-elevated disabled:opacity-50"
      >
        {isProcessing ? (
          <LoaderCircle
            size={17}
            className="animate-spin"
          />
        ) : (
          <RefreshCw size={17} />
        )}

        Consultar status no gateway
      </button>

      {status && (
        <div
          role="status"
          className="mt-5 space-y-4"
        >
          <dl className="space-y-3 rounded-xl bg-background p-4 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-text-muted">
                Status na GameVault
              </dt>

              <dd className="font-mono font-medium">
                {status.localStatus}
              </dd>
            </div>

            <div className="flex justify-between gap-3">
              <dt className="text-text-muted">
                Status no gateway
              </dt>

              <dd className="font-mono font-medium">
                {status.gatewayStatus.toUpperCase()}
              </dd>
            </div>

            <div className="border-t border-border pt-3">
              <dt className="text-xs text-text-muted">
                Identificador externo
              </dt>

              <dd className="mt-1 break-all font-mono text-xs">
                {status.externalId}
              </dd>
            </div>

            <div className="border-t border-border pt-3">
              <dt className="text-xs text-text-muted">
                Última consulta
              </dt>

              <dd className="mt-1 text-xs">
                {new Date(
                  status.checkedAt,
                ).toLocaleString('pt-BR')}
              </dd>
            </div>
          </dl>

          <div className="flex items-start gap-2 rounded-xl border border-primary/20 bg-primary/5 p-3">
            <Info
              size={18}
              className="mt-0.5 shrink-0 text-primary"
            />

            <p className="text-xs leading-relaxed text-text-muted">
              O gateway sandbox pode retornar estados
              demonstrativos diferentes dos estados
              persistidos pela GameVault. A consulta
              não altera o resultado da compra.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}