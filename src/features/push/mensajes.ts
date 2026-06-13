/**
 * Push payload builders — pure (no I/O), so they're easy to test. Short title +
 * body + a deep link; the service worker (public/sw.js) renders them. Same
 * client-facing rules as the WhatsApp copy: no "casillero", no SHEIN links.
 */
import {
  ESTADO_LABEL,
  type Estado,
} from "@/features/orders/domain/estados";
import { NOTIF_ESTADO } from "@/features/orders/domain/notificaciones";

export interface PushPayload {
  title: string;
  body: string;
  /** Deep link opened when the notification is tapped. */
  url: string;
}

const corto = (id: string) => id.slice(0, 8).toUpperCase();

/** CLIENT: the order advanced to a new state. Reuses the per-state copy. */
export function pushCambioEstado(pedidoId: string, estado: Estado): PushPayload {
  return {
    title: `Traelo · Pedido #${corto(pedidoId)}`,
    body: NOTIF_ESTADO[estado] ?? `Tu pedido pasó a: ${ESTADO_LABEL[estado]}.`,
    url: `/pedidos/${pedidoId}`,
  };
}

/** CLIENT: the package was weighed → the final shipping cost + total is ready. */
export function pushPeso(pedidoId: string, totalUsd: number | null): PushPayload {
  const total = totalUsd != null ? ` Total a pagar: $${totalUsd.toFixed(2)}.` : "";
  return {
    title: "Traelo · Costo de envío listo",
    body: `Ya pesamos tu paquete y tenemos el costo final.${total} Toca para ver el detalle.`,
    url: `/pedidos/${pedidoId}`,
  };
}

/** CLIENT: the price changed on an already-quoted order. */
export function pushPrecioCambio(pedidoId: string): PushPayload {
  return {
    title: "Traelo · Precio actualizado",
    body: "El precio de tu pedido cambió. Toca para revisarlo y confirmar.",
    url: `/pedidos/${pedidoId}`,
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
    body: `${quien} editó su pedido #${corto(pedidoId)}. Hay que revisar el precio.`,
    url: "/admin/kanban",
  };
}
