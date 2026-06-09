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
