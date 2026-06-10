import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { IconBell } from "@/components/brand/icons";
import { BackButton } from "@/components/ui/back-button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { routes } from "@/config/site";

export type BackConfig = { href?: string; fallbackHref?: string };

/**
 * Top app bar for the client area: brand (with an optional back arrow) on the
 * left, theme toggle + notifications on the right. Shared via <AppShell>.
 */
export function AppHeader({ back }: { back?: BackConfig }) {
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
