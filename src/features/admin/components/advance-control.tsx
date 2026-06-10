"use client";

import { useActionState } from "react";
import { advanceOrderState, type AdminActionState } from "@/features/admin/actions";
import {
  ESTADO_ADMIN_LABEL,
  KANBAN_COLUMNS,
  siguienteEstado,
} from "@/features/admin/domain/kanban";
import type { Estado } from "@/features/orders/domain/estados";

/**
 * Compact state mover on each card. Defaults the select to the next state in
 * the pipeline; the admin can pick any state (including CANCELADO). Submits to
 * the atomic `advanceOrderState` action, which appends to the order history.
 */
export function AdvanceControl({
  pedidoId,
  estadoActual,
}: {
  pedidoId: string;
  estadoActual: Estado;
}) {
  const [state, action, pending] = useActionState<AdminActionState, FormData>(
    advanceOrderState,
    {},
  );
  const next = siguienteEstado(estadoActual);

  return (
    <form action={action} className="mt-3 border-t border-border pt-3">
      <input type="hidden" name="pedidoId" value={pedidoId} />
      <div className="flex items-center gap-2">
        <select
          name="nuevoEstado"
          defaultValue={next ?? estadoActual}
          className="min-w-0 flex-1 rounded-lg border-[1.5px] border-border bg-bg px-2 py-1.5 text-xs font-medium text-text focus:border-primary focus:outline-none"
        >
          {KANBAN_COLUMNS.map((e) => (
            <option key={e} value={e}>
              {ESTADO_ADMIN_LABEL[e]}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "…" : "Mover"}
        </button>
      </div>
      {state.error && (
        <p className="mt-1.5 text-xs font-medium text-error">{state.error}</p>
      )}
    </form>
  );
}
