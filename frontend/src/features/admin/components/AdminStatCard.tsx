import type { LucideIcon } from 'lucide-react';

interface AdminStatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  variant?: 'default' | 'success' | 'muted';
}

const variantStyles = {
  default: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  muted: 'bg-white/5 text-text-muted',
};

export function AdminStatCard({
  label,
  value,
  icon: Icon,
  variant = 'default',
}: AdminStatCardProps) {
  return (
    <article className="rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-primary/30">
      <div className="flex items-center justify-between gap-3">
        <div
          className={`rounded-xl p-3 ${variantStyles[variant]}`}
        >
          <Icon size={22} aria-hidden="true" />
        </div>
      </div>

      <p className="mt-5 text-sm font-medium text-text-muted">
        {label}
      </p>

      <p className="mt-1 text-3xl font-bold tabular-nums text-text-primary">
        {value}
      </p>
    </article>
  );
}