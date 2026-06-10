/**
 * Orders feature — client-safe public surface (components, actions, domain).
 *
 * NOTE: server-only data access lives in ./queries and is imported DIRECTLY by
 * pages (`@/features/orders/queries`), never re-exported here — that keeps the
 * `server-only` module out of any client bundle that touches this barrel.
 */

// Server actions (safe to import from client — they become RPC calls)
export { createOrder, type CreateOrderState } from "./actions";

// Components
export { OrderForm } from "./components/order-form";
export { OrderCard } from "./components/order-card";
export { OrderDetail } from "./components/order-detail";
export { OrderTracker } from "./components/order-tracker";
export { OrderTimeline } from "./components/order-timeline";
export { ItemList } from "./components/item-list";
export { EstadoBadge } from "./components/estado-badge";

// Domain (pure, client-safe)
export {
  ESTADO_LABEL,
  type Estado,
  type Milestone,
} from "./domain/estados";
export {
  mensajeCambioEstado,
  mensajePrecioCambio,
  pedidoParaAdmin,
  linkRastreo,
  NOTIF_ESTADO,
  type ProductoMsg,
} from "./domain/notificaciones";
export { nombreProductoEs } from "./domain/shein";
