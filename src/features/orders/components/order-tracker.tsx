import {
  MILESTONES,
  MILESTONE_LABEL,
  MILESTONE_DESC,
  milestoneIndex,
  type Estado,
} from "@/features/orders/domain/estados";
import { IconCheck } from "@/components/brand/icons";
import { cn } from "@/lib/utils/cn";

/**
 * Vertical milestone tracker (mobile-first) — the 6 client-facing phases.
 * Cancelled orders render a distinct banner instead of the stepper.
 */
export function OrderTracker({ estado }: { estado: Estado }) {
  if (estado === "CANCELADO") {
    return (
      <div className="rounded-lg border border-error/30 bg-error/5 p-4 text-sm font-medium text-error">
        Este pedido fue cancelado. Si crees que es un error, escríbenos.
      </div>
    );
  }

  const current = milestoneIndex(estado);

  return (
    <ol className="relative">
      {MILESTONES.map((m, i) => {
        const done = i < current;
        const active = i === current;
        const last = i === MILESTONES.length - 1;

        return (
          <li key={m} className="flex gap-3.5">
            {/* Rail + node */}
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition",
                  done && "border-accent bg-accent text-white",
                  active && "border-primary bg-primary text-white",
                  !done && !active && "border-border bg-bg text-muted",
                )}
              >
                {done ? (
                  <IconCheck size={15} />
                ) : (
                  <span className="text-xs font-bold">{i + 1}</span>
                )}
              </span>
              {!last && (
                <span
                  className={cn(
                    "w-0.5 flex-1",
                    i < current ? "bg-accent" : "bg-border",
                  )}
                />
              )}
            </div>

            {/* Text */}
            <div className={cn("pb-6", last && "pb-0")}>
              <p
                className={cn(
                  "text-[15px] font-bold leading-tight",
                  active ? "text-text" : done ? "text-text" : "text-muted",
                )}
              >
                {MILESTONE_LABEL[m]}
              </p>
              <p className="mt-0.5 text-sm text-muted">{MILESTONE_DESC[m]}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
