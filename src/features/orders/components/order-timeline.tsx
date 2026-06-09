import { ESTADO_LABEL, type Estado } from "@/features/orders/domain/estados";
import type { EstadoPedido } from "@/types/database";
import { formatDateTime } from "@/lib/utils/format";
import { IconCheck, IconPlus } from "@/components/brand/icons";
import { cn } from "@/lib/utils/cn";

/**
 * Event log, newest first. We synthesize the "Pedido creado" entry from the
 * order's created_at (COTIZACION isn't written to history — it's the implicit
 * starting state), then list every admin transition. The most recent event is
 * highlighted; older ones are muted.
 */
export function OrderTimeline({
  createdAt,
  historial,
}: {
  createdAt: string;
  historial: EstadoPedido[];
}) {
  const cronologico = [
    {
      key: "creado",
      label: "Pedido creado",
      fecha: createdAt,
      nota: "Recibimos tu solicitud." as string | null,
    },
    ...historial.map((h) => ({
      key: h.id,
      label: ESTADO_LABEL[h.estado as Estado] ?? h.estado,
      fecha: h.created_at,
      nota: h.nota,
    })),
  ];
  const eventos = [...cronologico].reverse(); // newest first

  return (
    <ul className="flex flex-col gap-5">
      {eventos.map((e, i) => {
        const latest = i === 0;
        const last = i === eventos.length - 1;

        return (
          <li key={e.key} className="flex gap-4">
            <span
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                latest ? "bg-primary text-white" : "bg-surface text-muted",
              )}
            >
              {latest ? <IconCheck size={16} /> : <IconPlus size={15} />}
            </span>
            <div className={cn("flex-1", !last && "border-b border-border pb-4")}>
              <p
                className={cn(
                  "text-sm font-bold",
                  latest ? "text-text" : "text-muted",
                )}
              >
                {e.label}
              </p>
              <p className="mt-1 text-xs text-muted">
                {formatDateTime(e.fecha)}
                {e.nota ? ` · ${e.nota}` : ""}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
