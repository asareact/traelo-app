"use client";

import Link from "next/link";
import { IconLink, IconWhatsapp, IconCheck } from "@/components/brand/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import type { KanbanPedido } from "@/features/admin/queries";

/**
 * One order on the board: client + contact, item/processing status, and the
 * "Procesar items" action. The card is draggable (the board wraps it) — moving
 * it to another column is what changes the order's state, Trello-style.
 */
export function KanbanCard({
  pedido,
  onProcess,
}: {
  pedido: KanbanPedido;
  onProcess: () => void;
}) {
  const idCorto = pedido.id.slice(0, 8);
  const digits = (pedido.cliente?.telefono ?? "").replace(/\D/g, "");
  const completo =
    pedido.total_items > 0 && pedido.items_procesados === pedido.total_items;

  return (
    <article className="rounded-2xl border border-border bg-bg p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-bold text-text">
            {pedido.cliente?.nombre || "Cliente"}
          </p>
          <p className="font-mono text-xs text-muted">#{idCorto}</p>
        </div>
        <Link
          href={`/pedidos/${pedido.id}`}
          target="_blank"
          aria-label="Abrir tracking"
          className="shrink-0 text-muted transition hover:text-primary"
        >
          <IconLink size={16} />
        </Link>
      </div>

      {digits.length >= 8 && (
        <a
          href={`https://wa.me/${digits}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-[#25D366]"
        >
          <IconWhatsapp size={14} />
          {pedido.cliente?.telefono}
        </a>
      )}

      <div className="mt-3 flex items-center justify-between rounded-xl bg-surface px-3 py-2">
        <span className="text-sm font-medium text-text">
          {pedido.total_items}{" "}
          {pedido.total_items === 1 ? "producto" : "productos"}
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-1 text-xs font-bold",
            completo ? "text-accent" : "text-warning",
          )}
        >
          {completo && <IconCheck size={13} />}
          {pedido.items_procesados}/{pedido.total_items} procesados
        </span>
      </div>

      <div className="mt-2 text-sm">
        <span className="text-muted">Total: </span>
        {pedido.total_real_usd != null ? (
          <span className="font-bold tabular-nums text-text">
            ${pedido.total_real_usd.toFixed(2)}
          </span>
        ) : (
          <span className="text-muted">sin precio</span>
        )}
      </div>

      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={onProcess}
        className="mt-3 w-full"
      >
        Procesar items
        {!completo && pedido.total_items > 0 && (
          <span className="ml-1 rounded-full bg-warning/15 px-1.5 text-xs font-bold text-warning">
            {pedido.total_items - pedido.items_procesados}
          </span>
        )}
      </Button>
    </article>
  );
}
