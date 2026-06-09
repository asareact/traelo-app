import Link from "next/link";
import { routes } from "@/config/site";
import { cn } from "@/lib/utils/cn";
import { formatRelativeDate } from "@/lib/utils/format";
import { IconChevronRight } from "@/components/brand/icons";
import { resumenEstado } from "@/features/orders/domain/estados";
import type { PedidoResumen } from "@/features/orders/queries";

/**
 * Tappable order summary card. Shows the order's milestone (terracotta) or a
 * muted terminal state, a friendly date, the item count, and the short id.
 * Shared across the dashboard, /pedidos and /rastreo.
 */
export function OrderCard({ pedido }: { pedido: PedidoResumen }) {
  const { label, terminal } = resumenEstado(pedido.estado_actual);

  return (
    <Link
      href={routes.pedido(pedido.id)}
      className={cn(
        "flex items-center justify-between gap-3 rounded-[28px] border border-border bg-surface p-6 transition active:scale-[0.98]",
        terminal && "opacity-70",
      )}
    >
      <div className="min-w-0 space-y-1.5">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider",
              terminal
                ? "bg-muted/15 text-muted"
                : "bg-primary/10 text-primary",
            )}
          >
            {label}
          </span>
          <span className="text-xs text-muted">
            {formatRelativeDate(pedido.created_at)}
          </span>
        </div>
        <p className="text-lg font-bold text-text">
          {pedido.total_items}{" "}
          {pedido.total_items === 1 ? "producto" : "productos"}
        </p>
        <p className="font-mono text-sm text-muted">#{pedido.id.slice(0, 8)}</p>
      </div>
      <IconChevronRight size={20} className="shrink-0 text-muted" />
    </Link>
  );
}
