import type { Metadata } from "next";
import { StatsBar, KanbanBoard } from "@/features/admin";
import { getKanbanPedidos, statsDe } from "@/features/admin/queries";
import { env } from "@/lib/env";

export const metadata: Metadata = { title: "Kanban — Traelo Admin" };

/** The admin board: stats strip + columns of orders grouped by state. */
export default async function KanbanPage() {
  const pedidos = await getKanbanPedidos();
  const stats = statsDe(pedidos);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-text">Pedidos</h1>
        <p className="mt-1 text-sm text-muted">
          Procesa los items y mueve cada pedido por el flujo.
        </p>
      </div>

      <StatsBar stats={stats} />
      <KanbanBoard
        pedidos={pedidos}
        siteUrl={env.NEXT_PUBLIC_SITE_URL ?? null}
      />
    </div>
  );
}
