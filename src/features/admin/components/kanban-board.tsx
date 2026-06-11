"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconBox } from "@/components/brand/icons";
import { cn } from "@/lib/utils/cn";
import type { Estado } from "@/features/orders/domain/estados";
import {
  mensajeCambioEstado,
  mensajePrecioCambio,
  nombreProductoEs,
  linkRastreo,
  totalProductos,
} from "@/features/orders";
import { advanceOrderState } from "@/features/admin/actions";
import type { KanbanPedido } from "@/features/admin/queries";
import {
  agruparPorEstado,
  KANBAN_COLUMNS,
  ESTADO_ADMIN_LABEL,
} from "@/features/admin/domain/kanban";
import { KanbanCard } from "./kanban-card";
import { ProcessOrderModal } from "./process-order-modal";
import { NotifyClientModal, type NotifyData } from "./notify-client-modal";
import { WeightModal } from "./weight-modal";

/** Map an order's items to the product lines used in client messages. */
function productosDe(pedido: KanbanPedido) {
  return pedido.items.map((it) => ({
    nombre: it.producto_nombre || nombreProductoEs(it.shein_url) || "Producto",
    talla: it.talla,
    color: it.color,
    cantidad: it.cantidad,
  }));
}

/**
 * Cost fields for the client message. `total_real_usd` already includes shipping
 * once the package is weighed, so the shipping line is just total − subtotal (no
 * need for the per-pound rate here). Subtotal/envío stay null until both numbers
 * are known, in which case the message shows the plain value instead of a split.
 */
function desgloseCosto(pedido: KanbanPedido) {
  const valorUsd = pedido.total_real_usd;
  const productosUsd = totalProductos(pedido.items);
  const envioUsd =
    valorUsd != null && productosUsd != null
      ? Number(Math.max(0, valorUsd - productosUsd).toFixed(2))
      : null;
  return { valorUsd, productosUsd, envioUsd };
}

/**
 * Trello-style admin board: ONE column per state (always shown, even empty),
 * horizontal scroll. Drag a card to another column to move the order to that
 * state — the drop fires the atomic `advanceOrderState` action. The move is
 * optimistic (the card jumps immediately) and reverts if the server rejects it.
 */
