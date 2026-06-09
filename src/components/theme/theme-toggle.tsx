"use client";

import { useEffect, useState } from "react";
import { IconSun, IconMoon } from "@/components/brand/icons";

/**
 * Light/dark toggle. The theme class is applied pre-paint by the inline script
 * in layout.tsx; this button reads the live state on mount, then flips the
 * `.dark` class on <html> and persists the choice to localStorage.
 */
export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setDark(document.documentElement.classList.contains("dark"));
      setMounted(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // localStorage unavailable (private mode) — theme just won't persist.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-muted shadow-sm transition active:scale-90"
    >
      {/* Render nothing until mounted to avoid an icon mismatch on hydration. */}
      {mounted && (dark ? <IconSun size={19} /> : <IconMoon size={19} />)}
    </button>
  );
}
