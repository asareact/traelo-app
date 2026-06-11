"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import {
  IconClose,
  IconShield,
  IconInfo,
  IconHelp,
  IconLogout,
  IconChevronRight,
} from "@/components/brand/icons";
import { logout } from "@/features/auth";
import { routes } from "@/config/site";
import { cn } from "@/lib/utils/cn";

/**
 * Left side-drawer with the SECONDARY destinations (admin panel, info pages,
 * sign out) — the main nav stays in the bottom bar. Portaled to <body> so its
 * `position: fixed` isn't trapped by the header's `backdrop-filter`. Slides in
 * from the left; closes on backdrop click / Escape.
 */
export function MenuDrawer({
  open,
  onClose,
  isAdmin,
}: {
  open: boolean;
  onClose: () => void;
  isAdmin: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!mounted) return null;

  const overlay = (
    <div
      className={cn("fixed inset-0 z-[80]", !open && "pointer-events-none")}
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Cerrar menú"
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0",
        )}
      />

      {/* Panel */}
      <aside
        className={cn(
          "absolute left-0 top-0 flex h-full w-[82%] max-w-xs flex-col bg-bg shadow-2xl transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-5 pt-[max(env(safe-area-inset-top),1rem)] pb-4">
          <Logo variant="auto" size={28} />
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-muted transition active:scale-90"
          >
            <IconClose size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-2">
          {isAdmin && (
            <Item
              href={routes.admin}
              icon={<IconShield size={20} />}
              label="Panel de admin"
              onClick={onClose}
              highlight
            />
          )}
          <Item
            href={routes.sobreNosotros}
            icon={<IconInfo size={20} />}
            label="Sobre nosotros"
            onClick={onClose}
          />
          <Item
            href={routes.soporte}
            icon={<IconHelp size={20} />}
            label="Soporte"
            onClick={onClose}
          />
        </nav>

        <div className="border-t border-border px-3 py-3 pb-[max(env(safe-area-inset-bottom),0.75rem)]">
          <form action={logout}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-error transition hover:bg-error/5"
            >
              <IconLogout size={20} />
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>
    </div>
  );

  return createPortal(overlay, document.body);
}

function Item({
  href,
  icon,
  label,
  onClick,
  highlight,
}: {
  href: string;
  icon: ReactNode;
  label: string;
  onClick: () => void;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition",
        highlight
          ? "text-primary hover:bg-primary/5"
          : "text-text hover:bg-surface",
      )}
    >
      <span className={highlight ? "text-primary" : "text-muted"}>{icon}</span>
      <span className="flex-1">{label}</span>
      <IconChevronRight size={16} className="text-muted/50" />
    </Link>
  );
}
