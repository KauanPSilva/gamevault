import {
  CheckCircle2,
  Clock3,
  XCircle,
  AlertCircle,
} from 'lucide-react';

import type { OrderStatus } from '../../../types/order';

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

const statusConfig = {
  PENDING: {
    label: 'Pendente',
    icon: Clock3,
    className: 'border-warning/20 bg-warning/10 text-warning',
  },
  PAID: {
    label: 'Pago',
    icon: CheckCircle2,
    className: 'border-success/20 bg-success/10 text-success',
  },
  CANCELLED: {
    label: 'Cancelado',
    icon: XCircle,
    className: 'border-border bg-background text-text-muted',
  },
  FAILED: {
    label: 'Não concluído',
    icon: AlertCircle,
    className: 'border-danger/20 bg-danger/10 text-danger',
  },
} as const;

export function OrderStatusBadge({
  status,
}: OrderStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${config.className}`}
    >
      <Icon size={14} aria-hidden="true" />
      {config.label}
    </span>
  );
}