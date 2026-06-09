import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { IconBell } from "@/components/brand/icons";
import { routes } from "@/config/site";

/**
 * Top app bar for the client area: brand on the left, notifications on the
 * right. Shared across every signed-in page via <AppShell>.
 */
export function AppHeader() {
  return (
    <header className="flex items-center justify-between px-5 pt-8 pb-3">
      <Link href={routes.dashboard} aria-label="Inicio">
        <Logo variant="dark" size={26} />
      </Link>
      <Link
        href={routes.notificaciones}
        aria-label="Notificaciones"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-muted shadow-sm transition active:scale-90"
      >
        <IconBell size={20} />
      </Link>
    </header>
  );
}
