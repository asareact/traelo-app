import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { enviarPushAUsuario, enviarPushAAdmins } from "@/features/push/send";
import type { PushPayload } from "@/features/push/mensajes";

/**
 * Unified "notify": record an in-app notification (so it shows on /notificaciones)
 * AND send the Web Push. One call per event, used by the order/admin actions and
 * the reminder cron. Uses the service-role client to write rows for arbitrary
 * recipients. Best-effort: push no-ops without VAPID; a failure here must not
 * break the action that triggered it (callers should not depend on it throwing).
 */
export async function notificarUsuario(
  userId: string,
  tipo: string,
  payload: PushPayload,
  pedidoId?: string | null,
): Promise<void> {
  const admin = createAdminClient();
  await admin.from("notificaciones").insert({
    user_id: userId,
    pedido_id: pedidoId ?? null,
    tipo,
    mensaje: payload.body,
    enviado: true,
  });
  await enviarPushAUsuario(userId, payload);
}

/** Same, fanned out to every admin (e.g. a new order / an edited order). */
export async function notificarAdmins(
  tipo: string,
  payload: PushPayload,
  pedidoId?: string | null,
): Promise<void> {
  const admin = createAdminClient();
  const { data: admins } = await admin
    .from("profiles")
    .select("id")
    .eq("rol", "admin");
  const ids = (admins ?? []).map((a) => a.id as string);
  if (ids.length) {
    await admin.from("notificaciones").insert(
      ids.map((id) => ({
        user_id: id,
        pedido_id: pedidoId ?? null,
        tipo,
        mensaje: payload.body,
        enviado: true,
      })),
    );
  }
  await enviarPushAAdmins(payload);
}
