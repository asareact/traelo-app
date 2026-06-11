import Link from "next/link";
import { IconChevronRight, IconTruck } from "@/components/brand/icons";
import { cn } from "@/lib/utils/cn";
import { routes } from "@/config/site";
import { resumenEstado } from "@/features/orders/domain/estados";
import type { PedidoResumen } from "@/features/orders/queries";

/**
 * Prominent "your current order" card for the home — answers the client's #1
 * question ("where's my order?") at a glance. When the price is ready
 * (PRECIO_ACTUALIZADO) it turns into a call to accept the price (drives payment).
 */
export function ActiveOrderCard({ pedido }: { pedido: PedidoResumen }) {
  const { label } = resumenEstado(pedido.estado_actual);
  const precioListo = pedido.estado_actual === "PRECIO_ACTUALIZADO";

  return (
    <Link
      href={routes.pedido(pedido.id)}
      className={cn(
        "mb-6 block rounded-[24px] border p-5 transition active:scale-[0.98]",
        precioListo
          ? "border-primary/50 bg-primary/[0.07]"
          : "border-border bg-surface",
      )}
    >
      <div className="flex items-center gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <IconTruck size={22} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-xs font-bold text-muted">
            Tu pedido #{pedido.id.slice(0, 8)}
          </p>
          <p className="mt-0.5 text-lg font-bold leading-tight text-text">
            {precioListo ? "¡Tu precio está listo!" : label}
          </p>
          <p className="mt-0.5 text-sm text-muted">
            {precioListo
              ? "Revísalo y acéptalo para seguir"
              : `${pedido.total_items} ${pedido.total_items === 1 ? "producto" : "productos"}`}
          </p>
        </div>
        <IconChevronRight size={20} className="shrink-0 text-muted" />
      </div>
    </Link>
  );
}
