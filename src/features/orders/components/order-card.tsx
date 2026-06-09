import Link from "next/link";
import { routes } from "@/config/site";
import { formatDate, formatUSD } from "@/lib/utils/format";
import { IconChevronRight } from "@/components/brand/icons";
import { EstadoBadge } from "@/features/orders/components/estado-badge";
import type { PedidoResumen } from "@/features/orders/queries";

/** Tappable summary row for the "my orders" list. */
export function OrderCard({ pedido }: { pedido: PedidoResumen }) {
  return (
    <Link
      href={routes.pedido(pedido.id)}
      className="flex items-center gap-3 rounded-lg border border-border bg-surface p-4 transition active:scale-[0.99]"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <EstadoBadge estado={pedido.estado_actual} />
          <span className="text-xs text-muted">
            {formatDate(pedido.created_at)}
          </span>
        </div>
        <p className="mt-1.5 text-sm font-medium text-text">
          {pedido.total_items}{" "}
          {pedido.total_items === 1 ? "producto" : "productos"}
          {pedido.total_real_usd !== null && (
            <span className="text-muted">
              {" · "}
              {formatUSD(pedido.total_real_usd)}
            </span>
          )}
        </p>
        <p className="mt-0.5 truncate font-mono text-xs text-muted">
          #{pedido.id.slice(0, 8)}
        </p>
      </div>
      <IconChevronRight size={20} className="shrink-0 text-muted" />
    </Link>
  );
}
