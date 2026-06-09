import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { IconPlus } from "@/components/brand/icons";
import { routes } from "@/config/site";
import { OrderCard } from "@/features/orders";
import { getMisPedidos } from "@/features/orders/queries";

export const metadata: Metadata = { title: "Inicio — Traelo" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard");

  const { data: profile } = await supabase
    .from("profiles")
    .select("nombre")
    .eq("id", user.id)
    .single();

  const pedidos = await getMisPedidos();
  const recientes = pedidos.slice(0, 3);
  const nombre = profile?.nombre?.split(" ")[0] || "";

  return (
    <AppShell>
      <header className="mb-6">
        <p className="text-sm text-muted">Hola{nombre ? `, ${nombre}` : ""} 👋</p>
        <h1 className="font-display text-2xl font-bold text-text">
          ¿Qué quieres traer hoy?
        </h1>
      </header>

      <Link
        href={routes.nuevoPedido}
        className="flex items-center gap-3 rounded-lg bg-primary p-4 text-white transition active:scale-[0.99]"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
          <IconPlus size={22} />
        </span>
        <span>
          <span className="block font-bold">Hacer un pedido</span>
          <span className="block text-sm text-white/80">
            Pega tus enlaces de SHEIN
          </span>
        </span>
      </Link>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-text">
            Pedidos recientes
          </h2>
          {pedidos.length > 3 && (
            <Link href={routes.pedidos} className="text-sm font-bold text-primary">
              Ver todos
            </Link>
          )}
        </div>

        {recientes.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted">
            Tus pedidos aparecerán aquí.
          </p>
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
