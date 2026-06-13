"use server";

import { createClient } from "@/lib/supabase/server";
import { pushSubscriptionSchema } from "./schemas";

export type PushActionState = { ok?: boolean; error?: string };

/**
 * Store (or refresh) the caller's Web Push subscription. Keyed by endpoint so a
 * re-subscribe upserts the same device. RLS ensures a user only writes their own.
 */
export async function guardarSuscripcion(raw: unknown): Promise<PushActionState> {
  const parsed = pushSubscriptionSchema.safeParse(raw);
  if (!parsed.success) return { error: "Suscripción inválida." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado." };

  const sub = parsed.data;
  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_id: user.id,
      endpoint: sub.endpoint,
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth,
    },
    { onConflict: "endpoint" },
  );
  if (error) return { error: "No se pudo activar las notificaciones." };
  return { ok: true };
}

/** Remove a subscription (the user turned notifications off on this device). */
export async function eliminarSuscripcion(
  endpoint: string,
): Promise<PushActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado." };

  await supabase
    .from("push_subscriptions")
    .delete()
    .eq("endpoint", endpoint)
    .eq("user_id", user.id);
  return { ok: true };
}
