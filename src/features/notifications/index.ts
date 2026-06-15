/**
 * Notifications feature — client-safe public surface.
 *
 * NOTE: ./queries and ./notificar are server-only and imported DIRECTLY by pages /
 * server actions (`@/features/notifications/queries`, `.../notificar`), never
 * re-exported here.
 */
export { NotificationsList } from "./components/notifications-list";
export {
  marcarTodasLeidas,
  eliminarNotificacion,
  limpiarNotificaciones,
} from "./actions";
