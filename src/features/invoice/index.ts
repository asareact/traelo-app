/**
 * Invoice feature — public surface.
 *
 * WARNING: this barrel re-exports `queries.ts` (server-only). Import it ONLY
 * from server code (the PDF route handler). Client components that need the
 * pure helper must import it directly from `./domain/factura` (e.g. the kanban
 * card uses `permiteFactura`), the same way they import from orders/domain.
 */
export { getFacturaData } from "./queries";
export { FacturaDocument } from "./components/factura-document";
export {
  permiteFactura,
  numeroFactura,
  type FacturaData,
} from "./domain/factura";
