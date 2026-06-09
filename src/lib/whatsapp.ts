/**
 * WhatsApp deep-link helpers.
 *
 * The order flow has no automated admin notification yet, so a new order is
 * delivered to the business by opening a prefilled WhatsApp chat to the number
 * in `config.whatsapp_phone` — the admin receives the full order there and
 * processes it. Templates live here so the copy stays consistent (documented in
 * DESIGN.md → "WhatsApp — plantillas de mensajes").
 */

type ItemMsg = {
  shein_url: string;
  talla: string | null;
  color: string | null;
  cantidad: number;
  notas_cliente: string | null;
};

/**
 * Build a wa.me link. `phone` may include `+`, spaces or dashes — we strip to
 * digits. Returns null when there's no usable number (e.g. config still holds
 * the placeholder), so callers can hide the button.
 */
export function whatsappLink(
  phone: string | null | undefined,
  message: string,
): string | null {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (digits.length < 8) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

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
      return `${i + 1}. ${it.shein_url}\n   ${detalle}${nota}`;
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
