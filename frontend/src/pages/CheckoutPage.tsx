import { useRef, useState } from 'react';

import {
  Link,
  useSearchParams,
} from 'react-router-dom';

import {
  ArrowLeft,
  ArrowRight,
  LoaderCircle,
  ShieldCheck,
  ShoppingCart,
} from 'lucide-react';

import { useCart } from '../hooks/useCart';

import { getApiErrorMessage } from '../utils/api-error';

import {
  usePaymentGateways,
  useCreateOrder,
  useCreatePayment,
  usePayment,
  useSimulatePayment,
  useCheckGatewayStatus,
  useOrder,
} from '../features/checkout/checkout.hooks';

import {
  CheckoutSteps,
  type CheckoutStep,
} from '../features/checkout/components/CheckoutSteps';

import { OrderSummary } from '../features/checkout/components/OrderSummary';

import { GatewaySelector } from '../features/checkout/components/GatewaySelector';

import { PixPayment } from '../features/checkout/components/PixPayment';

import { PaymentResult } from '../features/checkout/components/PaymentResult';

import { GatewayStatusPanel } from '../features/checkout/components/GatewayStatusPanel';

import type { Order } from '../types/order';

import type {
  Payment,
  SimulationAction,
  GatewayPaymentStatus,
} from '../types/payment';


