import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { IconBell, IconShield } from "@/components/brand/icons";
import { BackButton } from "@/components/ui/back-button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { routes } from "@/config/site";
import { createClient } from "@/lib/supabase/server";

export type BackConfig = { href?: string; fallbackHref?: string };

/**
 * Top app bar for the client area: brand (with an optional back arrow) on the
 * left, theme toggle + notifications on the right. Shared via <AppShell>.
 *
 * Async server component: it checks the caller's role so admins get a discreet
 * shortcut into the admin panel (clients never see it).
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

  return (
    <header className="flex items-center justify-between px-5 pt-8 pb-3">
      <div className="flex items-center gap-2.5">
        {back && (
          <BackButton href={back.href} fallbackHref={back.fallbackHref} />
        )}
        <Link href={routes.dashboard} aria-label="Inicio">
          <Logo variant="auto" size={44} />
        </Link>
      </div>
      <div className="flex items-center gap-2">
        {isAdmin && (
          <Link
            href={routes.admin}
            aria-label="Panel de admin"
            title="Panel de admin"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary shadow-sm transition active:scale-90"
          >
            <IconShield size={19} />
          </Link>
        )}
        <ThemeToggle />
        <Link
          href={routes.notificaciones}
          aria-label="Notificaciones"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-muted shadow-sm transition active:scale-90"
        >
          <IconBell size={20} />
        </Link>
      </div>
    </header>
  );
}
