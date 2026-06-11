import { createClient } from "@/lib/supabase/server";
import { StickyHeader } from "./sticky-header";

/**
 * Top app bar for the client area. Async server component: resolves the caller's
 * role (admin shortcut lives in the menu) and first name (for the Home greeting),
 * then delegates the UI + scroll behaviour to <StickyHeader>.
 */
export async function AppHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  let nombre: string | null = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("rol, nombre")
      .eq("id", user.id)
      .single();
    isAdmin = data?.rol === "admin";
    nombre = data?.nombre ?? null;
  }

  return <StickyHeader isAdmin={isAdmin} nombre={nombre} />;
}
