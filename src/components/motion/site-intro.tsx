"use client";

import { useCallback, useEffect, useState } from "react";
import { LogoLoader } from "@/components/motion/logo-loader";

const SEEN_KEY = "traelo_intro_seen";
// Let the draw-on animation form the logo and hold it, then fade out. The draw
// cycle is ~2.6s; we dismiss at 2.2s while the mark is fully formed (cleaner than
// catching it mid-loop-restart).
const DURATION_MS = 2200;

/**
 * Brand intro splash — a full-screen logo loader (CSS, no video) shown once per
 * session on the landing.
 *
 * The overlay container is server-rendered and hidden by CSS; the pre-paint
 * script in layout.tsx adds `.intro-playing` to <html> for first-time visitors,
 * so the cream overlay is already up at first paint (no flash of the landing).
 * Returning and reduced-motion visitors never see it (the boot script skips them).
 */
export function SiteIntro() {
  const [active, setActive] = useState(false);

  const dismiss = useCallback(() => {
    document.documentElement.classList.remove("intro-playing"); // CSS fades it out
    window.setTimeout(() => setActive(false), 500);
  }, []);

  useEffect(() => {
    if (!document.documentElement.classList.contains("intro-playing")) return;
    sessionStorage.setItem(SEEN_KEY, "1");
    const raf = requestAnimationFrame(() => setActive(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (!active) return;
    const t = window.setTimeout(dismiss, DURATION_MS);
    return () => clearTimeout(t);
  }, [active, dismiss]);

  return (
    <div className="site-intro fixed inset-0 z-[100] flex items-center justify-center bg-surface">
      {active && <LogoLoader variant="draw" />}
    </div>
  );
}
