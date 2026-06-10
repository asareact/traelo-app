import type { KanbanStats } from "@/features/admin/queries";

/**
 * Stats strip above the board. `import type` keeps the server-only queries
 * module out of any bundle (the type is erased at compile time).
 */
export function StatsBar({ stats }: { stats: KanbanStats }) {
  const cells: { label: string; value: number; accent?: boolean }[] = [
    { label: "Pedidos totales", value: stats.total },
    { label: "En revisión", value: stats.enRevision, accent: true },
    { label: "Items sin procesar", value: stats.sinProcesar, accent: true },
    { label: "Entregados", value: stats.entregados },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cells.map((c) => (
        <div
          key={c.label}
          className="rounded-2xl border border-border bg-surface px-4 py-3"
        >
          <div className="font-display text-2xl font-bold tabular-nums text-text">
            {c.value}
          </div>
          <div className="mt-0.5 text-xs font-medium text-muted">{c.label}</div>
        </div>
      ))}
    </div>
  );
}
