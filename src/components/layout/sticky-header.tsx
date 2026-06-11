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
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      if (logoRef.current) {
        // The mark floats at the top, then RISES and FADES OUT on scroll (never
        // lands in a fixed collapsed slot). Fade finishes early (~55px) so it's
        // cleanly gone, not lingering at low opacity.
        const fade = Math.min(1, y / 55);
        logoRef.current.style.opacity = String(1 - fade);
        logoRef.current.style.transform = `translateY(${14 - 40 * Math.min(1, y / 80)}px) scale(1.3)`;
      }
      // Header goes solid quickly so content scrolling under it is hidden (no
      // backdrop-blur — that was the source of the jank).
      if (bgRef.current) {
        bgRef.current.style.opacity = String(Math.min(1, 0.6 + y / 50));
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
      <header className="sticky top-0 z-40 pt-[max(env(safe-area-inset-top),0.5rem)]">
        {/* Background layer — opacity is scroll-driven (translucent → solid). */}
        <div
          ref={bgRef}
          className="absolute inset-0 -z-10 bg-bg"
          style={{ opacity: 0.5 }}
        />
        <div className="relative flex h-14 items-center justify-between px-5">
          {/* Left: menu/back + the greeting (Home only) */}
          <div className="flex min-w-0 max-w-[55%] items-center gap-2.5">
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
            {isHome && label && (
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

          {/* Center: floating brand mark on Home, the page title elsewhere.
              `inset-y-0 flex items-center` centers it in the row exactly like the
              side buttons, so the collapsed (resting) position is always right;
              the scroll transform only floats it down from there. */}
          <div className="pointer-events-none absolute inset-y-0 left-1/2 flex max-w-[58%] -translate-x-1/2 items-center justify-center">
            {isHome ? (
              <Link
                href={routes.dashboard}
                aria-label="Inicio"
                className="pointer-events-auto flex items-center"
              >
                <span
                  ref={logoRef}
                  className="flex origin-center"
                  style={{
                    transform: "translateY(14px) scale(1.3)",
                    willChange: "transform, opacity",
                  }}
                >
                  <Logo variant="auto" showText={false} size={44} />
                </span>
              </Link>
            ) : (
              title && (
                <span className="block truncate text-center text-[15px] font-bold text-text">
                  {title}
                </span>
              )
            )}
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
