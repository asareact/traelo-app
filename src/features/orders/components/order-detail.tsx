import type { ReactNode } from "react";
import { Alert } from "@/components/ui/alert";
import { CopyLinkButton } from "@/components/ui/copy-link-button";
import { cn } from "@/lib/utils/cn";
import type { PedidoCompleto } from "@/types/database";
import { resumenEstado } from "@/features/orders/domain/estados";
import { OrderTracker } from "@/features/orders/components/order-tracker";
import { ItemList } from "@/features/orders/components/item-list";
import { CostSummary } from "@/features/orders/components/cost-summary";
import { OrderTimeline } from "@/features/orders/components/order-timeline";

/**
 * The full order-detail content (title, status tracker, products, cost,
 * history). Chrome-agnostic: the page wraps it in <AppShell> for signed-in
 * users or a standalone header for public tracking-link viewers.
 */
export function OrderDetail({
  pedido,
  nuevo,
}: {
  pedido: PedidoCompleto;
  nuevo?: boolean;
}) {
  const { label, terminal } = resumenEstado(pedido.estado_actual);

  return (
    <>
      {nuevo && (
        <Alert tone="success" className="mb-5">
          ¡Pedido recibido! Te avisaremos cuando confirmemos el precio.
        </Alert>
      )}

      <section className="mb-8">
        <h1 className="font-display text-[32px] font-bold leading-tight tracking-tight text-text">
          Detalle del pedido
        </h1>
        <div className="mt-2 flex items-center gap-3">
          <span className="font-mono text-lg font-bold text-text">
            #{pedido.id.slice(0, 8)}
          </span>
          <span
            className={cn(
              "rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider",
              terminal ? "bg-muted/15 text-muted" : "bg-primary/10 text-primary",
            )}
          >
            {label}
          </span>
        </div>
        <div className="mt-3">
          <CopyLinkButton />
        </div>
      </section>

      <Section title="Estado del pedido">
        <OrderTracker estado={pedido.estado_actual} />
      </Section>

      <Section title="Productos">
        <ItemList items={pedido.items} />
      </Section>

      <Section title="Costo del pedido">
        <CostSummary items={pedido.items} total={pedido.total_real_usd} />
      </Section>

      {pedido.peso_lb != null && (
        <Section title="Peso del paquete">
          <div className="rounded-[28px] border border-border bg-surface p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Peso confirmado</span>
              <span className="text-lg font-bold tabular-nums text-text">
                {pedido.peso_lb} lb
              </span>
            </div>
            {pedido.peso_evidencia_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={pedido.peso_evidencia_url}
                alt="Evidencia del peso del paquete"
                className="mt-4 w-full rounded-xl border border-border object-contain"
              />
            )}
          </div>
        </Section>
      )}

      <Section title="Historial de eventos" last>
        <OrderTimeline
          createdAt={pedido.created_at}
          historial={pedido.historial}
        />
      </Section>
    </>
  );
}

function Section({
  title,
  children,
  last,
}: {
  title: string;
  children: ReactNode;
  last?: boolean;
}) {
  return (
    <section className={last ? "mb-4" : "mb-10"}>
      <h2 className="mb-5 font-display text-xl font-bold text-text">{title}</h2>
      {children}
    </section>
  );
}
