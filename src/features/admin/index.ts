/**
 * Admin feature — client-safe public surface.
 *
 * Server-only data access (getKanbanPedidos, statsDe) lives in ./queries and is
 * imported DIRECTLY by the admin pages — never re-exported here, so the
 * `server-only` module never reaches a client bundle through this barrel.
 */

// Server actions (safe from client — become RPC calls)
export {
  processItem,
  advanceOrderState,
  type AdminActionState,
} from "./actions";

// Components
export { AdminNav } from "./components/admin-nav";
export { StatsBar } from "./components/stats-bar";
export { KanbanBoard } from "./components/kanban-board";

// Domain (pure, client-safe)
export {
  ESTADO_ADMIN_LABEL,
  KANBAN_COLUMNS,
  siguienteEstado,
} from "./domain/kanban";
