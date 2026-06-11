/**
 * Orders state machine — the single source of truth for order status.
 *
 * Two layers:
 *  1. ESTADOS         — the 15 internal states the admin moves an order through.
 *  2. MILESTONES      — the 6 client-facing phases shown on the tracking UI.
 *
 * Business rule (hard): the client must NEVER see that we use a US "casillero"
 * via a third party. Internal states like EN_CASILLERO map to neutral
 * client-facing copy ("Recibido en EE.UU."). Keep that mapping here.
 */

export const ESTADOS = [
  "COTIZACION",
  "EN_REVISION",
  "PRECIO_ACTUALIZADO",
  "ACEPTADO",
  "PENDIENTE_PAGO",
  "PAGADO",
  "COMPRADO_SHEIN",
  "EN_CAMINO_CASILLERO",
  "EN_CASILLERO",
  "CONSOLIDANDO",
  "ENVIADO_CUBA",
  "EN_TRANSITO_INTERNO",
  "DISPONIBLE_ENTREGA",
  "ENTREGADO",
  "CANCELADO",
] as const;

export type Estado = (typeof ESTADOS)[number];

/** Short client-facing label for a single state. NO "casillero" wording. */
export const ESTADO_LABEL: Record<Estado, string> = {
  COTIZACION: "Cotización",
  EN_REVISION: "En revisión",
  PRECIO_ACTUALIZADO: "Precio actualizado",
  ACEPTADO: "Aceptado",
  PENDIENTE_PAGO: "Pendiente de pago",
  PAGADO: "Pagado",
  COMPRADO_SHEIN: "Comprado en SHEIN",
  EN_CAMINO_CASILLERO: "En camino a EE.UU.",
  EN_CASILLERO: "Recibido en EE.UU.",
  CONSOLIDANDO: "Preparando envío",
  ENVIADO_CUBA: "Enviado a Cuba",
  EN_TRANSITO_INTERNO: "En tránsito interno",
  DISPONIBLE_ENTREGA: "Disponible para entrega",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

export const ESTADO_INICIAL: Estado = "COTIZACION";

/** Terminal states have no outgoing transitions. */
export const ESTADOS_TERMINALES: readonly Estado[] = ["ENTREGADO", "CANCELADO"];

export function esTerminal(estado: Estado): boolean {
  return ESTADOS_TERMINALES.includes(estado);
}

/**
 * Whether the CLIENT may still edit or delete their own order. Allowed during
 * the whole quote phase (before they accept/pay): COTIZACION, EN_REVISION and
 * PRECIO_ACTUALIZADO. From ACEPTADO onward it's locked. Editing after the admin
 * has priced it invalidates that work, so the order is sent back to COTIZACION
 * (handled in the `updateOrder` action). CANCELADO/ENTREGADO are not editable.
 */
export function permiteEdicionCliente(estado: Estado): boolean {
  return (
    estado === "COTIZACION" ||
    estado === "EN_REVISION" ||
    estado === "PRECIO_ACTUALIZADO"
  );
}

/**
 * Whether the admin can register the package weight + evidence for an order:
 * from when it's received at the US casillero (EN_CASILLERO) onward. Before that
 * the package hasn't arrived to be weighed; CANCELADO is excluded.
 */
export function permitePeso(estado: Estado): boolean {
  if (estado === "CANCELADO") return false;
  return ESTADOS.indexOf(estado) >= ESTADOS.indexOf("EN_CASILLERO");
}

// ─────────────────────────────────────────────────────────────
// Client-facing milestones — the 6-step journey shown on tracking.
// Each internal state maps to exactly one milestone.
// ─────────────────────────────────────────────────────────────

export const MILESTONES = [
  "cotizacion",
  "pago",
  "compra",
  "preparacion",
  "transito",
  "entrega",
] as const;

export type Milestone = (typeof MILESTONES)[number];

export const MILESTONE_LABEL: Record<Milestone, string> = {
  cotizacion: "Cotización",
  pago: "Pago",
  compra: "Compra",
  preparacion: "Preparando envío",
  transito: "Rumbo a Cuba",
  entrega: "Entrega",
};

export const MILESTONE_DESC: Record<Milestone, string> = {
  cotizacion: "Revisamos tus productos y confirmamos el precio final.",
  pago: "Aceptas el precio y completas el pago.",
  compra: "Compramos tus productos en SHEIN.",
  preparacion: "Tu pedido llegó a EE.UU. y lo preparamos para el envío.",
  transito: "Tu pedido va en camino a Cuba.",
  entrega: "Tu pedido está listo para que lo recojas.",
};

/** Internal state → client milestone. */
const ESTADO_A_MILESTONE: Record<Estado, Milestone> = {
  COTIZACION: "cotizacion",
  EN_REVISION: "cotizacion",
  PRECIO_ACTUALIZADO: "cotizacion",
  ACEPTADO: "pago",
  PENDIENTE_PAGO: "pago",
  PAGADO: "pago",
  COMPRADO_SHEIN: "compra",
  EN_CAMINO_CASILLERO: "preparacion",
  EN_CASILLERO: "preparacion",
  CONSOLIDANDO: "preparacion",
  ENVIADO_CUBA: "transito",
  EN_TRANSITO_INTERNO: "transito",
  DISPONIBLE_ENTREGA: "entrega",
  ENTREGADO: "entrega",
  CANCELADO: "cotizacion", // off-track; UI renders cancelled state separately
};

export function milestoneDe(estado: Estado): Milestone {
  return ESTADO_A_MILESTONE[estado];
}

/** Index (0-5) of the current milestone — drives the progress bar. */
export function milestoneIndex(estado: Estado): number {
  return MILESTONES.indexOf(milestoneDe(estado));
}

/** True once a given milestone has been reached or passed. */
export function milestoneAlcanzado(estadoActual: Estado, m: Milestone): boolean {
  return milestoneIndex(estadoActual) >= MILESTONES.indexOf(m);
}

/**
 * Compact status for order summaries (list cards): terminal states keep their
 * own label and are flagged so the UI can mute them; everything else collapses
 * to its client-facing milestone label.
 */
export function resumenEstado(estado: Estado): {
  label: string;
  terminal: boolean;
} {
  if (estado === "ENTREGADO") return { label: "Entregado", terminal: true };
  if (estado === "CANCELADO") return { label: "Cancelado", terminal: true };
  return { label: MILESTONE_LABEL[milestoneDe(estado)], terminal: false };
}
