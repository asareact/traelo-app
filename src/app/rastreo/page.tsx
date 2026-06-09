import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { IconTruck } from "@/components/brand/icons";
import { OrderCard } from "@/features/orders";
import { getMisPedidos } from "@/features/orders/queries";

export const metadata: Metadata = { title: "Rastreo — Traelo" };

/** Orders currently in flight — everything that isn't delivered or cancelled. */
export default async function RastreoPage() {
  const pedidos = await getMisPedidos();
  const enCurso = pedidos.filter(
    (p) => p.estado_actual !== "ENTREGADO" && p.estado_actual !== "CANCELADO",
  );

  return (
    <AppShell>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold text-text">Rastreo</h1>
        <p className="mt-1 text-sm text-muted">
          Sigue el estado de tus pedidos en camino.
        </p>
      </header>

      {enCurso.length === 0 ? (
        <div className="mt-16 flex flex-col items-center text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-surface text-muted">
            <IconTruck size={26} />
          </span>
          <p className="mt-4 font-display text-lg font-bold text-text">
            No tienes pedidos en camino
          </p>
          <p className="mt-1 max-w-xs text-sm text-muted">
            Cuando un pedido esté en proceso, aquí podrás seguir su recorrido.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {enCurso.map((p) => (
            <li key={p.id}>
              <OrderCard pedido={p} />
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
