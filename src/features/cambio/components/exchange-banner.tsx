import { RefreshCw } from "lucide-react";
import { fmtCup, fmtMlc, type TasasCambio } from "@/features/cambio/domain";

/**
 * Today's CUP/MLC rate as a thin bar that sticks just below the app header, so
 * it's always visible while scrolling the dashboard. Full-bleed within the
 * content column (-mx-5 escapes the page padding). Renders nothing if the feed
 * is down. The sticky `top` matches the header height (safe-area + h-14).
 */
export function ExchangeBanner({ tasas }: { tasas: TasasCambio | null }) {
  if (!tasas) return null;

  return (
    <div
      className="sticky z-30 -mx-5 mb-5 flex items-center justify-between gap-3 border-b border-border/60 bg-surface px-5 py-2.5"
      style={{ top: "calc(max(env(safe-area-inset-top), 0.5rem) + 3.5rem)" }}
    >
      <div className="flex min-w-0 items-center gap-2">
        <RefreshCw size={14} className="shrink-0 text-primary" />
        <p className="truncate text-sm font-bold tracking-tight text-text">
          <span className="tabular-nums text-primary">
            {fmtCup(tasas.usdCup)}
          </span>{" "}
          CUP
          <span className="mx-1.5 text-muted/50">·</span>
          <span className="tabular-nums text-accent">
            {fmtMlc(tasas.usdMlc)}
          </span>{" "}
          MLC
        </p>
      </div>
      <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-muted">
        por 1 USD
      </span>
    </div>
  );
}
