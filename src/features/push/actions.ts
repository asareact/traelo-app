"use server";

import { createClient } from "@/lib/supabase/server";
import { pushSubscriptionSchema } from "./schemas";
import { enviarPushAUsuario } from "./send";

export type PushActionState = { ok?: boolean; error?: string };

/**
 * Send a test push to the caller's own devices. Returns how many subscriptions
 * the SERVER has for the user — the key diagnostic: 0 means this device isn't
 * really registered (re-activate), >0 means it's registered and any non-delivery
 * is on the OS/channel side.
 */
export async function enviarPushDePrueba(): Promise<{
  dispositivos: number;
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { dispositivos: 0, error: "No autorizado." };

  const { count } = await supabase
    .from("push_subscriptions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);
  const dispositivos = count ?? 0;

  if (dispositivos > 0) {
    await enviarPushAUsuario(user.id, {
      title: "Traelo",
      body: "Notificación de prueba. Si la ves, todo funciona.",
      url: "/notificaciones",
      tag: "prueba",
    });
  }
  return { dispositivos };
}

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
