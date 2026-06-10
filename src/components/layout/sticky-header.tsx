"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { IconBell, IconMenu } from "@/components/brand/icons";
import { BackButton } from "@/components/ui/back-button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { routes } from "@/config/site";
import { resolveHeader } from "./header-nav";
import { MenuDrawer } from "./menu-drawer";

/**
 * Sticky, translucent top bar (blur, no bottom border). Fixed height.
 *  - Left: hamburger (main pages) or back (secondary pages), plus a label —
 *    the greeting on Home, the page title on secondary pages.
 *  - Center: the brand mark that floats between header/body and rises into the
 *    bar (44px) on scroll, all via transform (no layout shift).
 *  - Right: theme toggle + notifications. The admin shortcut lives in the menu.
 */
export function StickyHeader({
  isAdmin,
  nombre,
}: {
  isAdmin: boolean;
  nombre?: string | null;
}) {
  const pathname = usePathname();
  const { isMain, isHome, title, backFallback } = resolveHeader(pathname);
  const [menuOpen, setMenuOpen] = useState(false);
  const logoRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const p = Math.min(1, window.scrollY / 110);
      const k = 1 - p;
      if (logoRef.current) {
        logoRef.current.style.transform = `translateY(${30 * k}px) scale(${1 + 0.45 * k})`;
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const firstName = nombre?.trim().split(" ")[0];
  const label = isHome ? (firstName ? `Hola, ${firstName}` : "Hola") : title;

  return (
    <>
      <header className="sticky top-0 z-40 bg-bg/70 pt-[max(env(safe-area-inset-top),0.5rem)] backdrop-blur-md">
        <div className="relative flex h-14 items-center justify-between px-5">
          {/* Left: menu/back + label (kept under ~48% so it never reaches the logo) */}
          <div className="flex min-w-0 max-w-[48%] items-center gap-2.5">
            {isMain ? (
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                aria-label="Menú"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-text shadow-sm transition active:scale-90"
              >
                <IconMenu size={20} />
              </button>
            ) : (
              <BackButton fallbackHref={backFallback} />
            )}
            {label && (
              <span className="truncate text-[15px] font-bold text-text">
                {label}
              </span>
            )}
          </div>

          {/* Right: theme + notifications */}
          <div className="flex shrink-0 items-center gap-2">
            <ThemeToggle />
            <Link
              href={routes.notificaciones}
              aria-label="Notificaciones"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-muted shadow-sm transition active:scale-90"
            >
              <IconBell size={20} />
            </Link>
          </div>

          {/* Centered brand mark — floats, then rises into the bar on scroll */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <Link
              href={routes.dashboard}
              aria-label="Inicio"
              className="pointer-events-auto block"
            >
              <span
                ref={logoRef}
                className="block origin-center will-change-transform"
                style={{ transform: "translateY(30px) scale(1.45)" }}
              >
                <Logo variant="auto" showText={false} size={44} />
              </span>
            </Link>
          </div>
        </div>
      </header>

      <MenuDrawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        isAdmin={isAdmin}
      />
    </>
  );
}
