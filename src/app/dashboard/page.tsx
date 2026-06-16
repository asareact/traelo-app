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
      {perfilIncompleto && <ProfileAlert />}

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
          {pedidos.length > 0 && (
            <Link
              href={routes.pedidos}
              className="text-xs font-bold uppercase tracking-wider text-primary"
            >
              Ver todos
            </Link>
          )}
        </div>

        {recientes.length === 0 ? (
          <EmptyOrders />
        ) : (
          <ul className="space-y-3">
            {recientes.map((p) => (
              <li key={p.id}>
                <OrderRow pedido={p} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Today's rate — peeks in on scroll */}
      <ExchangeBanner tasas={tasas} />
    </AppShell>
  );
}

/** Prompt to complete the profile (name + phone) before ordering. Teal = trust. */
function ProfileAlert() {
  return (
    <div className="mb-6 flex items-center gap-3.5 rounded-3xl border border-primary/30 bg-surface p-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-bg text-primary shadow-sm">
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
      className="group flex items-center justify-between gap-3 rounded-3xl border border-border bg-surface p-4 transition active:scale-[0.98]"
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

function EmptyOrders() {
  return (
    <div className="flex aspect-[16/9] w-full flex-col items-center justify-center rounded-[28px] border-2 border-dashed border-border bg-surface/40 px-6 text-center">
      <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-surface text-muted">
        <IconBox size={24} />
      </span>
      <p className="font-medium text-muted">Tus pedidos aparecerán aquí.</p>
      <p className="mt-1 text-xs text-muted/70">
        Copia un link de SHEIN para comenzar
      </p>
    </div>
  );
}
