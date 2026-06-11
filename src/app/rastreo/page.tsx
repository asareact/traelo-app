import type { Metadata } from "next";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { IconTruck } from "@/components/brand/icons";
import { routes } from "@/config/site";
import { OrderCard } from "@/features/orders";
import { getMisPedidos } from "@/features/orders/queries";

export const metadata: Metadata = { title: "Rastreo — Traelo" };

/**
 * All of the user's orders, newest first. Active orders show their milestone in
 * terracotta; delivered/cancelled ones are muted (still tappable for history).
 */
export default async function RastreoPage() {
  const pedidos = await getMisPedidos();

  return (
    <AppShell>
      <header className="mb-6">
        <p className="max-w-[280px] text-sm leading-relaxed text-muted">
          Sigue el estado de tus pedidos.
        </p>
      </header>

      {pedidos.length === 0 ? (
        <div className="mt-16 flex flex-col items-center text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-surface text-muted">
            <IconTruck size={26} />
          </span>
          <p className="mt-4 font-display text-lg font-bold text-text">
            Aún no tienes pedidos
          </p>
          <p className="mt-1 max-w-xs text-sm text-muted">
            Cuando hagas tu primer pedido, aquí seguirás su recorrido hasta Cuba.
          </p>
          <Button asChild size="lg" className="mt-6">
            <Link href={routes.nuevoPedido}>Hacer mi primer pedido</Link>
          </Button>
        </div>
      ) : (
        <ul className="flex flex-col gap-4 pb-4">
          {pedidos.map((p) => (
            <li key={p.id}>
              <OrderCard pedido={p} conAcciones />
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
