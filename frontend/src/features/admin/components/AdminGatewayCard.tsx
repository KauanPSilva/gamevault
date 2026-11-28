import {
  CreditCard,
  CheckCircle2,
  CircleOff,
  ShieldCheck,
  Plug,
  Power,
  LoaderCircle,
} from 'lucide-react';

import type { AdminGateway } from '../../../types/admin';

interface AdminGatewayCardProps {
  gateway: AdminGateway;
  isUpdating: boolean;
  disabled?: boolean;
  onToggle: (gateway: AdminGateway) => void;
}

export function AdminGatewayCard({
  gateway,
  isUpdating,
  disabled = false,
  onToggle,
}: AdminGatewayCardProps) {
  const canToggle =
    gateway.isActive || gateway.isImplemented;

  const formattedDate = new Intl.DateTimeFormat(
    'pt-BR',
    {
      dateStyle: 'medium',
      timeStyle: 'short',
    },
  ).format(new Date(gateway.updatedAt));

  return (
    <article className="flex h-full flex-col rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <div className="flex flex-wrap items-start gap-4">
        <div className="rounded-xl border border-primary/20 bg-primary/10 p-4 text-primary">
          <CreditCard size={28} aria-hidden="true" />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-xl font-bold text-text-primary">
            {gateway.name}
          </h3>

          <p className="mt-1 break-all font-mono text-xs text-text-muted">
            {gateway.code}
          </p>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${
            gateway.isActive
              ? 'border-success/20 bg-success/10 text-success'
              : 'border-border bg-elevated text-text-muted'
          }`}
        >
          {gateway.isActive ? (
            <CheckCircle2 size={14} aria-hidden="true" />
          ) : (
            <CircleOff size={14} aria-hidden="true" />
          )}

          {gateway.isActive ? 'Ativo' : 'Inativo'}
        </span>
      </div>

      <p className="mt-5 text-sm leading-relaxed text-text-secondary">
        {gateway.description ??
          'Nenhuma descrição disponível.'}
      </p>

      <dl className="my-6 space-y-4 border-y border-border py-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <dt className="flex items-center gap-2 text-sm text-text-muted">
            <Plug size={16} aria-hidden="true" />
            Integração
          </dt>

          <dd
            className={`text-sm font-medium ${
              gateway.isImplemented
                ? 'text-success'
                : 'text-warning'
            }`}
          >
            {gateway.isImplemented
              ? 'Implementada'
              : 'Não implementada'}
          </dd>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <dt className="flex items-center gap-2 text-sm text-text-muted">
            <ShieldCheck
              size={16}
              aria-hidden="true"
            />
            Ambiente
          </dt>

          <dd className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold uppercase text-primary">
            {gateway.environment}
          </dd>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <dt className="text-sm text-text-muted">
            Última atualização
          </dt>

          <dd className="text-sm text-text-secondary">
            {formattedDate}
          </dd>
        </div>
      </dl>

      <div className="mt-auto">
        {!canToggle && (
          <p className="mb-3 text-xs leading-relaxed text-warning">
            Este gateway precisa de uma integração
            implementada antes de ser ativado.
          </p>
        )}

        <button
          type="button"
          disabled={
            disabled || isUpdating || !canToggle
          }
          onClick={() => onToggle(gateway)}
          className={`flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
            gateway.isActive
              ? 'border-danger/30 bg-danger/5 text-danger hover:bg-danger/10'
              : 'border-success/30 bg-success/5 text-success hover:bg-success/10'
          }`}
        >
          {isUpdating ? (
            <LoaderCircle
              size={18}
              className="animate-spin"
              aria-hidden="true"
            />
          ) : (
            <Power size={18} aria-hidden="true" />
          )}

          {isUpdating
            ? 'Atualizando...'
            : gateway.isActive
              ? 'Desativar gateway'
              : 'Ativar gateway'}
        </button>
      </div>
    </article>
  );
}