export function CheckoutPage() {
  const { items, subtotal, removeItem } = useCart();

  const [searchParams, setSearchParams] =
    useSearchParams();

  const orderId = searchParams.get('orderId') ?? '';

  const orderQuery = useOrder(orderId);

  const order: Order | null =
    orderQuery.data?.order ?? null;

  const [selectedCode, setSelectedCode] =
    useState('');

  const [serverError, setServerError] =
    useState('');

  const [isProcessing, setIsProcessing] =
    useState(false);

  const operationLock = useRef(false);

  const idempotencyKey = useRef<string | null>(null);

  const [attemptedGateway, setAttemptedGateway] =
  useState<string | null>(null);

  const gatewaysQuery = usePaymentGateways();

  const createOrderMutation = useCreateOrder();

  const createPaymentMutation = useCreatePayment();

  const simulatePaymentMutation =
    useSimulatePayment();

  const [gatewayStatus, setGatewayStatus] =
  useState<GatewayPaymentStatus | null>(null);

  const checkGatewayStatusMutation =
    useCheckGatewayStatus();

  const [createdPaymentId, setCreatedPaymentId] =
  useState('');

  const existingPaymentId =
    order?.payments[0]?.id ?? '';

  const paymentId =
    existingPaymentId || createdPaymentId;

  const paymentQuery = usePayment(paymentId);

  const payment: Payment | null =
    paymentQuery.data?.payment ?? null;

  const gateways = gatewaysQuery.data?.gateways ?? [];

  const gatewayCode =
    attemptedGateway ??
    (gateways.some(
        (gateway) => gateway.code === selectedCode,
    )
        ? selectedCode
        : gateways[0]?.code ?? '');

  const isFinalPayment =
    payment !== null &&
    !['PENDING', 'PROCESSING'].includes(payment.status);

  const currentStep: CheckoutStep = isFinalPayment
    ? 'confirmation'
    : payment
      ? 'payment'
      : 'order';

  const summaryItems = order
    ? order.items.map((item) => ({
        id: item.game.id,
        title: item.game.title,
        imageUrl: item.game.imageUrl,
        price: item.unitPrice,
      }))
    : items.map((item) => ({
        id: item.gameId,
        title: item.title,
        imageUrl: item.imageUrl,
        price: item.price,
      }));

  const totalAmount = order?.totalAmount ?? subtotal;

  function applyPayment(updatedPayment: Payment) {
      setCreatedPaymentId(updatedPayment.id);

      setGatewayStatus(null);

      if (
        updatedPayment.status === 'APPROVED' &&
        order
      ) {
        order.items.forEach((item) => {
          removeItem(item.game.id);
        });
      }
    }

  async function handleCreatePayment() {
    if (
      operationLock.current ||
      paymentId ||
      !gatewayCode ||
      (orderId && !order) ||
      (order && order.status !== 'PENDING') ||
      (!order && items.length === 0)
    ) {
      return;
    }

    operationLock.current = true;

    setIsProcessing(true);
    setServerError('');

    try {
      let currentOrder = order;

      if (!currentOrder) {
        const result =
          await createOrderMutation.mutateAsync({
            gameIds: items.map((item) => item.gameId),
          });

        currentOrder = result.order;

        setSearchParams(
          {
            orderId: currentOrder.id,
          },
          {
            replace: true,
          },
        );

        // Allow the customer to review the final
        // server-side prices before generating payment.
        return;
      }

      idempotencyKey.current ??= crypto.randomUUID();

      const paymentGatewayCode =
        attemptedGateway ?? gatewayCode;

    setAttemptedGateway(paymentGatewayCode);

    const result =
        await createPaymentMutation.mutateAsync({
            orderId: currentOrder.id,
            input: {
            gatewayCode: paymentGatewayCode,
            method: 'pix',
            idempotencyKey: idempotencyKey.current,
            },
        });

      applyPayment(result.payment);
    } catch (error) {
      setServerError(
        getApiErrorMessage(
          error,
          'Não foi possível iniciar o pagamento.',
        ),
      );
    } finally {
      operationLock.current = false;
      setIsProcessing(false);
    }
  }

  async function handleSimulate(
    action: SimulationAction,
  ) {
    if (
      operationLock.current ||
      !payment ||
      payment.status !== 'PENDING'
    ) {
      return;
    }

    operationLock.current = true;

    setIsProcessing(true);
    setServerError('');

    try {
      const result =
        await simulatePaymentMutation.mutateAsync({
          paymentId: payment.id,
          action,
        });

      applyPayment(result.payment);
    } catch (error) {
      setServerError(
        getApiErrorMessage(
          error,
          'Não foi possível concluir a simulação.',
        ),
      );

      // Recover the persisted state after an
      // uncertain gateway response.
      const result = await paymentQuery.refetch();

      if (!result.isError && result.data) {
        applyPayment(result.data.payment);
      }
    } finally {
      operationLock.current = false;
      setIsProcessing(false);
    }
  }

  async function handleCheckGatewayStatus() {
    if (
      operationLock.current ||
      !payment?.externalId
    ) {
      return;
    }

    operationLock.current = true;

    setIsProcessing(true);
    setServerError('');
    setGatewayStatus(null);

    try {
      const result =
        await checkGatewayStatusMutation.mutateAsync(
          payment.id,
        );

      setGatewayStatus(result.status);
    } catch (error) {
      setServerError(
        getApiErrorMessage(
          error,
          'Não foi possível consultar o gateway.',
        ),
      );
    } finally {
      operationLock.current = false;
      setIsProcessing(false);
    }
  }

  async function handleRefresh() {
    if (operationLock.current || !payment) {
      return;
    }

    operationLock.current = true;

    setIsProcessing(true);
    setServerError('');

    try {
      const result = await paymentQuery.refetch({
        throwOnError: true,
      });

      if (result.data) {
        applyPayment(result.data.payment);
      }
    } catch (error) {
      setServerError(
        getApiErrorMessage(
          error,
          'Não foi possível consultar o pagamento.',
        ),
      );
    } finally {
      operationLock.current = false;
      setIsProcessing(false);
    }
  }
  const isRestoringCheckout =
  Boolean(orderId && !order && orderQuery.isPending) ||
  Boolean(
    paymentId &&
    !payment &&
    paymentQuery.isPending,
  );

const hasRestoreError =
  Boolean(orderId && !order && orderQuery.isError) ||
  Boolean(
    paymentId &&
    !payment &&
    paymentQuery.isError,
  );

if (isRestoringCheckout) {
  return (
    <section
      role="status"
      className="mx-auto max-w-xl px-5 py-24 text-center"
    >
      <LoaderCircle
        size={40}
        className="accent-text mx-auto animate-spin"
        aria-hidden="true"
      />

      <h1 className="mt-6 text-2xl font-bold">
        Recuperando seu pedido
      </h1>

      <p className="mt-3 text-text-muted">
        Consultando os dados da sua compra...
      </p>
    </section>
  );
}

  if (hasRestoreError) {
    return (
      <section
        role="alert"
        className="mx-auto max-w-xl px-5 py-24 text-center"
      >
        <h1 className="text-2xl font-bold">
          Não foi possível recuperar o pedido
        </h1>

        <p className="mt-3 text-text-muted">
          Verifique sua conexão ou se o pedido
          pertence à sua conta.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (orderQuery.isError) {
                void orderQuery.refetch();
              } else {
                void paymentQuery.refetch();
              }
            }}
            className="accent-button rounded-xl px-6 py-3 font-semibold"
          >
            Tentar novamente
          </button>

          <Link
            to="/cart"
            className="rounded-xl border border-border px-6 py-3"
          >
            Voltar ao carrinho
          </Link>
        </div>
      </section>
    );
  }

  if (!order && !payment && items.length === 0) {
    return (
      <section className="mx-auto max-w-xl px-5 py-24 text-center">
        <ShoppingCart
          size={64}
          className="mx-auto text-text-muted"
          aria-hidden="true"
        />

        <h1 className="mt-6 text-3xl font-bold">
          Seu carrinho está vazio
        </h1>

        <p className="mt-3 text-text-muted">
          Adicione jogos antes de finalizar sua compra.
        </p>

        <Link
          to="/"
          className="accent-button mt-8 inline-flex rounded-xl px-6 py-3 font-semibold"
        >
          Explorar jogos
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8 lg:py-14">
      {!order && (
        <Link
          to="/cart"
          className="mb-6 inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary"
        >
          <ArrowLeft size={16} />

          Voltar ao carrinho
        </Link>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold sm:text-4xl">
            Finalizar compra
          </h1>

          <p className="mt-2 text-sm text-text-muted">
            Sua próxima aventura começa aqui.
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm text-success">
          <ShieldCheck size={20} />

          Ambiente seguro de demonstração
        </div>
      </div>

      <div className="my-8 rounded-2xl border border-border bg-surface p-4 sm:p-6">
        <CheckoutSteps currentStep={currentStep} />
      </div>

      {serverError && (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger"
        >
          {serverError}
        </div>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0">
          {payment ? (
            isFinalPayment ? (
              <PaymentResult payment={payment} />
            ) : (
              <PixPayment
                payment={payment}
                isProcessing={isProcessing}
                onSimulate={handleSimulate}
                onRefresh={handleRefresh}
              />
            )
          ) : (
            <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
              {gatewaysQuery.isPending ? (
                <div
                  role="status"
                  className="flex items-center gap-3 py-8 text-text-muted"
                >
                  <LoaderCircle
                    size={22}
                    className="animate-spin"
                  />

                  Carregando formas de pagamento...
                </div>
              ) : gatewaysQuery.isError ? (
                <div role="alert">
                  <p className="text-danger">
                    Não foi possível carregar os gateways.
                  </p>

                  <button
                    type="button"
                    onClick={() => gatewaysQuery.refetch()}
                    className="mt-4 rounded-xl border border-border px-4 py-2 text-sm"
                  >
                    Tentar novamente
                  </button>
                </div>
              ) : (
                <>
                  <GatewaySelector
                    gateways={gateways}
                    selectedCode={gatewayCode}
                    onSelect={setSelectedCode}
                    disabled={
                      isProcessing ||
                      Boolean(attemptedGateway)
                    }
                  />

                  {order && (
                    <div className="mt-6 rounded-xl border border-success/30 bg-success/10 p-4 text-sm text-success">
                      Pedido criado. Confira o valor
                      confirmado antes de gerar o PIX.
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={
                      isProcessing ||
                      !gatewayCode
                    }
                    onClick={handleCreatePayment}
                    className="accent-button mt-8 flex w-full items-center justify-center gap-3 rounded-xl px-5 py-4 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <LoaderCircle
                          size={20}
                          className="animate-spin"
                        />

                        Processando...
                      </>
                    ) : (
                      <>
                        {order
                          ? 'Gerar pagamento PIX'
                          : 'Confirmar pedido'}

                        <ArrowRight size={20} />
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          )}
          {payment?.externalId && (
            <GatewayStatusPanel
              status={gatewayStatus}
              isProcessing={isProcessing}
              onCheck={handleCheckGatewayStatus}
            />
          )}
        </div>

        <OrderSummary
          items={summaryItems}
          totalAmount={totalAmount}
          isConfirmed={Boolean(order)}
        />
      </div>
    </section>
  );
}

