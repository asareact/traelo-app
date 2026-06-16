"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Check,
  ChevronDown,
  Camera,
  Eye,
  Package2,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { routes } from "@/config/site";
import {
  MILESTONES,
  MILESTONE_LABEL,
  milestoneDe,
  milestoneIndex,
  type Milestone,
} from "@/features/orders/domain/estados";
import { convertirUsd, fmtCup, type TasasCambio } from "@/features/cambio/domain";
import type { PedidoResumen } from "@/features/orders/queries";

/** Short labels for the compact horizontal timeline (the full names live on the
 *  expanded list + the tracking page). */
const MILESTONE_CORTO: Record<Milestone, string> = {
  cotizacion: "Cotización",
  pago: "Pago",
  compra: "Compra",
  preparacion: "Envío",
  transito: "Rumbo",
  entrega: "Entrega",
};

/**
 * "Your current order" hero for the home — answers "where's my order?" at a
 * glance: the milestone, the value (USD → CUP at today's rate), a horizontal
 * progress timeline (expandable to the full milestone list), and quick links.
 * When the price is ready (PRECIO_ACTUALIZADO) it flags the action to accept it.
 */
export function ActiveOrderCard({
  pedido,
  tasas,
}: {
  pedido: PedidoResumen;
  tasas: TasasCambio | null;
}) {
  const [abierto, setAbierto] = useState(false);

  const actual = milestoneIndex(pedido.estado_actual);
  const milestoneActual = milestoneDe(pedido.estado_actual);
  const precioListo = pedido.estado_actual === "PRECIO_ACTUALIZADO";

  const usd = pedido.total_real_usd;
  const cup = usd != null && tasas ? convertirUsd(usd, tasas).cup : null;
  const tieneEvidencia = !!pedido.peso_evidencia_url;

  return (
    <section className="rounded-[28px] border border-black/[0.05] bg-[#FFFCF7] p-5 shadow-[0_6px_24px_-6px_rgba(0,0,0,0.08)] dark:border-border dark:bg-surface">
      {/* Header — milestone + id + value, with a package mark */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
            {MILESTONE_LABEL[milestoneActual]}
          </span>
          <p className="mt-2 font-mono text-[11px] font-medium text-muted">
            #{pedido.id.slice(0, 8)}
          </p>

          {usd != null ? (
            <div className="mt-1 flex flex-wrap items-end gap-x-1.5 gap-y-0.5">
              <span className="font-display text-2xl font-bold tabular-nums text-text">
                ${usd.toFixed(2)}
              </span>
              <span className="mb-1 text-xs font-bold text-muted">USD</span>
              {cup != null && (
                <>
                  <ArrowRight size={16} className="mb-1.5 text-primary" />
                  <span className="font-display text-xl font-bold tabular-nums text-primary">
                    {fmtCup(cup)}
                  </span>
                  <span className="mb-1 text-[10px] font-bold text-primary">
                    CUP
                  </span>
                </>
              )}
            </div>
          ) : (
            <p className="mt-1.5 text-base font-bold text-text">
              {pedido.total_items}{" "}
              {pedido.total_items === 1 ? "producto" : "productos"}
            </p>
          )}

          {precioListo && (
            <p className="mt-1.5 text-xs font-bold text-primary">
              ¡Tu precio está listo! Revísalo y acéptalo.
            </p>
          )}
        </div>

        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-surface text-muted dark:bg-bg">
          <Package2 size={22} />
        </span>
      </div>

      {/* Horizontal milestone timeline — colored dots + labels per state */}
      <div className="relative mb-1 mt-6">
        <div className="absolute left-[8.333%] right-[8.333%] top-3 h-0.5 bg-border" />
        <div className="relative z-10 flex">
          {MILESTONES.map((m, i) => {
            const completado = i < actual;
            const esActual = i === actual;
            return (
              <div key={m} className="flex flex-1 flex-col items-center gap-1.5">
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-white dark:ring-surface",
                    completado && "bg-accent text-white",
                    esActual && "border-2 border-primary bg-white dark:bg-surface",
                    !completado && !esActual && "bg-border",
                  )}
                >
                  {completado && <Check size={13} />}
                  {esActual && (
                    <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                  )}
                </span>
                <span
                  className={cn(
                    "text-center text-[8px] font-bold uppercase leading-tight tracking-tight",
                    completado && "text-accent",
                    esActual && "text-primary",
                    !completado && !esActual && "text-muted/50",
                  )}
                >
                  {MILESTONE_CORTO[m]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expand toggle */}
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className="mt-3 flex w-full items-center justify-center gap-1.5 border-t border-border/60 pt-3 text-[11px] font-bold uppercase tracking-widest text-muted active:scale-[0.99]"
      >
        {abierto ? "Ocultar" : "Ver"} progreso
        <ChevronDown
          size={14}
          className={cn("transition-transform", abierto && "rotate-180")}
        />
      </button>

      {/* Expanded full milestone list */}
      {abierto && (
        <ul className="mt-3 space-y-3">
          {MILESTONES.map((m, i) => {
            const completado = i < actual;
            const esActual = i === actual;
            return (
              <li
                key={m}
                className={cn(
                  "flex items-center gap-3",
                  !completado && !esActual && "opacity-40",
                )}
              >
                <span
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                    completado && "bg-accent text-white",
                    esActual && "bg-primary text-white",
                    !completado && !esActual && "bg-border",
                  )}
                >
                  {(completado || esActual) && <Check size={11} />}
                </span>
                <span
                  className={cn(
                    "text-sm",
                    esActual ? "font-bold text-text" : "text-muted",
                  )}
                >
                  {MILESTONE_LABEL[m]}
                </span>
                {esActual && (
                  <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-primary">
                    Ahora
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* Quick actions */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <Link
          href={
            tieneEvidencia
              ? routes.pedido(pedido.id)
              : `${routes.pedido(pedido.id)}/productos`
          }
          className="flex items-center justify-center gap-2 rounded-2xl border border-border py-3 text-xs font-bold text-muted transition active:scale-[0.98]"
        >
          {tieneEvidencia ? (
            <Camera size={16} className="text-accent" />
          ) : (
            <Package2 size={16} className="text-accent" />
          )}
          {tieneEvidencia ? "Evidencia" : "Productos"}
        </Link>
        <Link
          href={routes.pedido(pedido.id)}
          className="flex items-center justify-center gap-2 rounded-2xl border border-border py-3 text-xs font-bold text-muted transition active:scale-[0.98]"
        >
          <Eye size={16} className="text-primary" />
          Detalles
        </Link>
      </div>
    </section>
  );
}
