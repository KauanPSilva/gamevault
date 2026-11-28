import { CheckCircle2 } from 'lucide-react';

interface OwnedGameBadgeProps {
  className?: string;
}

export function OwnedGameBadge({
  className = '',
}: OwnedGameBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-black/80 px-3 py-1.5 text-xs font-semibold text-success backdrop-blur-md ${className}`}
    >
      <CheckCircle2 size={14} aria-hidden="true" />
      Na sua biblioteca
    </span>
  );
}