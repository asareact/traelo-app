"use client";

import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Mobile-first modal: a bottom sheet on phones, a centered card on larger
 * screens. Closes on backdrop click or Escape, and locks body scroll while
 * open. Relies on `position: fixed` working — see the page-enter note in
 * globals.css (no residual transform on ancestors).
 */
export function Modal({
  open,
  onClose,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}) {
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

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />
      <div
        className={cn(
          "relative z-10 w-full max-w-md border border-border bg-bg p-6 shadow-2xl",
          "rounded-t-3xl pb-[calc(env(safe-area-inset-bottom)+1.5rem)] sm:rounded-3xl sm:pb-6",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
