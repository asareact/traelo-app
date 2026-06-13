"use client";

import Link from "next/link";
import { FileText } from "lucide-react";
import { IconLink, IconWhatsapp, IconCheck } from "@/components/brand/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { permitePeso } from "@/features/orders/domain/estados";
import { aplicaExpress, type TipoEnvio } from "@/features/orders";
import { permiteFactura } from "@/features/invoice/domain/factura";
import type { KanbanPedido } from "@/features/admin/queries";

/**
 * One order on the board: client + contact, status, and the primary action —
 * "Procesar items" early on, or "Registrar peso" once the package is at the US
 * casillero (see permitePeso). Draggable (the board wraps it): moving it to
 * another column changes the order's state, Trello-style.
 */
export function KanbanCard({
  pedido,
  onProcess,
  onWeigh,
  onSetTipoEnvio,
}: {
  pedido: KanbanPedido;
  onProcess: () => void;
  onWeigh: () => void;
  /** Switch the order between standard and express (recomputes the total). */
  onSetTipoEnvio: (tipo: TipoEnvio) => void;
}) {
  const idCorto = pedido.id.slice(0, 8);
  const digits = (pedido.cliente?.telefono ?? "").replace(/\D/g, "");
  const completo =
    pedido.total_items > 0 && pedido.items_procesados === pedido.total_items;
  const pesar = permitePeso(pedido.estado_actual);
  // Express can be chosen once the package is weighed at 10+ lb.
  const puedeExpress = aplicaExpress(pedido.peso_lb);
  const esExpress = pedido.tipo_envio === "express";
  // Invoice can be generated once the client has paid (PAGADO onward).
  const puedeFacturar = permiteFactura(pedido.estado_actual);

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

      <div className="mt-2 flex items-center justify-between text-sm">
        <span>
          <span className="text-muted">Total: </span>
          {pedido.total_real_usd != null ? (
            <span className="font-bold tabular-nums text-text">
              ${pedido.total_real_usd.toFixed(2)}
            </span>
          ) : (
            <span className="text-muted">sin precio</span>
          )}
        </span>
        {pedido.peso_lb != null && (
          <span className="font-bold tabular-nums text-accent">
            {pedido.peso_lb} lb
            {esExpress && (
              <span className="ml-1 rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                Express
              </span>
            )}
          </span>
        )}
      </div>

      {/* Shipping type — appears once the order is weighed at 10+ lb. Flipping to
          Express recomputes the total (the client accepted the upgrade). */}
      {puedeExpress && (
        <div className="mt-2 flex items-center gap-1 rounded-xl bg-surface p-1">
          <span className="px-1.5 text-[10px] font-bold uppercase tracking-wide text-muted">
            Envío
          </span>
          {(["estandar", "express"] as const).map((t) => {
            const activo = pedido.tipo_envio === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => !activo && onSetTipoEnvio(t)}
                className={cn(
                  "flex-1 rounded-lg px-2 py-1 text-xs font-bold capitalize transition",
                  activo
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted hover:text-text",
                )}
              >
                {t === "estandar" ? "Estándar" : "Express"}
              </button>
            );
          })}
        </div>
      )}

      {pesar ? (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onWeigh}
          className="mt-3 w-full"
        >
          {pedido.peso_lb != null ? "Editar peso" : "Registrar peso"}
        </Button>
      ) : (
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
      )}

      {puedeFacturar && (
        <a
          href={`/api/admin/factura/${pedido.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-border bg-surface py-2 text-xs font-bold text-text transition hover:text-primary active:scale-[0.98]"
        >
          <FileText size={14} />
          Generar factura
        </a>
      )}
    </article>
  );
}
