/**
 * Business identity — the issuer ("emisor") shown on invoices and other
 * outward-facing documents. Centralized so a rebrand or copy change is a
 * one-line edit, not a grep across templates.
 *
 * Deliberately NO personal name / street address / personal email here: the
 * invoice references the business (Traelo), not the owner.
 *
 * NOTE: the phone is NOT here — it lives in the `config` table
 * (`whatsapp_phone`) so the admin can change it without a deploy. The invoice
 * query reads it from there and passes it in.
 */
export const business = {
  /** Business / brand name shown as the issuer. */
  nombre: "Traelo",
  /** Short brand shown next to the logo. */
  marca: "Traelo",
  /** One-line descriptor under the name on the invoice. */
  eslogan: "Compras desde EE.UU. a Cuba",
  /** Location line — kept generic on purpose. */
  ubicacion: "La Habana, Cuba",
} as const;

/**
 * Refund policy shown on the invoice. If an item never arrives (SHEIN refunds it
 * or it's missing at pickup), the client is refunded that item's price as it was
 * AT THE TIME OF PURCHASE — protects both sides from later price drift.
 */
export const politicaReembolso =
  "Si un artículo no llega o SHEIN reembolsa su importe, se te devuelve el dinero de ese artículo por el mismo precio que tenía al momento de la compra.";

/** Brand palette (mirrors the logo + DESIGN.md tokens) for PDF styling. */
export const brandColors = {
  primary: "#C4522A", // terracotta
  primaryDark: "#A8431F",
  teal: "#00B5A0",
  text: "#1C1714",
  muted: "#8A817A",
  border: "#E5DFD4",
  surface: "#F7F3EC",
} as const;
