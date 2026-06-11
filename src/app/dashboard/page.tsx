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
import { routes } from "@/config/site";
import { OrderCard, ActiveOrderCard } from "@/features/orders";
import { getMisPedidos } from "@/features/orders/queries";
import { esTerminal } from "@/features/orders/domain/estados";
import { CambioLine } from "@/features/cambio";
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

  const stats = {
    activos: pedidos.filter((p) => !esTerminal(p.estado_actual)).length,
    entregados: pedidos.filter((p) => p.estado_actual === "ENTREGADO").length,
    usd: pedidos
      .filter((p) => p.estado_actual !== "CANCELADO")
      .reduce((s, p) => s + (p.total_real_usd ?? 0), 0),
  };

  const tasas = await getCambioCup();

  return (
    <AppShell>
      {activo && <ActiveOrderCard pedido={activo} />}

      {/* Hero CTA (the greeting now lives in the header) */}
      <section className="mb-7">
        <h1 className="font-display text-[32px] font-bold leading-tight tracking-tight text-text">
          ¿Qué quieres
          <br />
          <span className="text-primary">traer hoy?</span>
        </h1>
      </section>

      {/* Profile prompt (teal — trust accent) */}
      {perfilIncompleto && (
        <div className="mb-7 flex items-start gap-3 rounded-2xl border border-accent/20 bg-accent/10 p-4 dark:bg-white/[0.04]">
          <span className="mt-0.5 shrink-0 text-accent">
            <IconUserCheck size={20} />
          </span>
          <p className="text-sm leading-relaxed text-text">
            Completa tu{" "}
            <Link
              href={completarPerfilHref(routes.dashboard)}
              className="font-bold text-accent underline decoration-accent/30"
            >
              nombre y teléfono
            </Link>{" "}
            para poder empezar a realizar tus pedidos.
          </p>
        </div>
      )}

      {/* Main CTA — solid in light, gradient-bordered card in dark */}
      <Link
        href={routes.nuevoPedido}
        className="block w-full rounded-[24px] bg-primary p-0.5 text-white shadow-[0_12px_30px_-8px_rgba(196,82,42,0.28)] transition active:scale-[0.97] dark:bg-gradient-to-br dark:from-primary dark:to-[#8b3a2e] dark:shadow-[0_0_24px_rgba(196,82,35,0.25)]"
      >
        <div className="flex items-center gap-4 rounded-[22px] p-[22px] dark:bg-bg">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/15 dark:bg-gradient-to-br dark:from-primary dark:to-[#8b3a2e] dark:text-black">
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
      </Link>

      {/* Your stats */}
      {pedidos.length > 0 && (
        <div className="mt-6 grid grid-cols-3 gap-3">
          <Stat value={String(stats.activos)} label="Activos" />
          <Stat value={String(stats.entregados)} label="Entregados" />
          <Stat value={`$${Math.round(stats.usd)}`} label="USD" />
        </div>
      )}

      {/* Today's exchange rate (falls back to an elTOQUE link if unavailable) */}
      <div className="mt-4">
        <CambioLine tasas={tasas} />
      </div>

      {/* Recent orders */}
      <section className="mt-12">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-text">
            Pedidos recientes
          </h2>
          {pedidos.length > 0 && (
            <Link
              href={routes.pedidos}
              className="flex items-center gap-1 text-sm font-bold text-primary"
            >
              Ver todos
              <IconChevronRight size={14} />
            </Link>
          )}
        </div>

        {recientes.length === 0 ? (
          <EmptyOrders />
        ) : (
          <ul className="flex flex-col gap-3">
            {recientes.map((p) => (
              <li key={p.id}>
                <OrderCard pedido={p} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </AppShell>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface px-3 py-3 text-center">
      <div className="font-display text-2xl font-bold tabular-nums text-text">
        {value}
      </div>
      <div className="mt-0.5 text-xs font-medium text-muted">{label}</div>
    </div>
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
