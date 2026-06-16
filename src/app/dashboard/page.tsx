import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import {
  IconPlus,
  IconUserCheck,
  IconChevronRight,
  IconBox,
  IconHelp,
} from "@/components/brand/icons";
import { cn } from "@/lib/utils/cn";
import { formatRelativeDate } from "@/lib/utils/format";
import { routes } from "@/config/site";
import { ActiveOrderCard } from "@/features/orders";
import { getMisPedidos, type PedidoResumen } from "@/features/orders/queries";
import { esTerminal, resumenEstado } from "@/features/orders/domain/estados";
import { ExchangeBanner } from "@/features/cambio";
import { getCambioCup } from "@/features/cambio/queries";
import { completarPerfilHref, isProfileComplete } from "@/features/profile";

export const metadata: Metadata = { title: "Inicio — Traelo" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard");

  const { data: profile } = await supabase
    .from("profiles")
    .select("nombre, telefono")
    .eq("id", user.id)
    .single();

  const pedidos = await getMisPedidos();
  const recientes = pedidos.slice(0, 3);
  const perfilIncompleto = !isProfileComplete(profile);

  // Active order to surface up top: prefer one whose price is ready (needs
  // action), else the most recent in-flight order.
  const activo =
    pedidos.find((p) => p.estado_actual === "PRECIO_ACTUALIZADO") ??
    pedidos.find((p) => !esTerminal(p.estado_actual));

  const tasas = await getCambioCup();

  return (
    <AppShell>
      {/* Today's rate — sticky bar just under the header (hidden on first run) */}
      {pedidos.length > 0 && <ExchangeBanner tasas={tasas} />}

      {perfilIncompleto && <ProfileAlert />}

      {pedidos.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Hero: the active order, or a welcome headline when there's none */}
          {activo ? (
            <div className="mb-6">
              <ActiveOrderCard pedido={activo} tasas={tasas} />
            </div>
          ) : (
            <section className="mb-6 mt-2">
              <h1 className="font-display text-[30px] font-bold leading-tight tracking-tight text-text">
                ¿Qué quieres
                <br />
                <span className="text-primary">traer hoy?</span>
              </h1>
            </section>
          )}

          {/* Primary CTA — solid in light, gradient-bordered card in dark */}
          <Link
            href={routes.nuevoPedido}
            className="relative block w-full overflow-hidden rounded-[24px] bg-primary p-0.5 text-white shadow-[0_12px_30px_-8px_rgba(196,82,42,0.28)] transition active:scale-[0.97] dark:bg-gradient-to-br dark:from-primary dark:to-[#8b3a2e] dark:shadow-[0_0_24px_rgba(196,82,35,0.25)]"
          >
            <div className="relative z-10 flex items-center gap-4 rounded-[22px] p-[22px] dark:bg-bg">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 dark:bg-gradient-to-br dark:from-primary dark:to-[#8b3a2e] dark:text-black">
                <IconPlus size={26} />
              </span>
              <span className="min-w-0">
                <span className="mb-1 block text-lg font-bold leading-none dark:text-text">
                  Hacer un pedido
                </span>
                <span className="text-sm text-white/80 dark:text-muted">
                  Pega tus enlaces de SHEIN
                </span>
              </span>
              <IconChevronRight
                size={20}
                className="ml-auto shrink-0 text-white/60 dark:text-primary"
              />
            </div>
            {/* Decorative circle (light only — the dark card is bordered) */}
            <span className="pointer-events-none absolute -bottom-10 -right-8 h-32 w-32 rounded-full bg-white/10 dark:hidden" />
          </Link>

          {/* Order history */}
          <section className="mb-4 mt-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-text">
                Historial de pedidos
              </h2>
              <Link
                href={routes.pedidos}
                className="text-xs font-bold uppercase tracking-wider text-primary"
              >
                Ver todos
              </Link>
            </div>

            <ul className="space-y-3">
              {recientes.map((p) => (
                <li key={p.id}>
                  <OrderRow pedido={p} />
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </AppShell>
  );
}

/** Prompt to complete the profile (name + phone) before ordering. Teal = trust. */
function ProfileAlert() {
  return (
    <div className="mb-6 flex items-center gap-3.5 rounded-3xl border border-primary/30 bg-[#FFFCF7] p-4 shadow-sm dark:bg-surface">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface text-primary shadow-sm dark:bg-bg">
        <IconUserCheck size={20} />
      </span>
      <p className="min-w-0 flex-1 text-[13px] leading-tight text-text">
        Completa tu <span className="font-bold">nombre y teléfono</span> para
        poder comprar.
      </p>
      <Link
        href={completarPerfilHref(routes.dashboard)}
        className="shrink-0 rounded-full bg-accent px-4 py-2 text-xs font-bold text-white shadow-sm transition active:scale-95"
      >
        Completar
      </Link>
    </div>
  );
}

/** Compact history row: box mark, id · date, status, value, chevron. */
function OrderRow({ pedido }: { pedido: PedidoResumen }) {
  const { label, terminal } = resumenEstado(pedido.estado_actual);
  const entregado = pedido.estado_actual === "ENTREGADO";
  const statusColor = entregado
    ? "text-accent"
    : terminal
      ? "text-muted"
      : "text-primary";

  return (
    <Link
      href={routes.pedido(pedido.id)}
      className="group flex items-center justify-between gap-3 rounded-3xl border border-black/[0.06] bg-[#FFFCF7] p-4 shadow-sm transition active:scale-[0.98] dark:border-border dark:bg-surface"
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-accent">
          <IconBox size={20} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-bold text-text">
            <span className="font-mono">#{pedido.id.slice(0, 8)}</span>
            <span className="font-normal text-muted">
              {" "}
              · {formatRelativeDate(pedido.created_at)}
            </span>
          </p>
          <span
            className={cn(
              "text-[10px] font-bold uppercase tracking-wide",
              statusColor,
            )}
          >
            {label}
          </span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        {pedido.total_real_usd != null && (
          <span className="text-sm font-bold tabular-nums text-text">
            ${pedido.total_real_usd.toFixed(2)}
          </span>
        )}
        <IconChevronRight
          size={18}
          className="text-muted/50 transition-transform group-active:translate-x-0.5"
        />
      </div>
    </Link>
  );
}

/** First-run state: no orders yet. One inviting card with the CTA inside,
 *  plus a "how it works" link below. "traer hoy" in teal = our accent. */
function EmptyState() {
  return (
    <div className="mt-2">
      <div className="relative overflow-hidden rounded-[28px] border border-black/[0.05] bg-[#FFFCF7] px-6 py-10 text-center shadow-[0_6px_24px_-6px_rgba(0,0,0,0.08)] dark:border-border dark:bg-surface">
        {/* Decorative package mark */}
        <div className="relative mx-auto mb-7 h-24 w-24">
          <span className="flex h-24 w-24 items-center justify-center rounded-full bg-surface text-primary/20 dark:bg-bg dark:text-primary/25">
            <IconBox size={46} />
          </span>
          <span className="absolute bottom-0 right-1 h-9 w-9 rounded-2xl border border-black/[0.04] bg-[#FFFCF7] shadow-sm dark:border-border dark:bg-surface" />
        </div>

        <h1 className="font-display text-[26px] font-bold leading-tight tracking-tight text-text">
          ¿Qué quieres
          <br />
          <span className="text-accent">traer hoy?</span>
        </h1>

        <p className="mt-4 text-sm font-bold text-text">
          Tus pedidos aparecerán aquí.
        </p>
        <p className="mx-auto mt-1 max-w-[15rem] text-xs text-muted">
          Copia un link de SHEIN para comenzar
        </p>

        <Link
          href={routes.nuevoPedido}
          className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-white shadow-[0_12px_30px_-8px_rgba(196,82,42,0.32)] transition active:scale-[0.97]"
        >
          <IconPlus size={18} />
          Hacer tu primer pedido
        </Link>
      </div>

      {/* How it works */}
      <div className="mt-4 flex justify-center">
        <Link
          href={routes.sobreNosotros}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-[#FFFCF7] px-4 py-2 text-xs font-medium text-muted shadow-sm transition active:scale-[0.97] dark:bg-surface"
        >
          <IconHelp size={14} />
          ¿Cómo funciona Traelo?
          <IconChevronRight size={13} className="text-muted/60" />
        </Link>
      </div>
    </div>
  );
}
