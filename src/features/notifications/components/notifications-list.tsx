"use client";

import { useEffect, useTransition } from "react";
import { Trash2, X } from "lucide-react";
import { formatDateTime } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import type { Notificacion } from "@/types/database";
import {
  marcarTodasLeidas,
  eliminarNotificacion,
  limpiarNotificaciones,
} from "@/features/notifications/actions";

/**
 * Interactive notifications list. Opening the page marks everything as read
 * (clears the bell badge); each item can be deleted, and "Limpiar" clears all.
 * Unread rows get a left accent + darker text.
 */
export function NotificationsList({ items }: { items: Notificacion[] }) {
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (items.some((n) => !n.leida)) {
      void marcarTodasLeidas();
    }
  }, [items]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-xl font-bold text-text">
          Notificaciones
        </h1>
        <button
          type="button"
          onClick={() => startTransition(() => void limpiarNotificaciones())}
          disabled={pending}
          className="flex items-center gap-1.5 text-xs font-bold text-muted transition hover:text-error disabled:opacity-50"
        >
          <Trash2 size={14} />
          Limpiar
        </button>
      </div>

      <ul className="flex flex-col gap-3">
        {items.map((n) => (
          <li key={n.id}>
            <div
              className={cn(
                "relative rounded-[20px] border border-border bg-surface p-4 pr-9",
                !n.leida && "border-l-4 border-l-primary",
              )}
            >
              <p
                className={cn(
                  "text-sm leading-relaxed",
                  n.leida ? "text-muted" : "font-medium text-text",
                )}
              >
                {n.mensaje ?? n.tipo}
              </p>
              <p className="mt-1 text-xs text-muted">
                {formatDateTime(n.created_at)}
              </p>
              <button
                type="button"
                onClick={() =>
                  startTransition(() => void eliminarNotificacion(n.id))
                }
                disabled={pending}
                aria-label="Eliminar notificación"
                className="absolute right-3 top-3 text-muted transition hover:text-error disabled:opacity-50"
              >
                <X size={16} />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
