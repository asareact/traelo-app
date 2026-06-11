import { formatUSD } from "@/lib/utils/format";
import { totalProductos } from "@/features/orders/domain/pricing";
import {
  convertirUsd,
  fmtCup,
  fmtMlc,
  type TasasCambio,
} from "@/features/cambio";
import type { PedidoItem } from "@/types/database";

/**
 * Order cost breakdown. Subtotal comes from the admin-confirmed item prices;
 * the total comes from pedidos.total_real_usd; shipping is the difference when
 * both are known. Until the admin sets prices, we show the "to be confirmed"
 * message instead of a fake breakdown.
 */
export function CostSummary({
  items,
  total,
  tasas,
}: {
  items: PedidoItem[];
  total: number | null;
  tasas?: TasasCambio | null;
}) {
  const subtotal = totalProductos(items);
  const envio =
    total !== null && subtotal !== null ? Math.max(0, total - subtotal) : null;
  const montoUsd = total ?? subtotal;
  const enCup = montoUsd !== null && tasas ? convertirUsd(montoUsd, tasas) : null;

  if (subtotal === null && total === null) {
    return (
      <div className="rounded-[28px] border border-border bg-surface p-6 text-center">
        <p className="text-sm text-muted">
          Te confirmaremos el precio final antes de cualquier pago.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4 rounded-[28px] border border-border bg-surface p-6">
        <Row label="Subtotal productos" value={subtotal} />
        <Row label="Envío a Cuba" value={envio} />
        <div className="flex items-center justify-between border-t border-border pt-4">
          <span className="font-bold text-text">Total estimado</span>
          <span className="text-xl font-bold text-primary">
            {formatUSD(total ?? subtotal)}
          </span>
        </div>
        {enCup && (
          <div className="flex items-center justify-end gap-2 text-sm">
            <span className="font-bold tabular-nums text-text">
              ≈ {fmtCup(enCup.cup)} CUP
            </span>
            <span className="text-muted/40">·</span>
            <span className="font-bold tabular-nums text-accent">
              {fmtMlc(enCup.mlc)} MLC
            </span>
          </div>
        )}
      </div>
      <p className="mt-4 px-4 text-center text-[11px] leading-relaxed text-muted">
        El total final puede variar tras confirmar el peso y la cotización
        oficial.
      </p>
    </>
  );
}

function Row({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted">{label}</span>
      <span className="font-medium text-text">
        {value === null ? "Por confirmar" : formatUSD(value)}
      </span>
    </div>
  );
}
