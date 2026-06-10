/**
 * Admin Kanban domain — pure logic for the order board.
 *
 * Unlike the client UI, the admin sees the REAL internal states (the "no
 * casillero" rule is a client-only concern). Columns map 1:1 to states, in
 * workflow order, so "Avanzar" means "move to the next state".
 */

import { ESTADOS, type Estado } from "@/features/orders/domain/estados";

/** Admin-facing label for each internal state (honest, internal wording). */
export const ESTADO_ADMIN_LABEL: Record<Estado, string> = {
  COTIZACION: "Cotización",
  EN_REVISION: "En revisión",
  PRECIO_ACTUALIZADO: "Precio enviado",
  ACEPTADO: "Aceptado",
  PENDIENTE_PAGO: "Pendiente de pago",
  PAGADO: "Pagado",
  COMPRADO_SHEIN: "Comprado en SHEIN",
  EN_CAMINO_CASILLERO: "En camino al casillero",
  EN_CASILLERO: "En casillero (EE.UU.)",
  CONSOLIDANDO: "Consolidando",
  ENVIADO_CUBA: "Enviado a Cuba",
  EN_TRANSITO_INTERNO: "Tránsito interno (Cuba)",
  DISPONIBLE_ENTREGA: "Disponible para entrega",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

/**
 * The board columns, in order. CANCELADO is a terminal off-flow state — it's a
 * valid target (an order can be cancelled from anywhere) but it sits at the end
 * so it doesn't clutter the active pipeline.
 */
export const KANBAN_COLUMNS: readonly Estado[] = ESTADOS;

/** The linear pipeline (everything except the off-flow CANCELADO). */
const PIPELINE: readonly Estado[] = ESTADOS.filter((e) => e !== "CANCELADO");

/** The next state in the pipeline, or null at the end / for terminal states. */
export function siguienteEstado(estado: Estado): Estado | null {
  if (estado === "CANCELADO" || estado === "ENTREGADO") return null;
  const i = PIPELINE.indexOf(estado);
  if (i < 0 || i >= PIPELINE.length - 1) return null;
  return PIPELINE[i + 1];
}

/** Group orders into one bucket per state, preserving the column order. */
export function agruparPorEstado<T extends { estado_actual: Estado }>(
  pedidos: T[],
): Record<Estado, T[]> {
  const grupos = Object.fromEntries(
    KANBAN_COLUMNS.map((e) => [e, [] as T[]]),
  ) as Record<Estado, T[]>;
  for (const p of pedidos) (grupos[p.estado_actual] ??= []).push(p);
  return grupos;
}
