import {
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  disabled?: boolean;
  onPageChange: (page: number) => void;
}

export function Pagination({
  page,
  totalPages,
  disabled = false,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const buttonClass =
    'flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-elevated disabled:cursor-not-allowed disabled:opacity-30';

  return (
    <nav
      aria-label="Paginação do catálogo"
      className="mt-8 flex flex-wrap items-center justify-center gap-4"
    >
      <button
        type="button"
        disabled={disabled || page <= 1}
        onClick={() => onPageChange(page - 1)}
        className={buttonClass}
      >
        <ChevronLeft size={18} />
        Anterior
      </button>

      <span
        aria-live="polite"
        className="text-sm text-text-muted"
      >
        Página{' '}
        <strong className="accent-text">
          {page}
        </strong>{' '}
        de {totalPages}
      </span>

      <button
        type="button"
        disabled={disabled || page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className={buttonClass}
      >
        Próxima
        <ChevronRight size={18} />
      </button>
    </nav>
  );
}