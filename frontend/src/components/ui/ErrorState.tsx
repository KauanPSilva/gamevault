import {
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Algo deu errado',
  message = 'Não foi possível carregar os dados.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center rounded-xl border border-border bg-surface px-6 py-12 text-center"
    >
      <AlertCircle
        size={40}
        className="mb-4 text-danger"
      />

      <h2 className="text-xl font-semibold">
        {title}
      </h2>

      <p className="mt-2 text-sm text-text-muted">
        {message}
      </p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="accent-button mt-6 flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold"
        >
          <RefreshCw size={16} />
          Tentar novamente
        </button>
      )}
    </div>
  );
}