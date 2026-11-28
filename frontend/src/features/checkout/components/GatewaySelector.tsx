import {
  Check,
  Wallet,
  ShieldCheck,
} from 'lucide-react';

import type {
  PaymentGateway,
} from '../../../types/payment';

interface GatewaySelectorProps {
  gateways: PaymentGateway[];
  selectedCode: string;
  onSelect: (code: string) => void;
  disabled?: boolean;
}

export function GatewaySelector({
  gateways,
  selectedCode,
  onSelect,
  disabled = false,
}: GatewaySelectorProps) {
  return (
    <fieldset disabled={disabled}>
      <legend className="text-xl font-semibold text-text-primary">
        Gateway de pagamento
      </legend>

      <p className="mt-2 text-sm text-text-muted">
        Escolha o provedor responsável por processar
        seu pagamento.
      </p>

      {gateways.length === 0 ? (
        <p
          role="alert"
          className="mt-5 rounded-xl border border-warning/30 bg-warning/10 p-4 text-sm text-warning"
        >
          Nenhum gateway de pagamento disponível
          no momento.
        </p>
      ) : (
        <div className="mt-5 space-y-3">
          {gateways.map((gateway) => {
            const isSelected =
              selectedCode === gateway.code;

            return (
              <label
                key={gateway.code}
                className={`
                  flex cursor-pointer items-center
                  gap-4 rounded-xl border p-4
                  transition-colors
                  ${
                    isSelected
                      ? 'accent-border bg-elevated'
                      : 'border-border bg-background hover:bg-elevated'
                  }
                  ${
                    disabled
                      ? 'cursor-not-allowed opacity-60'
                      : ''
                  }
                `}
              >
                <input
                  type="radio"
                  name="payment-gateway"
                  value={gateway.code}
                  checked={isSelected}
                  onChange={() => onSelect(gateway.code)}
                  className="sr-only peer"
                />

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface peer-focus-visible:ring-2 peer-focus-visible:ring-primary">
                  <Wallet
                    size={23}
                    className={
                      isSelected
                        ? 'accent-text'
                        : 'text-text-muted'
                    }
                    aria-hidden="true"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <span className="font-semibold text-text-primary">
                    {gateway.name}
                  </span>

                  <p className="mt-1 text-xs text-text-muted">
                    {gateway.description ??
                      'Provedor de pagamento'}
                  </p>
                </div>

                {isSelected && (
                  <Check
                    size={20}
                    className="accent-text shrink-0"
                    aria-hidden="true"
                  />
                )}
              </label>
            );
          })}
        </div>
      )}

      <div className="mt-5 flex items-center gap-2 text-xs text-text-muted">
        <ShieldCheck
          size={16}
          className="text-success"
          aria-hidden="true"
        />

        Ambiente sandbox — transações simuladas.
      </div>
    </fieldset>
  );
}