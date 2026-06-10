"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

/**
 * Admin top navbar — dark, sticky, desktop-first (DESIGN.md "Portal Admin").
 * Two sections (Kanban · Configuración) + the "traelo admin." wordmark and a
 * discreet sign-out. Distinct from the client <AppHeader> on purpose.
 */
const links = [
  { href: "/admin/kanban", label: "Kanban" },
  { href: "/admin/config", label: "Configuración" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#1C1714]">
      <div className="flex h-14 items-center gap-6 px-6">
        <nav className="flex items-center gap-1">
          {links.map((l) => {
            const active = pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-sm font-bold transition",
                  active
                    ? "bg-white/10 text-white"
                    : "text-white/55 hover:text-white",
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-xs font-medium text-white/45 hover:text-white/80"
          >
            Salir del panel
          </Link>
          <span className="font-display text-lg font-bold tracking-tight text-white">
            traelo<span className="text-primary"> admin.</span>
          </span>
        </div>
      </div>
    </header>
  );
}
