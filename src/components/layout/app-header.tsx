import { createClient } from "@/lib/supabase/server";
import { StickyHeader } from "./sticky-header";

export type BackConfig = { href?: string; fallbackHref?: string };

/**
 * Top app bar for the client area. Async server component: it resolves the
 * caller's role (admins get a shortcut into the admin panel) and delegates the
 * UI + scroll behaviour to <StickyHeader>.
 */
export async function AppHeader({ back }: { back?: BackConfig }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("rol")
      .eq("id", user.id)
      .single();
    isAdmin = data?.rol === "admin";
  }

  return <StickyHeader isAdmin={isAdmin} back={back} />;
}
