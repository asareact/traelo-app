/**
 * Pricing helpers. Kept deliberately thin: final prices are set by the admin
 * per item (real SHEIN cost) plus shipping by weight. These helpers exist so
 * pricing logic has ONE home as the model firms up.
 *
 * Business notes (see DESIGN.md):
 *  - Shipping is charged per pound; weight is known only after the package is
 *    weighed in the US and is paid at pickup.
 *  - Express pricing is PENDING real shipment data — do not hardcode a rate.
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
