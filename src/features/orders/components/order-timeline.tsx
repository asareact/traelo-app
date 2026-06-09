import { ESTADO_LABEL, type Estado } from "@/features/orders/domain/estados";
import type { EstadoPedido } from "@/types/database";
import { formatDateTime } from "@/lib/utils/format";

/**
 * Chronological event log. We synthesize the "Pedido creado" entry from the
 * order's created_at (the COTIZACION milestone isn't written to history — it's
 * the implicit starting state), then list every admin transition.
 */
export function OrderTimeline({
  createdAt,
  historial,
}: {
  createdAt: string;
  historial: EstadoPedido[];
}) {
  const eventos = [
    { key: "creado", label: "Pedido creado", fecha: createdAt, nota: null as string | null },
    ...historial.map((h) => ({
      key: h.id,
      label: ESTADO_LABEL[h.estado as Estado] ?? h.estado,
      fecha: h.created_at,
      nota: h.nota,
    })),
  ];

  return (
    <ul className="flex flex-col gap-3">
      {eventos.map((e) => (
        <li key={e.key} className="flex gap-3 text-sm">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
          <div>
            <p className="font-medium text-text">{e.label}</p>
            {e.nota && <p className="text-muted">{e.nota}</p>}
            <p className="text-xs text-muted">{formatDateTime(e.fecha)}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
