import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { formatDate, formatUSD } from "@/lib/utils/format";
import { routes } from "@/config/site";
import {
  EstadoBadge,
  ItemList,
  OrderTracker,
  OrderTimeline,
} from "@/features/orders";
import { getPublicPedido } from "@/features/orders/queries";

export const metadata: Metadata = {
  title: "Seguimiento de pedido — Traelo",
  robots: { index: false }, // tracking links are private-by-URL, keep them out of search
};

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ nuevo?: string }>;
};

export default async function TrackingPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { nuevo } = await searchParams;

  const pedido = await getPublicPedido(id);
  if (!pedido) notFound();

  return (
    <div className="min-h-dvh bg-bg">
      <header className="border-b border-border bg-bg/95 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center justify-between px-5 py-3">
          <Link href={routes.home}>
            <Logo variant="dark" size={26} />
          </Link>
          <span className="font-mono text-xs text-muted">
            #{pedido.id.slice(0, 8)}
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md px-5 py-6">
        {nuevo === "1" && (
          <Alert tone="success" className="mb-5">
            ¡Pedido recibido! Te avisaremos cuando confirmemos el precio.
          </Alert>
        )}

        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted">Estado del pedido</p>
            <p className="mt-0.5 text-xs text-muted">
              Creado el {formatDate(pedido.created_at)}
            </p>
          </div>
          <EstadoBadge estado={pedido.estado_actual} />
        </div>

        <Card className="mb-5">
          <OrderTracker estado={pedido.estado_actual} />
        </Card>

        <section className="mb-5">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-text">
              Productos
            </h2>
            {pedido.total_real_usd !== null && (
              <span className="text-sm font-bold text-text">
                Total {formatUSD(pedido.total_real_usd)}
              </span>
            )}
          </div>
          <ItemList items={pedido.items} />
        </section>

        <section>
          <h2 className="mb-3 font-display text-lg font-bold text-text">
            Historial
          </h2>
          <OrderTimeline
            createdAt={pedido.created_at}
            historial={pedido.historial}
          />
        </section>
      </main>
    </div>
  );
}
