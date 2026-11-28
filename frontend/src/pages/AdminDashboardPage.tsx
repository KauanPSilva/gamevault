import { useState } from 'react';

import {
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  CircleOff,
  Plug,
  AlertTriangle,
  RefreshCw,
  LoaderCircle,
} from 'lucide-react';

import {
  useAdminGateways,
  useUpdateGatewayStatus,
} from '../features/admin/admin.hooks';

import { AdminStatCard } from '../features/admin/components/AdminStatCard';
import { AdminGatewayCard } from '../features/admin/components/AdminGatewayCard';
import { ErrorState } from '../components/ui/ErrorState';
import { getApiErrorMessage } from '../utils/api-error';

import type { AdminGateway } from '../types/admin';

export function AdminDashboardPage() {
  const gatewaysQuery = useAdminGateways();
  const updateMutation = useUpdateGatewayStatus();

  const [successMessage, setSuccessMessage] =
    useState('');

  const [errorMessage, setErrorMessage] =
    useState('');

  const gateways = gatewaysQuery.data?.gateways ?? [];

  const activeCount = gateways.filter(
    (gateway) => gateway.isActive,
  ).length;

  const inactiveCount =
    gateways.length - activeCount;

  const implementedCount = gateways.filter(
    (gateway) => gateway.isImplemented,
  ).length;

  async function handleToggleGateway(
    gateway: AdminGateway,
  ) {
    if (updateMutation.isPending) {
      return;
    }

    const nextStatus = !gateway.isActive;

    const confirmed = window.confirm(
      nextStatus
        ? `Deseja ativar o gateway ${gateway.name}?`
        : `Deseja desativar o gateway ${gateway.name}? Novos pagamentos não poderão utilizar esta integração.`,
    );

    if (!confirmed) {
      return;
    }

    setSuccessMessage('');
    setErrorMessage('');

    try {
      const result =
        await updateMutation.mutateAsync({
          gatewayId: gateway.id,
          input: {
            isActive: nextStatus,
          },
        });

      setSuccessMessage(
        `${result.gateway.name} ${
          result.gateway.isActive
            ? 'ativado'
            : 'desativado'
        } com sucesso.`,
      );
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          'Não foi possível atualizar o gateway.',
        ),
      );

      void gatewaysQuery.refetch();
    }
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-5 py-10 lg:px-10 lg:py-14">
      <header className="mb-10">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
          <ShieldCheck size={16} aria-hidden="true" />
          Área administrativa
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
          Painel administrativo
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-text-muted sm:text-base">
          Gerencie as integrações de pagamento e
          controle os gateways disponíveis no
          checkout do GameVault.
        </p>
      </header>

      <div className="mb-8 flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
        <ShieldCheck
          size={22}
          className="shrink-0 text-primary"
          aria-hidden="true"
        />

        <div>
          <p className="text-sm font-semibold text-primary">
            Ambiente sandbox
          </p>

          <p className="mt-1 text-sm text-text-secondary">
            Todas as operações são realizadas em
            ambiente de testes. Nenhuma cobrança
            real será efetuada.
          </p>
        </div>
      </div>

      {gatewaysQuery.isPending ? (
        <div
          role="status"
          aria-label="Carregando painel administrativo"
          className="flex min-h-64 items-center justify-center"
        >
          <LoaderCircle
            size={32}
            className="animate-spin text-primary"
            aria-hidden="true"
          />
        </div>
      ) : gatewaysQuery.isError ? (
        <ErrorState
          title="Não foi possível carregar os gateways"
          message="Verifique sua conexão e tente novamente."
          onRetry={() => void gatewaysQuery.refetch()}
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <AdminStatCard
              label="Gateways cadastrados"
              value={gateways.length}
              icon={CreditCard}
            />

            <AdminStatCard
              label="Gateways ativos"
              value={activeCount}
              icon={CheckCircle2}
              variant="success"
            />

            <AdminStatCard
              label="Gateways inativos"
              value={inactiveCount}
              icon={CircleOff}
              variant="muted"
            />

            <AdminStatCard
              label="Integrações implementadas"
              value={implementedCount}
              icon={Plug}
            />
          </div>

          {activeCount === 0 && (
            <div
              role="alert"
              className="mt-6 flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/5 p-4"
            >
              <AlertTriangle
                size={22}
                className="shrink-0 text-warning"
                aria-hidden="true"
              />

              <div>
                <p className="text-sm font-semibold text-warning">
                  Nenhum gateway ativo
                </p>

                <p className="mt-1 text-sm text-text-secondary">
                  Novos pagamentos estão
                  indisponíveis até que um gateway
                  seja ativado.
                </p>
              </div>
            </div>
          )}

          <div className="mb-6 mt-10 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-text-primary">
                Gateways de pagamento
              </h2>

              <p className="mt-1 text-sm text-text-muted">
                Gerencie as integrações cadastradas.
              </p>
            </div>

            <button
              type="button"
              disabled={
                gatewaysQuery.isFetching ||
                updateMutation.isPending
              }
              onClick={() => {
                setSuccessMessage('');
                setErrorMessage('');
                void gatewaysQuery.refetch();
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={
                  gatewaysQuery.isFetching
                    ? 'animate-spin'
                    : ''
                }
                aria-hidden="true"
              />

              Atualizar
            </button>
          </div>

          {successMessage && (
            <div
              role="status"
              className="mb-6 flex items-center gap-3 rounded-xl border border-success/30 bg-success/5 p-4 text-sm text-success"
            >
              <CheckCircle2
                size={20}
                aria-hidden="true"
              />

              {successMessage}
            </div>
          )}

          {errorMessage && (
            <div
              role="alert"
              className="mb-6 flex items-center gap-3 rounded-xl border border-danger/30 bg-danger/5 p-4 text-sm text-danger"
            >
              <AlertTriangle
                size={20}
                aria-hidden="true"
              />

              {errorMessage}
            </div>
          )}

          {gateways.length === 0 ? (
            <div className="rounded-2xl border border-border bg-surface p-10 text-center">
              <CreditCard
                size={40}
                className="mx-auto mb-4 text-text-muted"
                aria-hidden="true"
              />

              <h3 className="text-lg font-semibold text-text-primary">
                Nenhum gateway cadastrado
              </h3>

              <p className="mt-2 text-sm text-text-muted">
                As integrações cadastradas serão
                exibidas aqui.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {gateways.map((gateway) => (
                <AdminGatewayCard
                  key={gateway.id}
                  gateway={gateway}
                  disabled={updateMutation.isPending}
                  isUpdating={
                    updateMutation.isPending &&
                    updateMutation.variables
                      ?.gatewayId === gateway.id
                  }
                  onToggle={handleToggleGateway}
                />
              ))}
            </div>
          )}

          <div className="mt-10 rounded-xl border border-border bg-surface/50 p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-text-primary">
              <Plug
                size={18}
                className="text-primary"
                aria-hidden="true"
              />

              Arquitetura extensível
            </h3>

            <p className="mt-2 text-sm leading-relaxed text-text-muted">
              O GameVault utiliza uma arquitetura
              modular de gateways de pagamento.
              Novas integrações podem ser
              implementadas através de adapters,
              sem alterar o fluxo principal de
              checkout.
            </p>
          </div>
        </>
      )}
    </section>
  );
}