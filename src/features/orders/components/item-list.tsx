import { formatUSD } from "@/lib/utils/format";
import type { PedidoItem } from "@/types/database";

/** Read-only list of an order's products (tracking page). */
export function ItemList({ items }: { items: PedidoItem[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <li
          key={item.id}
          className="flex gap-3 rounded-lg border border-border bg-surface p-3"
        >
          {item.producto_imagen ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.producto_imagen}
              alt={item.producto_nombre ?? "Producto"}
              className="h-16 w-16 shrink-0 rounded-md object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-bg text-xs text-muted">
              SHEIN
            </div>
          )}

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-text">
              {item.producto_nombre ?? "Producto por confirmar"}
            </p>
            <p className="mt-0.5 text-xs text-muted">
              {[
                item.talla && `Talla ${item.talla}`,
                item.color,
                `x${item.cantidad}`,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
            <a
              href={item.shein_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block truncate text-xs font-medium text-accent"
            >
              Ver en SHEIN
            </a>
          </div>

          {item.precio_real_usd !== null && (
            <span className="shrink-0 text-sm font-bold text-text">
              {formatUSD(item.precio_real_usd)}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
