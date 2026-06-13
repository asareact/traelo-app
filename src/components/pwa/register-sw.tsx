"use client";

import { useEffect } from "react";

/**
 * Registers the service worker (`/sw.js`) so the app is installable (PWA / TWA)
 * and can receive Web Push. Renders nothing. Safe on every load — the browser
 * dedupes registrations. Fails silently where service workers aren't supported
 * (old browsers, insecure origins).
 */
export function RegisterSW() {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }
    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* registration failures are non-fatal (e.g. private mode) */
      });
    };
    if (document.readyState === "complete") {
      register();
      return;
    }
    window.addEventListener("load", register, { once: true });
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
