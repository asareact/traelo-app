import { IconChevronRight } from "@/components/brand/icons";
import { cn } from "@/lib/utils/cn";
import { fmtCup, fmtMlc, type TasasCambio } from "@/features/cambio/domain";

const ELTOQUE_URL = "https://eltoque.com/tasas-de-cambio-cuba";

/**
 * Today's rate, clean two-value layout: 640 CUP | 1.42 MLC, per 1 USD. If the
 * feed is unavailable (`tasas` is null), shows a fallback pointing to the
 * official elTOQUE page instead of a stale/fake number.
 */
export function CambioLine({ tasas }: { tasas: TasasCambio | null }) {
  if (!tasas) {
    return (
      <a
        href={ELTOQUE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-2xl border border-dashed border-border bg-surface/50 px-5 py-3 text-center transition active:scale-[0.98]"
      >
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted">
          Cambio de hoy
        </p>
        <p className="mt-1 text-sm text-muted">
          No disponible ahora mismo
        </p>
        <span className="mt-1 inline-flex items-center gap-0.5 text-xs font-bold text-primary">
          Ver en elTOQUE
          <IconChevronRight size={13} />
        </span>
      </a>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-surface px-5 py-3">
      <p className="text-center text-[11px] font-bold uppercase tracking-wider text-muted">
        Cambio de hoy
      </p>
      <div className="mt-1.5 flex items-center justify-center gap-5">
        <Valor monto={fmtCup(tasas.usdCup)} unidad="CUP" tone="text-primary" />
        <span className="h-7 w-px bg-border" />
        <Valor monto={fmtMlc(tasas.usdMlc)} unidad="MLC" tone="text-accent" />
      </div>
      <p className="mt-1 text-center text-[10px] text-muted/70">por 1 USD</p>
    </div>
  );
}

function Valor({
  monto,
  unidad,
  tone,
}: {
  monto: string;
  unidad: string;
  tone: string;
}) {
  return (
    <div className="flex items-baseline gap-1">
      <span className={cn("text-lg font-bold tabular-nums", tone)}>{monto}</span>
      <span className="text-xs font-bold text-muted">{unidad}</span>
    </div>
  );
}
