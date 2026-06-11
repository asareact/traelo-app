/**
 * WhatsApp message TEMPLATES — the single source of truth for message copy.
 *
 * Kept here as named constants (not inline magic strings) so wording lives in
 * one place and is reusable. Two directions:
 *   - `pedidoParaAdmin`     — client → admin (a new order lands in WhatsApp).
 *   - `mensajeCambioEstado` — admin → client (optional notify on each state move).
 *
 * Client-facing rules (hard): NO emojis (some WhatsApp clients render them as
 * tofu ◇), NEVER a SHEIN link, and NEVER the word "casillero" (see estados.ts —
 * internal states map to neutral copy like "EE.UU."). Only product names,
 * order details, and the tracking link go to the client.
 */

import { ESTADO_LABEL, type Estado } from "./estados";

/**
 * Build the public tracking URL, guaranteeing an `https://` scheme so WhatsApp
 * (and other clients) turn it into a clickable link — a bare domain or `http://`
 * often renders as plain text. Returns null when there's no site URL.
 * Note: `localhost` URLs are never linkified by WhatsApp; that's expected in dev.
 */
export function linkRastreo(
  siteUrl: string | null | undefined,
  id: string,
): string | null {
  if (!siteUrl) return null;
  let base = siteUrl.trim().replace(/\/+$/, "");
  if (!/^https?:\/\//i.test(base)) base = "https://" + base;
  return `${base}/pedidos/${id}`;
}

/** A product line in a client message — name plus its size/color/qty. */
export type ProductoMsg = {
  nombre: string;
  talla?: string | null;
  color?: string | null;
  cantidad?: number | null;
};

/** Shared formatting for the "*Tu pedido:*" product list (without trailing blank). */
function lineasProductos(productos: ProductoMsg[]): string[] {
  if (!productos.length) return [];
  const out = ["*Tu pedido:*"];
  productos.forEach((p, i) => {
    const extra = [
      p.talla && `Talla ${p.talla}`,
      p.color,
      p.cantidad && p.cantidad > 1 ? `x${p.cantidad}` : null,
    ]
      .filter(Boolean)
      .join(" · ");
    out.push(`${i + 1}. ${p.nombre}${extra ? ` · ${extra}` : ""}`);
  });
  return out;
}

type ItemMsg = {
  shein_url: string;
  talla: string | null;
  color: string | null;
  cantidad: number;
  notas_cliente: string | null;
  /** Optional label derived from the URL (see domain/shein). */
  nombre?: string | null;
};

/**
 * The order message sent CLIENT → ADMIN. Lists every product (link + size /
 * color / qty / note), the client's name + phone, and the tracking link so the
 * admin can open the order in the system.
 */
export function pedidoParaAdmin(opts: {
  idCorto: string;
  nombre?: string | null;
  telefono?: string | null;
  trackingUrl?: string | null;
  items: ItemMsg[];
}): string {
  const productos = opts.items
    .map((it, i) => {
      const detalle = [
        it.talla && `Talla ${it.talla}`,
        it.color,
        `x${it.cantidad}`,
      ]
        .filter(Boolean)
        .join(" · ");
      const nota = it.notas_cliente ? `\n   Nota: ${it.notas_cliente}` : "";
      const titulo = it.nombre ? `${it.nombre}\n   ` : "";
      return `${i + 1}. ${titulo}${it.shein_url}\n   ${detalle}${nota}`;
    })
    .join("\n\n");

  return [
    `*Nuevo pedido Traelo* #${opts.idCorto}`,
    ``,
    `Cliente: ${opts.nombre || "Cliente"}${opts.telefono ? ` · ${opts.telefono}` : ""}`,
    opts.trackingUrl ? `Seguimiento: ${opts.trackingUrl}` : null,
    ``,
    `*Productos (${opts.items.length}):*`,
    productos,
  ]
    .filter((l) => l !== null)
    .join("\n");
}

/**
 * Client-facing headline per TARGET state. Describes the new status and the
 * next step, so the transition reads naturally (e.g. paid → awaiting purchase).
 * States with no entry fall back to a generic "changed to <label>" line.
 */
export const NOTIF_ESTADO: Partial<Record<Estado, string>> = {
  EN_REVISION: "Estamos revisando tu pedido y confirmando los precios reales.",
  PRECIO_ACTUALIZADO:
    "¡Ya tenemos el precio final de tu pedido! Revísalo y confírmanos para seguir.",
  ACEPTADO: "Confirmaste tu pedido. El siguiente paso es el pago.",
  PENDIENTE_PAGO:
    "Tu pedido quedó pendiente de pago. En cuanto pagues, lo compramos en SHEIN.",
  PAGADO:
    "¡Pago confirmado! Tu pedido queda a la espera de ser comprado en SHEIN.",
  COMPRADO_SHEIN: "Compramos tu pedido en SHEIN. Ahora va en camino a EE.UU.",
  EN_CAMINO_CASILLERO: "Tu pedido va en camino a EE.UU.",
  EN_CASILLERO:
    "Tu pedido ya llegó a EE.UU. Lo estamos preparando para enviarlo a Cuba.",
  CONSOLIDANDO: "Estamos preparando tu envío hacia Cuba.",
  ENVIADO_CUBA: "¡Tu pedido va rumbo a Cuba!",
  EN_TRANSITO_INTERNO: "Tu pedido está en tránsito dentro de Cuba.",
  DISPONIBLE_ENTREGA: "¡Tu pedido ya está listo para que lo recojas!",
  ENTREGADO: "¡Tu pedido fue entregado! Gracias por confiar en Traelo.",
  CANCELADO: "Tu pedido fue cancelado. Si tienes alguna duda, escríbenos.",
};

/**
 * The state-change message sent ADMIN → CLIENT (optional, admin's call). Built
 * from the target-state template + product names + whatever order details exist
 * (value, weight) + the tracking link. No SHEIN links, no internal wording.
 */
export function mensajeCambioEstado(opts: {
  idCorto: string;
  estado: Estado;
  nombreCliente?: string | null;
  productos: ProductoMsg[];
  trackingUrl?: string | null;
  /** Grand total (products + shipping). */
  valorUsd?: number | null;
  /** Product subtotal — shown when there's a shipping line to break down. */
  productosUsd?: number | null;
  /** Shipping cost (peso × precio_por_lb). When > 0, the total is broken down. */
  envioUsd?: number | null;
  pesoLb?: number | null;
}): string {
  const headline =
    NOTIF_ESTADO[opts.estado] ??
    `Tu pedido pasó a: ${ESTADO_LABEL[opts.estado]}.`;

  const saludo = opts.nombreCliente
    ? `Hola ${opts.nombreCliente.split(" ")[0]}, `
    : "";

  const lines: (string | null)[] = [
    `*Traelo* · Pedido #${opts.idCorto}`,
    ``,
    `${saludo}${headline}`,
    ``,
  ];

  if (opts.productos.length) {
    lines.push(...lineasProductos(opts.productos), ``);
  }

  // Once the weight is known we charge shipping, so break the total down:
  //   Productos: $X / Envío (N lb): $Y / *Total a pagar: $Z*
  // Before that, just show the product value (and peso if we somehow have it).
  const detalles: string[] = [];
  if (opts.envioUsd != null && opts.envioUsd > 0) {
    if (opts.productosUsd != null)
      detalles.push(`Productos: $${opts.productosUsd.toFixed(2)}`);
    const lbTxt = opts.pesoLb != null ? ` (${opts.pesoLb} lb)` : "";
    detalles.push(`Envío${lbTxt}: $${opts.envioUsd.toFixed(2)}`);
    if (opts.valorUsd != null)
      detalles.push(`*Total a pagar: $${opts.valorUsd.toFixed(2)}*`);
  } else {
    if (opts.valorUsd != null)
      detalles.push(`Valor del pedido: $${opts.valorUsd.toFixed(2)}`);
    if (opts.pesoLb != null) detalles.push(`Peso: ${opts.pesoLb} lb`);
  }
  if (detalles.length) {
    lines.push(...detalles, ``);
  }

  if (opts.trackingUrl) lines.push(`Sigue tu pedido aquí: ${opts.trackingUrl}`);

  return lines.filter((l) => l !== null).join("\n");
}

/**
 * The PRICE-CHANGE message sent ADMIN → CLIENT. Used when the order's price was
 * already quoted and changed (SHEIN prices vary day to day). Reminds the client
 * of the new total and to complete the payment. No SHEIN links.
 */
export function mensajePrecioCambio(opts: {
  idCorto: string;
  nombreCliente?: string | null;
  productos: ProductoMsg[];
  trackingUrl?: string | null;
  valorUsd?: number | null;
}): string {
  const saludo = opts.nombreCliente
    ? `Hola ${opts.nombreCliente.split(" ")[0]}, `
    : "";

  const lines: (string | null)[] = [
    `*Traelo* · Pedido #${opts.idCorto}`,
    ``,
    `${saludo}el precio de tu pedido se actualizó (los precios en la tienda cambian de un día a otro).`,
    ``,
  ];

  if (opts.productos.length) {
    lines.push(...lineasProductos(opts.productos), ``);
  }

  if (opts.valorUsd != null) {
    lines.push(`*Nuevo total: $${opts.valorUsd.toFixed(2)}*`, ``);
  }

  lines.push(
    `Recuerda completar el pago para que podamos comprar tu pedido al precio actual.`,
  );
  if (opts.trackingUrl)
    lines.push(``, `Sigue tu pedido aquí: ${opts.trackingUrl}`);

  return lines.filter((l) => l !== null).join("\n");
}
