import type { PedidoItem } from "@/types/database";
import { IconLink } from "@/components/brand/icons";
import {
  nombreProductoEs,
  generoProductoEs,
} from "@/features/orders/domain/shein";

/**
 * Detailed product list for the dedicated products page — "playful" variant:
 * a terracotta-bordered card with an offset hard shadow, the product image in a
 * rounded frame, and the price in a soft bubble. Read-only, public-safe. Uses
 * design tokens so it adapts to dark mode.
 */
export function ItemListFull({ items }: { items: PedidoItem[] }) {
  return (
    <ul className="flex flex-col gap-5">
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
            className="relative flex items-center gap-4 rounded-[36px] border-[3px] border-primary bg-gradient-to-br from-bg to-surface p-5 shadow-[0_10px_0px_rgba(196,82,42,0.1)]"
          >
            {/* Image frame */}
            <div className="shrink-0">
              <div className="h-[130px] w-[110px] overflow-hidden rounded-[24px] border-2 border-border bg-bg">
                {item.producto_imagen ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.producto_imagen}
                    alt={nombre}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm font-bold text-primary">
                    SHEIN
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex flex-1 flex-col justify-between py-1">
              <div>
                <h2 className="mb-1.5 line-clamp-2 text-sm font-bold leading-snug text-text">
                  {nombre}
                </h2>
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted">
                  {detalle}
                </p>
              </div>

              <div className="mt-3">
                {item.precio_real_usd != null && (
                  <div className="mb-3 inline-flex rounded-xl bg-primary/10 px-4 py-2">
                    <span className="font-display text-[22px] font-bold text-primary">
                      ${item.precio_real_usd.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <a
                    href={item.shein_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-bold text-accent underline decoration-accent/30 decoration-2 underline-offset-4 active:opacity-60"
                  >
                    <IconLink size={14} />
                    Ver en SHEIN
                  </a>
                  {item.precio_evidencia_url && (
                    <a
                      href={item.precio_evidencia_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs font-bold text-primary underline decoration-primary/30 decoration-2 underline-offset-4 active:opacity-60"
                    >
                      <IconLink size={14} />
                      Ver evidencia de precio
                    </a>
                  )}
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
