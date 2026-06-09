"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const SEEN_KEY = "traelo_intro_seen";
const HARD_CAP_MS = 4500; // safety net if the video never fires `ended` (clip ~3s)

/**
 * Brand intro splash — a full-screen logo-reveal video shown once per session.
 *
 * The overlay container is server-rendered and hidden by CSS; the pre-paint
 * script in layout.tsx adds `.intro-playing` to <html> for first-time visitors,
 * so the black overlay is already up at first paint (no flash of the landing).
 * The video element only mounts when actually playing — returning and
 * reduced-motion users never download it.
 *
 * Fit: full-bleed on mobile (object-cover, centered wordmark stays intact);
 * a centered full-height portrait column on larger screens (nothing cropped).
 */
export function SiteIntro() {
  const [active, setActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

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
    const p = videoRef.current?.play?.();
    if (p && typeof p.catch === "function") p.catch(dismiss);
    const cap = window.setTimeout(dismiss, HARD_CAP_MS);
    return () => clearTimeout(cap);
  }, [active, dismiss]);

  return (
    <div className="site-intro fixed inset-0 z-[100] flex items-center justify-center bg-black">
      {active && (
        <>
          <video
            ref={videoRef}
            className="h-dvh w-full object-cover sm:w-auto sm:object-contain"
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
            className="absolute right-5 rounded-full bg-white/10 px-4 py-1.5 text-sm font-bold text-white backdrop-blur-sm transition active:scale-95"
            style={{ top: "calc(env(safe-area-inset-top) + 1.25rem)" }}
          >
            Saltar
          </button>
        </>
      )}
    </div>
  );
}
