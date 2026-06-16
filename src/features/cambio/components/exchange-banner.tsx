"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { fmtCup, fmtMlc, type TasasCambio } from "@/features/cambio/domain";

/**
 * Today's CUP/MLC rate as a peeking banner: hidden by default, slides up while
 * scrolling down (so it surfaces as the client browses orders) and tucks away on
 * scroll up. Fixed above the bottom nav. Renders nothing if the feed is down.
 */
export function ExchangeBanner({ tasas }: { tasas: TasasCambio | null }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!tasas) return;
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (y > 60 && y > lastY) setVisible(true);
      else if (y < lastY) setVisible(false);
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [tasas]);

  if (!tasas) return null;

  return (
    <div
      className={cn(
        "fixed inset-x-4 z-30 mx-auto max-w-[432px] transition-transform duration-300 ease-out",
        visible ? "translate-y-0" : "translate-y-[220%]",
      )}
      style={{ bottom: "calc(env(safe-area-inset-bottom) + 88px)" }}
    >
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-primary/30 bg-surface px-4 py-3 shadow-[0_14px_34px_-12px_rgba(196,82,42,0.3)]">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-bg text-primary">
            <RefreshCw size={16} />
          </span>
          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-widest text-muted">
              Cambio de hoy
            </p>
            <p className="font-display text-[15px] font-bold leading-none text-text">
              <span className="tabular-nums text-primary">
                {fmtCup(tasas.usdCup)}
              </span>{" "}
              CUP
              <span className="mx-1.5 text-muted/60">·</span>
              <span className="tabular-nums text-accent">
                {fmtMlc(tasas.usdMlc)}
              </span>{" "}
              MLC
            </p>
          </div>
        </div>
        <span className="shrink-0 text-[10px] font-bold text-muted">
          por 1 USD
        </span>
      </div>
    </div>
  );
}
