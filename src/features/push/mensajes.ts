/**
 * Push payload builders — pure (no I/O), so they're easy to test. Short title +
 * body + a deep link + a group tag; the service worker (public/sw.js) renders
 * them. Same client-facing rules as the WhatsApp copy: no "casillero", no SHEIN
 * links, and no technical order ids in the copy (meaningless to the client).
 */
import { ESTADO_LABEL, type Estado } from "@/features/orders/domain/estados";
import { NOTIF_ESTADO } from "@/features/orders/domain/notificaciones";

export interface PushPayload {
  title: string;
  body: string;
  /** Deep link opened when the notification is tapped (or "Ver pedido"). */
  url: string;
  /** Group key: a newer notification with the same tag replaces the previous
   *  one (per order), so updates don't pile up in the tray. */
  tag?: string;
}

/** CLIENT: the order advanced to a new state. Reuses the per-state copy. */
export function pushCambioEstado(pedidoId: string, estado: Estado): PushPayload {
  return {
    title: "Traelo",
    body: NOTIF_ESTADO[estado] ?? `Tu pedido pasó a: ${ESTADO_LABEL[estado]}.`,
    url: `/pedidos/${pedidoId}`,
    tag: pedidoId,
  };
}

/** CLIENT: the package was weighed → the final shipping cost + total is ready. */
export function pushPeso(pedidoId: string, totalUsd: number | null): PushPayload {
  const total = totalUsd != null ? ` Total a pagar: $${totalUsd.toFixed(2)}.` : "";
  return {
    title: "Traelo · Costo de envío listo",
    body: `Ya pesamos tu paquete y tenemos el costo final.${total} Toca para ver el detalle.`,
    url: `/pedidos/${pedidoId}`,
    tag: pedidoId,
  };
}

/** CLIENT: the price changed on an already-quoted order. */
export function pushPrecioCambio(pedidoId: string): PushPayload {
  return {
    title: "Traelo · Precio actualizado",
    body: "El precio de tu pedido cambió. Toca para revisarlo y confirmar.",
    url: `/pedidos/${pedidoId}`,
    tag: pedidoId,
  };
}

/** ADMIN: a client just placed a new order. */
export function pushNuevoPedido(
  pedidoId: string,
  cliente: string | null,
  numProductos: number,
): PushPayload {
  const quien = cliente?.trim() || "Un cliente";
  return {
    title: "Nuevo pedido",
    body: `${quien} hizo un pedido (${numProductos} producto${numProductos === 1 ? "" : "s"}).`,
    url: "/admin/kanban",
    tag: pedidoId,
  };
}

/** CLIENT: reminder that an order is still awaiting payment (cron). */
export function pushPagoRecordatorio(pedidoId: string): PushPayload {
  return {
    title: "Traelo · Pago pendiente",
    body: "Tu pedido sigue esperando el pago. Págalo y lo compramos en SHEIN enseguida.",
    url: `/pedidos/${pedidoId}`,
    tag: pedidoId,
  };
}

/** CLIENT: reminder that an order is ready for pickup (cron). */
export function pushRecogidaRecordatorio(pedidoId: string): PushPayload {
  return {
    title: "Traelo · Listo para recoger",
    body: "Tu pedido te está esperando. Pasa a recogerlo cuando puedas.",
    url: `/pedidos/${pedidoId}`,
    tag: pedidoId,
  };
}

/** ADMIN: a client edited their order (it went back to cotización to re-quote). */
export function pushPedidoEditado(
  pedidoId: string,
  cliente: string | null,
): PushPayload {
  const quien = cliente?.trim() || "Un cliente";
  return {
    title: "Pedido editado",
    body: `${quien} editó su pedido. Hay que revisar el precio.`,
    url: "/admin/kanban",
    tag: pedidoId,
  };
}
