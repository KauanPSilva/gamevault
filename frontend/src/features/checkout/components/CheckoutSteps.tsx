import { Check } from 'lucide-react';

export type CheckoutStep =
  | 'order'
  | 'payment'
  | 'confirmation';

interface CheckoutStepsProps {
  currentStep: CheckoutStep;
}

const steps = [
  {
    id: 'order',
    label: 'Pedido',
  },
  {
    id: 'payment',
    label: 'Pagamento',
  },
  {
    id: 'confirmation',
    label: 'Confirmação',
  },
] as const;

export function CheckoutSteps({
  currentStep,
}: CheckoutStepsProps) {
  const currentIndex = steps.findIndex(
    (step) => step.id === currentStep,
  );

  return (
    <nav aria-label="Etapas da compra">
      <ol className="flex items-center">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <li
              key={step.id}
              aria-current={
                isCurrent ? 'step' : undefined
              }
              className="flex flex-1 items-center last:flex-none"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`
                    flex h-9 w-9 shrink-0
                    items-center justify-center
                    rounded-full border
                    text-sm font-semibold
                    transition-colors
                    ${
                      isCompleted
                        ? 'border-success bg-success/10 text-success'
                        : isCurrent
                          ? 'accent-border accent-text bg-surface'
                          : 'border-border bg-surface text-text-muted'
                    }
                  `}
                >
                  {isCompleted ? (
                    <Check
                      size={17}
                      aria-hidden="true"
                    />
                  ) : (
                    index + 1
                  )}
                </span>

                <span
                  className={`
                    text-xs font-medium sm:text-sm
                    ${
                      isCompleted
                        ? 'text-success'
                        : isCurrent
                          ? 'accent-text'
                          : 'text-text-muted'
                    }
                  `}
                >
                  {step.label}
                </span>
              </div>

              {index < steps.length - 1 && (
                <div
                  aria-hidden="true"
                  className={`
                    mx-2 h-px flex-1 sm:mx-5
                    ${
                      isCompleted
                        ? 'bg-success'
                        : 'bg-border'
                    }
                  `}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}