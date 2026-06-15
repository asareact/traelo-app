"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { contarNoLeidas } from "./queries";

/** Live unread count for the header bell (client calls this on load / focus, so
 *  the badge is fresh on every page — not stale from RSC caching). */
export async function obtenerNoLeidas(): Promise<number> {
  return contarNoLeidas();
}

/** Mark all of the caller's notifications as read. Silent (no revalidate): the
 *  list is already on screen; the header badge refreshes on the next navigation. */
export async function marcarTodasLeidas(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase
    .from("notificaciones")
    .update({ leida: true })
    .eq("user_id", user.id)
    .eq("leida", false);
}

/** Delete one of the caller's notifications. */
export async function eliminarNotificacion(id: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase
    .from("notificaciones")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  revalidatePath("/notificaciones");
}

/** Clear every notification of the caller. */
export async function limpiarNotificaciones(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("notificaciones").delete().eq("user_id", user.id);
  revalidatePath("/notificaciones");
}
