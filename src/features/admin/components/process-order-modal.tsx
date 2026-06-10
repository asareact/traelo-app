"use client";

import { Modal } from "@/components/ui/modal";
import type { KanbanPedido } from "@/features/admin/queries";
import { ItemProcessForm } from "./item-process-form";

/**
 * Per-order processing modal: lists every item in the order, each with its own
 * "process" form (paste-curl extraction + manual fields). Opens when `pedido`
 * is non-null. Wider than the default modal since this is an admin/desktop view.
 */
export function ProcessOrderModal({
  pedido,
  siteUrl,
  onClose,
  onNotifyPrice,
}: {
  pedido: KanbanPedido | null;
  siteUrl?: string | null;
  onClose: () => void;
  onNotifyPrice: () => void;
}) {
  return (
    <Modal open={pedido != null} onClose={onClose} className="sm:max-w-2xl">
      {pedido && (
        <div className="flex max-h-[80vh] flex-col">
          <header className="mb-1 flex items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-bold text-text">
                Procesar pedido
              </h2>
              <p className="text-sm text-muted">
                {pedido.cliente?.nombre || "Cliente"} · #
                {pedido.id.slice(0, 8)} · {pedido.total_items}{" "}
                {pedido.total_items === 1 ? "producto" : "productos"}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="shrink-0 rounded-full px-2 text-2xl leading-none text-muted hover:text-text"
            >
              ×
            </button>
          </header>

          {siteUrl && (
            <a
              href={`${siteUrl}/pedidos/${pedido.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-3 text-xs font-medium text-primary hover:underline"
            >
              Ver tracking del cliente →
            </a>
          )}

          <div className="-mx-1 flex flex-col gap-4 overflow-y-auto px-1 pt-1">
            {pedido.items.map((item, i) => (
              <ItemProcessForm key={item.id} item={item} index={i} />
            ))}
          </div>

          {/* If the price changed (SHEIN varies day to day), notify the client. */}
          <div className="mt-4 border-t border-border pt-4">
            <button
              type="button"
              onClick={onNotifyPrice}
              className="w-full rounded-full border-[1.5px] border-border bg-bg px-5 py-2.5 text-sm font-bold text-text transition hover:bg-surface"
            >
              Avisar cambio de precio al cliente
            </button>
            <p className="mt-1.5 text-center text-xs text-muted">
              Úsalo si el precio cambió respecto a la cotización anterior.
            </p>
          </div>
        </div>
      )}
    </Modal>
  );
}