export function KanbanBoard({
  pedidos,
  siteUrl,
}: {
  pedidos: KanbanPedido[];
  siteUrl?: string | null;
}) {
  const router = useRouter();
  const [activo, setActivo] = useState<KanbanPedido | null>(null);
  const [pesando, setPesando] = useState<KanbanPedido | null>(null);
  // Optional WhatsApp notification to the client (state change / price change).
  const [notify, setNotify] = useState<NotifyData | null>(null);
  // Optimistic state overrides while a drag-move is in flight / settled.
  const [overrides, setOverrides] = useState<Record<string, Estado>>({});
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<Estado | null>(null);
  const [error, setError] = useState("");

  const effective = pedidos.map((p) =>
    overrides[p.id] ? { ...p, estado_actual: overrides[p.id] } : p,
  );
  const grupos = agruparPorEstado(effective);

  async function move(pedidoId: string, nuevoEstado: Estado) {
    const card = effective.find((p) => p.id === pedidoId);
    if (!card || card.estado_actual === nuevoEstado) return;

    setError("");
    setOverrides((o) => ({ ...o, [pedidoId]: nuevoEstado })); // optimistic
    const fd = new FormData();
    fd.set("pedidoId", pedidoId);
    fd.set("nuevoEstado", nuevoEstado);

    const res = await advanceOrderState({}, fd);
    if (res?.error) {
      setOverrides((o) => {
        const next = { ...o };
        delete next[pedidoId];
        return next;
      });
      setError(res.error);
    } else {
      router.refresh(); // resync with the server (props will agree)
      // Offer to notify the client of the change (optional).
      const moved = { ...card, estado_actual: nuevoEstado };
      setNotify({
        titulo: "Avisar al cliente",
        subtitulo: `Movido a ${ESTADO_ADMIN_LABEL[nuevoEstado]}`,
        telefono: moved.cliente?.telefono,
        mensaje: mensajeCambioEstado({
          idCorto: moved.id.slice(0, 8),
          estado: nuevoEstado,
          nombreCliente: moved.cliente?.nombre,
          productos: productosDe(moved),
          trackingUrl: linkRastreo(siteUrl, moved.id),
          ...desgloseCosto(moved),
          pesoLb: moved.peso_lb,
        }),
      });
    }
  }

  /** Build + open the price-change notification for an order (latest props). */
  function notificarPrecio(pedidoId: string) {
    const pedido = pedidos.find((p) => p.id === pedidoId);
    if (!pedido) return;
    setNotify({
      titulo: "Avisar cambio de precio",
      subtitulo: `Pedido #${pedido.id.slice(0, 8)}`,
      telefono: pedido.cliente?.telefono,
      mensaje: mensajePrecioCambio({
        idCorto: pedido.id.slice(0, 8),
        nombreCliente: pedido.cliente?.nombre,
        productos: productosDe(pedido),
        trackingUrl: linkRastreo(siteUrl, pedido.id),
        valorUsd: pedido.total_real_usd,
      }),
    });
  }

  if (pedidos.length === 0) {
    return (
      <div className="mt-16 flex flex-col items-center text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-surface text-muted">
          <IconBox size={26} />
        </span>
        <p className="mt-4 font-display text-lg font-bold text-text">
          Aún no hay pedidos
        </p>
        <p className="mt-1 max-w-xs text-sm text-muted">
          Cuando un cliente envíe su primer pedido, aparecerá aquí para procesar.
        </p>
      </div>
    );
  }

  return (
    <>
      {error && (
        <p className="rounded-lg bg-error/10 px-3 py-2 text-sm font-medium text-error">
          {error}
        </p>
      )}

      <div className="flex gap-3 overflow-x-auto pb-4">
        {KANBAN_COLUMNS.map((estado) => {
          const cards = grupos[estado];
          const isOver = overCol === estado;
          return (
            <section
              key={estado}
              onDragOver={(e) => {
                e.preventDefault();
                if (overCol !== estado) setOverCol(estado);
              }}
              onDragLeave={() =>
                setOverCol((c) => (c === estado ? null : c))
              }
              onDrop={(e) => {
                e.preventDefault();
                setOverCol(null);
                if (dragId) move(dragId, estado);
                setDragId(null);
              }}
              className={cn(
                "w-[288px] shrink-0 rounded-2xl border p-2.5 transition",
                isOver
                  ? "border-primary/50 bg-primary/[0.06] ring-2 ring-primary/30"
                  : "border-transparent bg-surface/40",
              )}
            >
              <div className="mb-2.5 flex items-center justify-between px-1">
                <h2 className="text-sm font-bold text-text">
                  {ESTADO_ADMIN_LABEL[estado]}
                </h2>
                <span className="rounded-full bg-surface px-2 py-0.5 text-xs font-bold tabular-nums text-muted">
                  {cards.length}
                </span>
              </div>

              <div className="flex min-h-[64px] flex-col gap-2.5">
                {cards.map((pedido) => (
                  <div
                    key={pedido.id}
                    draggable
                    onDragStart={(e) => {
                      setDragId(pedido.id);
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    onDragEnd={() => {
                      setDragId(null);
                      setOverCol(null);
                    }}
                    className={cn(
                      "cursor-grab active:cursor-grabbing",
                      dragId === pedido.id && "opacity-40",
                    )}
                  >
                    <KanbanCard
                      pedido={pedido}
                      onProcess={() => setActivo(pedido)}
                      onWeigh={() => setPesando(pedido)}
                    />
                  </div>
                ))}
                {cards.length === 0 && (
                  <div className="rounded-xl border border-dashed border-border/60 py-5 text-center text-xs text-muted/70">
                    Arrastra aquí
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>

      <ProcessOrderModal
        pedido={activo}
        siteUrl={siteUrl}
        onClose={() => setActivo(null)}
        onNotifyPrice={() => {
          const id = activo?.id;
          setActivo(null);
          if (id) notificarPrecio(id);
        }}
      />

      <NotifyClientModal data={notify} onClose={() => setNotify(null)} />

      <WeightModal pedido={pesando} onClose={() => setPesando(null)} />
    </>
  );
}
