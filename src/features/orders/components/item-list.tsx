import type { PedidoItem } from "@/types/database";
import {
  nombreProductoEs,
  generoProductoEs,
} from "@/features/orders/domain/shein";

/** Read-only list of an order's products (detail page). */
export function ItemList({ items }: { items: PedidoItem[] }) {
  return (
    <ul className="flex flex-col gap-4">
      {items.map((item) => {
        const nombre =
          item.producto_nombre ??
          nombreProductoEs(item.shein_url) ??
          "Producto SHEIN";
        const genero = generoProductoEs(item.shein_url);
        const detalle = [
          genero,
          item.talla && `Talla ${item.talla}`,
          item.color,
          `x${item.cantidad}`,
        ]
          .filter(Boolean)
          .join(" · ");

        return (
          <li
            key={item.id}
            className="flex items-center gap-4 rounded-[28px] border border-border bg-surface p-4"
          >
            {item.producto_imagen ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.producto_imagen}
                alt={nombre}
                className="h-16 w-16 shrink-0 rounded-2xl border border-border object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-border bg-bg text-[11px] font-bold text-primary">
                SHEIN
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-bold text-text">
                {nombre}
              </p>
              <p className="mt-0.5 text-xs text-muted">{detalle}</p>
              <a
                href={item.shein_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block text-xs font-bold text-accent underline"
              >
                Ver en SHEIN
              </a>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
