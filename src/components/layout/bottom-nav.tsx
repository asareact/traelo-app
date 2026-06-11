"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clientNav } from "@/config/site";
import {
  IconHome,
  IconBox,
  IconUser,
  IconPlus,
  IconTruck,
} from "@/components/brand/icons";
import { cn } from "@/lib/utils/cn";

const icons = {
  home: IconHome,
  box: IconBox,
  user: IconUser,
  plus: IconPlus,
  truck: IconTruck,
} as const;

/**
 * Fixed bottom tab bar — primary navigation for the mobile client app.
 * Opaque surface for legibility; the center "Pedir" action is elevated with a
 * white ring and gently animated (bob + pulsing halo) to draw the eye.
 *
 * Rendered through a portal to <body> so its `position: fixed` anchors to the
 * viewport no matter what — immune to any ancestor that creates a containing
 * block (a transformed page-transition wrapper, a `backdrop-filter` header,
 * etc.). <AppShell> still decides whether to mount it.
 */
export function BottomNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const nav = (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white pb-[env(safe-area-inset-bottom)] dark:bg-bg">
      <ul className="mx-auto flex h-16 max-w-md items-center justify-around px-2">
        {clientNav.map((item) => {
          const Icon = icons[item.icon];
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          if ("primary" in item && item.primary) {
            return (
              <li key={item.href} className="w-16">
                <Link
                  href={item.href}
                  className="flex flex-col items-center"
                  aria-label={item.label}
                >
                  <span className="nav-pedir-bob relative -mt-9 flex h-14 w-14 items-center justify-center">
                    <span className="nav-pedir-ring absolute inset-0 rounded-full bg-primary/40" />
                    <span className="relative flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-primary text-white shadow-lg shadow-primary/30 dark:border-2 dark:border-primary dark:bg-bg dark:text-primary dark:shadow-primary/20">
                      <Icon size={26} />
                    </span>
                  </span>
                  <span className="mt-1 text-[10px] font-medium text-muted">
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          }

          return (
            <li key={item.href} className="w-16">
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 py-2 text-[10px] transition-colors",
                  active
                    ? "font-bold text-primary"
                    : "font-medium text-muted",
                )}
              >
                <Icon size={23} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );

  // Portal to <body> after mount (document isn't available during SSR).
  if (!mounted) return null;
  return createPortal(nav, document.body);
}
