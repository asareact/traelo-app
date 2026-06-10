"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { IconBell, IconShield } from "@/components/brand/icons";
import { BackButton } from "@/components/ui/back-button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { routes } from "@/config/site";

/**
 * Sticky, translucent top bar (blur, no bottom border — content passes faintly
 * behind it). FIXED height: the centered brand mark just "flows" (a gentle
 * scroll-driven scale) without changing the header size or shifting the side
 * controls. Scroll-driven via a ref + rAF (no re-renders).
 */
export function StickyHeader({
  isAdmin,
  back,
}: {
  isAdmin: boolean;
  back?: { href?: string; fallbackHref?: string };
}) {
  const logoRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const p = Math.min(1, window.scrollY / 90); // 0 at top → 1 scrolled
      if (logoRef.current) {
        logoRef.current.style.transform = `scale(${1.18 - 0.18 * p})`;
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update); // set initial state
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-bg/70 pt-[max(env(safe-area-inset-top),0.5rem)] backdrop-blur-md">
      <div className="relative flex h-14 items-center justify-between px-5">
        {/* Left controls */}
        <div className="flex items-center gap-2">
          {back && (
            <BackButton href={back.href} fallbackHref={back.fallbackHref} />
          )}
        </div>

        {/* Right controls (ours) */}
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

        {/* Centered brand mark — flows (scales) within the fixed header height */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Link
            href={routes.dashboard}
            aria-label="Inicio"
            className="pointer-events-auto block"
          >
            <span
              ref={logoRef}
              className="block origin-center will-change-transform"
              style={{ transform: "scale(1.18)" }}
            >
              <Logo variant="auto" showText={false} size={30} />
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
