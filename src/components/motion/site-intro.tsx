"use client";

import { useEffect, useState } from "react";

const SEEN_KEY = "traelo_intro_seen";

/**
 * Brand intro splash: the teal arrow drops into the terracotta box (the logo),
 * the wordmark fades up, then the overlay fades out. Plays once per browser
 * session and is skipped entirely for users who prefer reduced motion.
 *
 * Renders nothing on the server / for returning visitors, so there's no flash
 * and no hydration mismatch — it mounts after hydration only when it should play.
 */
export function SiteIntro() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) return;
    if (sessionStorage.getItem(SEEN_KEY)) return;

    sessionStorage.setItem(SEEN_KEY, "1");
    // Defer the reveal one frame so it isn't a synchronous setState in the
    // effect body (avoids cascading renders).
    const raf = requestAnimationFrame(() => setShow(true));
    const t = setTimeout(() => setShow(false), 2380);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, []);

  if (!show) return null;

  return (
    <div
      className="intro-overlay fixed inset-0 z-[100] flex flex-col items-center justify-center bg-bg"
      aria-hidden="true"
    >
      <div className="relative h-[84px] w-[84px]">
        {/* Box (assembles in) */}
        <svg
          className="intro-box absolute inset-0"
          width={84}
          height={84}
          viewBox="0 0 48 48"
          fill="none"
        >
          <path d="M8 20 L24 27 L24 44 L8 36 Z" fill="#A8431F" />
          <path d="M40 20 L24 27 L24 44 L40 36 Z" fill="#C4522A" />
          <path d="M8 20 L16 16 L32 23 L24 27 Z" fill="#D5673D" />
          <path d="M40 20 L32 16 L16 23 L24 27 Z" fill="#C4522A" />
        </svg>
        {/* Arrow (drops in) */}
        <svg
          className="intro-arrow absolute inset-0"
          width={84}
          height={84}
          viewBox="0 0 48 48"
          fill="none"
        >
          <path
            d="M30 6 C 34 12, 34 18, 27 22 L31 22 L24 30 L17 22 L21 22 C 26 18, 25 12, 22 9"
            fill="#00B5A0"
            stroke="#00B5A0"
            strokeWidth="0.5"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <span className="intro-word mt-4 font-display text-2xl font-bold tracking-tight text-text">
        traelo<span style={{ color: "#C4522A" }}>.</span>
      </span>
      <span className="intro-tagline mt-1.5 text-sm font-medium text-muted">
        Compra afuera, recibe aquí.
      </span>
    </div>
  );
}
