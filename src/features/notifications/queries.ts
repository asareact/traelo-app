import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Notificacion } from "@/types/database";

/** The logged-in user's notifications, newest first. RLS scopes to the caller. */
export async function getMisNotificaciones(): Promise<Notificacion[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("notificaciones")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (data as Notificacion[]) ?? [];
}

/** Count of the caller's unread notifications (drives the bell badge). */
export async function contarNoLeidas(): Promise<number> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count } = await supabase
    .from("notificaciones")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("leida", false);

  return count ?? 0;
}
