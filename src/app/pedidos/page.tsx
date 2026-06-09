import type { Metadata } from "next";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { IconBox } from "@/components/brand/icons";
import { routes } from "@/config/site";
import { OrderCard } from "@/features/orders";
import { getMisPedidos } from "@/features/orders/queries";

export const metadata: Metadata = { title: "Mis pedidos — Traelo" };

export default async function PedidosPage() {
  const pedidos = await getMisPedidos();

  return (
    <AppShell>
      <header className="mb-6 flex items-end justify-between">
        <h1 className="font-display text-2xl font-bold text-text">
          Mis pedidos
        </h1>
        <Button asChild size="sm">
          <Link href={routes.nuevoPedido}>Nuevo</Link>
        </Button>
      </header>

      {pedidos.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="flex flex-col gap-3">
          {pedidos.map((p) => (
            <li key={p.id}>
              <OrderCard pedido={p} />
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}

function EmptyState() {
  return (
    <div className="mt-16 flex flex-col items-center text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-surface text-muted">
        <IconBox size={26} />
      </span>
      <p className="mt-4 font-display text-lg font-bold text-text">
        Aún no tienes pedidos
      </p>
      <p className="mt-1 max-w-xs text-sm text-muted">
        Crea tu primer pedido con los enlaces de SHEIN que quieras traer a Cuba.
      </p>
      <Button asChild size="lg" className="mt-6">
        <Link href={routes.nuevoPedido}>Hacer mi primer pedido</Link>
      </Button>
    </div>
  );
}
