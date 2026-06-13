/**
 * Invoice domain — pure logic for turning an order into a printable invoice.
 * No I/O, no server-only: safe on client (the kanban card uses `permiteFactura`)
 * and on the server (the PDF route assembles the data).
 *
 * Business rule: the invoice the CLIENT sees never reveals the US casillero /
 * forwarder, never carries SHEIN links. It shows our confirmed product prices,
 * shipping to Cuba, and the express upgrade as a line when chosen.
 */

import { ESTADOS, type Estado } from "@/features/orders/domain/estados";
import {
  totalProductos,
  recargoExpress,
  type TipoEnvio,
} from "@/features/orders/domain/pricing";
import type { PedidoItem } from "@/types/database";

/** One line on the invoice table. */
export interface LineaFactura {
  descripcion: string;
  cantidad: number;
  /** Confirmed unit price (USD). Null only if the item was never priced. */
  precioUnit: number | null;
  /** precioUnit × cantidad. Null when there's no price yet. */
  importe: number | null;
  /** Product thumbnail URL (our `productos` bucket). May be null. */
  imagen: string | null;
}

/** The cost breakdown, guaranteed to sum to `total`. */
export interface DesgloseFactura {
  subtotal: number | null;
  envio: number | null;
  /**
   * Shipping isn't known yet: the order is paid but the package hasn't been
   * weighed (weight is registered at EN_CASILLERO, after PAGADO). The shipping
   * line should read "Por confirmar", NOT $0.00 — printing $0.00 implies free
   * shipping on a quasi-legal document and invites a dispute when we later charge
   * the real shipping. The footer already warns the total may change.
   */
  envioPendiente: boolean;
  /** Express surcharge — present (and shown as a line) only when express. */
  recargoExpress: number | null;
  total: number | null;
}

/** Contact block (issuer or client). */
export interface ParteFactura {
  nombre: string;
  email: string | null;
  telefono: string | null;
  /** Address lines, already split for display. */
  direccion: string[];
}

/** Everything the PDF needs — assembled by the query, rendered by the document. */
export interface FacturaData {
  numero: string;
  /** ISO date the order was created (invoice date). */
  fechaIso: string;
  emisor: ParteFactura;
  cliente: ParteFactura;
  lineas: LineaFactura[];
  desglose: DesgloseFactura;
  tipoEnvio: TipoEnvio;
  pesoLb: number | null;
}

/**
 * Whether the admin can generate an invoice for an order: from PAGADO onward
 * (the client has paid — there's something to invoice). Cancelled orders never.
 */
export function permiteFactura(estado: Estado): boolean {
  if (estado === "CANCELADO") return false;
  return ESTADOS.indexOf(estado) >= ESTADOS.indexOf("PAGADO");
}

/**
 * Invoice number: TRAELO-YYYYMM-XXXXXXXX (year-month of the order + the short
 * order id, upper-cased). Stable and human-readable; derived, not stored.
 */
export function numeroFactura(idPedido: string, fechaIso: string): string {
  const ym = fechaIso.slice(0, 7).replace("-", ""); // "2026-06-..." → "202606"
  return `TRAELO-${ym}-${idPedido.slice(0, 8).toUpperCase()}`;
}

/** Map order items to invoice lines (description + qty + price + thumbnail). */
export function lineasFactura(items: PedidoItem[]): LineaFactura[] {
  return items.map((i) => {
    const precioUnit = i.precio_real_usd;
    return {
      descripcion: i.producto_nombre?.trim() || "Producto",
      cantidad: i.cantidad,
      precioUnit,
      importe: precioUnit != null ? Number((precioUnit * i.cantidad).toFixed(2)) : null,
      imagen: i.producto_imagen,
    };
  });
}

/**
 * Cost breakdown for the invoice. Subtotal comes from the item prices; the
 * express surcharge is recomputed from the weight; shipping is whatever's left
 * so the three lines ALWAYS add up to the authoritative stored total. If the
 * total isn't set yet, everything is null (caller should gate on PAGADO).
 */
export function desgloseFactura(
  items: PedidoItem[],
  total: number | null,
  pesoLb: number | null,
  tipoEnvio: TipoEnvio,
  recargoExpressPorLb: number,
  /**
   * The express surcharge actually charged, stored on the order. When present we
   * use it verbatim instead of recomputing from `recargoExpressPorLb` (which can
   * drift if the config rate changed since purchase). Null → legacy order, fall
   * back to recomputing.
   */
  recargoGuardado: number | null = null,
): DesgloseFactura {
  const raw = totalProductos(items);
  // Round the subtotal before the subtraction so the displayed lines add up to
  // the cent (float sums like 19.99×3 can leave a trailing ...9999).
  const subtotal = raw == null ? null : Number(raw.toFixed(2));
  if (total == null || subtotal == null) {
    return { subtotal, envio: null, envioPendiente: false, recargoExpress: null, total };
  }
  // Package not weighed yet → shipping isn't in the total and can't be shown.
  if (pesoLb == null) {
    return { subtotal, envio: null, envioPendiente: true, recargoExpress: null, total };
  }
  const recargo =
    tipoEnvio === "express"
      ? recargoGuardado != null
        ? recargoGuardado
        : recargoExpress(pesoLb, recargoExpressPorLb)
      : 0;
  const envio = Number(Math.max(0, total - subtotal - recargo).toFixed(2));
  return {
    subtotal,
    envio,
    envioPendiente: false,
    recargoExpress: tipoEnvio === "express" ? recargo : null,
    total,
  };
}
