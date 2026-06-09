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
 * Milestone tracker — the 6 client-facing phases as a numbered vertical
 * stepper inside a card. Completed steps are checked, the current step shows
 * its description, upcoming steps are muted. Cancelled orders show a banner.
 */
export function OrderTracker({ estado }: { estado: Estado }) {
  if (estado === "CANCELADO") {
    return (
      <div className="rounded-[32px] border border-error/30 bg-error/5 p-6 text-sm font-medium text-error">
        Este pedido fue cancelado. Si crees que es un error, escríbenos.
      </div>
    );
  }

  const current = milestoneIndex(estado);

  return (
    <div className="rounded-[32px] border border-border bg-surface/40 p-6">
      <ol className="relative">
        {MILESTONES.map((m, i) => {
          const done = i < current;
          const active = i === current;
          const last = i === MILESTONES.length - 1;

          return (
            <li key={m} className="flex gap-4">
              {/* Node + connector */}
              <div className="flex flex-col items-center">
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition",
                    done || active
                      ? "bg-primary text-white shadow-md"
                      : "border-2 border-border bg-bg text-muted",
                  )}
                >
                  {done ? <IconCheck size={16} /> : i + 1}
                </span>
                {!last && (
                  <span
                    className={cn(
                      "w-0.5 flex-1",
                      done ? "bg-primary/40" : "bg-border",
                    )}
                  />
                )}
              </div>

              {/* Label + (active) description */}
              <div className={cn("flex-1", last ? "pb-0" : "pb-8")}>
                <h4
                  className={cn(
                    "text-[16px] font-bold leading-tight",
                    done || active ? "text-text" : "text-muted/60",
                  )}
                >
                  {MILESTONE_LABEL[m]}
                </h4>
                {active && (
                  <p className="mt-1 text-sm leading-snug text-muted">
                    {MILESTONE_DESC[m]}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
