"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clientNav } from "@/config/site";
import { IconHome, IconBox, IconUser, IconPlus } from "@/components/brand/icons";
import { cn } from "@/lib/utils/cn";

const icons = {
  home: IconHome,
  box: IconBox,
  user: IconUser,
  plus: IconPlus,
} as const;

/**
 * Fixed bottom tab bar — the primary navigation for the mobile client app.
 * The center "Pedir" action is visually elevated (primary circle).
 */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <ul className="mx-auto flex max-w-md items-center justify-around px-2">
        {clientNav.map((item) => {
          const Icon = icons[item.icon];
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          if ("primary" in item && item.primary) {
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex flex-col items-center gap-1 py-2"
                  aria-label={item.label}
                >
                  <span className="nav-pedir-bob relative flex h-12 w-12 -translate-y-3 items-center justify-center">
                    {/* Pulsing halo to draw the eye */}
                    <span className="nav-pedir-ring absolute inset-0 rounded-full bg-primary/40" />
                    <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/30">
                      <Icon size={24} />
                    </span>
                  </span>
                  <span className="-mt-2 text-[11px] font-bold text-primary">
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          }

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2.5 text-[11px] font-medium transition",
                  active ? "text-primary" : "text-muted",
                )}
              >
                <Icon size={22} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
