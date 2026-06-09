"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";

const SEEN_KEY = "traelo_intro_seen";
const HARD_CAP_MS = 12000; // safety net if the video never fires `ended`

/**
 * Brand intro splash: a full-screen logo-reveal video that plays once per
 * browser session. Skipped entirely for reduced-motion users. Mounts only
 * after hydration (no SSR flash / mismatch). Dismissible via "Saltar".
 *
 * Mobile: object-cover (full-bleed; the centered wordmark stays intact).
 * Desktop: object-contain on black so nothing is cropped.
 */
export function SiteIntro() {
  const [show, setShow] = useState(false);
  const [closing, setClosing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) return;
    if (sessionStorage.getItem(SEEN_KEY)) return;

    sessionStorage.setItem(SEEN_KEY, "1");
    const raf = requestAnimationFrame(() => setShow(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (!show) return;

    // Try to start playback; if autoplay is blocked, don't trap the user.
    const v = videoRef.current;
    const p = v?.play?.();
    if (p && typeof p.catch === "function") p.catch(() => dismiss());

    const cap = window.setTimeout(dismiss, HARD_CAP_MS);
    return () => clearTimeout(cap);
  }, [show]);

  function dismiss() {
    setClosing(true);
    window.setTimeout(() => setShow(false), 500);
  }

  if (!show) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center bg-black transition-opacity duration-500",
        closing ? "opacity-0" : "opacity-100",
      )}
    >
      <video
        ref={videoRef}
        className="h-full w-full object-cover md:object-contain"
        src="/intro.mp4"
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={dismiss}
      />
      <button
        type="button"
        onClick={dismiss}
        className="absolute right-5 top-5 rounded-full bg-white/10 px-4 py-1.5 text-sm font-bold text-white backdrop-blur-sm transition active:scale-95"
        style={{ top: "calc(env(safe-area-inset-top) + 1.25rem)" }}
      >
        Saltar
      </button>
    </div>
  );
}
