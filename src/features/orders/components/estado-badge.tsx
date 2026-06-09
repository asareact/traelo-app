import {
  ESTADO_LABEL,
  milestoneDe,
  type Estado,
} from "@/features/orders/domain/estados";
import { cn } from "@/lib/utils/cn";

/** Pill showing the order's current state, tinted by milestone / terminal. */
export function EstadoBadge({
  estado,
  className,
}: {
  estado: Estado;
  className?: string;
}) {
  const tone =
    estado === "CANCELADO"
      ? "border-error/30 bg-error/10 text-error"
      : estado === "ENTREGADO"
        ? "border-accent/30 bg-accent/10 text-accent"
        : milestoneDe(estado) === "transito" ||
            milestoneDe(estado) === "entrega"
          ? "border-info/30 bg-info/10 text-info"
          : "border-primary/30 bg-primary/10 text-primary";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold",
        tone,
        className,
      )}
    >
      {ESTADO_LABEL[estado]}
    </span>
  );
}
