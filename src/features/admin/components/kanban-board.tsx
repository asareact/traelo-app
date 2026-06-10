"use client";

import { useState } from "react";
import { IconBox } from "@/components/brand/icons";
import type { KanbanPedido } from "@/features/admin/queries";
import {
  agruparPorEstado,
  KANBAN_COLUMNS,
  ESTADO_ADMIN_LABEL,
} from "@/features/admin/domain/kanban";
import { KanbanCard } from "./kanban-card";
import { ProcessOrderModal } from "./process-order-modal";

/**
 * The admin board. Renders one column per state that currently has orders
 * (empty columns are hidden to keep the pipeline focused), with horizontal
 * scroll on narrow viewports. Clicking "Procesar items" on a card opens the
 * per-order processing modal. `import type` keeps server-only queries out of
 * the bundle.
 */
export function KanbanBoard({
  pedidos,
  siteUrl,
}: {
  pedidos: KanbanPedido[];
  siteUrl?: string | null;
}) {
  const [activo, setActivo] = useState<KanbanPedido | null>(null);
  const grupos = agruparPorEstado(pedidos);
  const columnas = KANBAN_COLUMNS.filter((e) => grupos[e].length > 0);

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
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columnas.map((estado) => (
          <section key={estado} className="w-[300px] shrink-0">
            <div className="mb-3 flex items-center justify-between px-1">
              <h2 className="text-sm font-bold text-text">
                {ESTADO_ADMIN_LABEL[estado]}
              </h2>
              <span className="rounded-full bg-surface px-2 py-0.5 text-xs font-bold tabular-nums text-muted">
                {grupos[estado].length}
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {grupos[estado].map((pedido) => (
                <KanbanCard
                  key={pedido.id}
                  pedido={pedido}
                  onProcess={() => setActivo(pedido)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      <ProcessOrderModal
        pedido={activo}
        siteUrl={siteUrl}
        onClose={() => setActivo(null)}
      />
    </>
  );
}
