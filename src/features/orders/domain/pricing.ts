/**
 * Pricing helpers. Kept deliberately thin: final prices are set by the admin
 * per item (real SHEIN cost) plus shipping by weight. These helpers exist so
 * pricing logic has ONE home as the model firms up.
 *
 * Business notes (see DESIGN.md / ROADMAP §6):
 *  - Shipping is charged per pound at a FIXED rate to the client (config
 *    `precio_por_lb`); weight is the real scale weight the admin registers (the
 *    client can watch it being weighed), known after the package is in the US.
 *  - EXPRESS is an optional upgrade offered only for heavier orders (10+ lb): the
 *    client pays a per-pound surcharge (`recargo_express_por_lb`) on top of the
 *    standard rate. The forwarder's real express extra is ~$1.15/lb; the rest is
 *    our service margin.
 */

/** Sum the admin-confirmed product prices of an order's items. */
export function totalProductos(
  items: { precio_real_usd: number | null; cantidad: number }[],
): number | null {
  const conPrecio = items.filter((i) => i.precio_real_usd !== null);
  if (conPrecio.length === 0) return null;
  return conPrecio.reduce(
    (sum, i) => sum + (i.precio_real_usd as number) * i.cantidad,
    0,
  );
}

/** Shipping cost for a known weight, given the per-pound rate from config. */
export function costoEnvio(libras: number, precioPorLb: number): number {
  const lbs = Math.max(1, libras); // minimum 1 lb
  return lbs * precioPorLb;
}

/**
 * Minimum package weight (lb) at which we offer the client the EXPRESS upgrade.
 * Below this it isn't worth it (the forwarder's express has a fixed floor that
 * only pays off on heavier packages — see ROADMAP §6). Matches the landing copy.
 */
export const PESO_MIN_EXPRESS = 10;

/** Whether the EXPRESS upgrade can be offered to the client for this weight. */
export function aplicaExpress(pesoLb: number | null | undefined): boolean {
  return pesoLb != null && pesoLb >= PESO_MIN_EXPRESS;
}

/**
 * The EXTRA the client pays for express over standard: libras × the express
 * surcharge per pound (config `recargo_express_por_lb`). Same 1-lb minimum as the
 * base shipping. This is added on top of the standard total, never replaces it.
 */
export function recargoExpress(libras: number, recargoExpressPorLb: number): number {
  const lbs = Math.max(1, libras);
  return Number((lbs * recargoExpressPorLb).toFixed(2));
}

/**
 * The full amount to charge for an order: product subtotal + shipping by weight.
 * Shipping is only added once the package weight is known (it's unknown until the
 * box is weighed in the US). Returns null when no item has a confirmed price yet
 * (nothing to total). This is what `pedidos.total_real_usd` should hold.
 */
export function totalPedido(
  items: { precio_real_usd: number | null; cantidad: number }[],
  pesoLb: number | null | undefined,
  precioPorLb: number,
): number | null {
  const productos = totalProductos(items);
  if (productos === null) return null;
  const envio = pesoLb != null ? costoEnvio(pesoLb, precioPorLb) : 0;
  return Number((productos + envio).toFixed(2));
}
