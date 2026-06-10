import type { PedidoItem } from "@/types/database";
import {
  nombreProductoEs,
  generoProductoEs,
} from "@/features/orders/domain/shein";

/**
 * Detailed product list for the dedicated products page: a large image (3:4)
 * with the full details beside it. Read-only, public-safe (no SHEIN scraping —
 * just the stored fields).
 */
export function ItemListFull({ items }: { items: PedidoItem[] }) {
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
            className="flex gap-4 rounded-[28px] border border-border bg-surface p-4"
          >
            {item.producto_imagen ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.producto_imagen}
                alt={nombre}
                className="h-44 w-32 shrink-0 rounded-2xl border border-border bg-bg object-cover"
              />
            ) : (
              <div className="flex h-44 w-32 shrink-0 items-center justify-center rounded-2xl border border-border bg-bg text-sm font-bold text-primary">
                SHEIN
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-bold leading-snug text-text">
                {nombre}
              </p>
              <p className="mt-1 text-xs text-muted">{detalle}</p>
              {item.precio_real_usd != null && (
                <p className="mt-2 text-lg font-bold tabular-nums text-primary">
                  ${item.precio_real_usd.toFixed(2)}
                </p>
              )}
              {item.notas_cliente && (
                <p className="mt-1 text-xs italic text-muted">
                  Nota: {item.notas_cliente}
                </p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                <a
                  href={item.shein_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-accent underline"
                >
                  Ver en SHEIN
                </a>
                {item.precio_evidencia_url && (
                  <a
                    href={item.precio_evidencia_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-primary underline"
                  >
                    Ver evidencia de precio
                  </a>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
