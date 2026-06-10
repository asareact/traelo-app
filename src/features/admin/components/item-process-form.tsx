"use client";

import { useActionState, useState } from "react";
import { Input, Textarea } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Alert } from "@/components/ui/alert";
import { IconCheck } from "@/components/brand/icons";
import { cn } from "@/lib/utils/cn";
import { nombreProductoEs } from "@/features/orders/domain/shein";
import { processItem, type AdminActionState } from "@/features/admin/actions";
import type { PedidoItem } from "@/types/database";

/**
 * Process one item. Two ways to fill the admin fields:
 *  - Paste a SHEIN "Copy as cURL" → "Extraer" hits /api/admin/items/[id]/process
 *    which PARSES the curl (never exec) and pre-fills name/price/image.
 *  - Type them by hand.
 * Either way, "Guardar" posts to the `processItem` action (the trust boundary),
 * which validates and marks the item processed.
 */
export function ItemProcessForm({
  item,
  index,
}: {
  item: PedidoItem;
  index: number;
}) {
  const [state, action, pending] = useActionState<AdminActionState, FormData>(
    processItem,
    {},
  );

  const sugerencia = nombreProductoEs(item.shein_url) ?? "";
  // Default to the link-derived label — SHEIN's price endpoint has no name.
  const [nombre, setNombre] = useState(item.producto_nombre || sugerencia);
  const [precio, setPrecio] = useState(
    item.precio_real_usd != null ? String(item.precio_real_usd) : "",
  );
  const [imagen, setImagen] = useState(item.producto_imagen ?? "");
  const [editImg, setEditImg] = useState(false);
  const [curl, setCurl] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState("");

  // Saved when the action succeeds OR the item already came in processed.
  const guardado = state.ok || item.procesado;

  async function extraer() {
    setExtractError("");
    if (curl.trim().length < 10) {
      setExtractError("Pega el comando curl completo.");
      return;
    }
    setExtracting(true);
    try {
      const res = await fetch(`/api/admin/items/${item.id}/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ curl }),
      });
      const data = await res.json();
      if (!res.ok) {
        setExtractError(data.error ?? "No se pudo extraer.");
      } else {
        if (data.nombre) setNombre(data.nombre);
        if (data.precio != null) setPrecio(String(data.precio));
        if (data.imagen) setImagen(data.imagen);
      }
    } catch {
      setExtractError("Error de red al consultar SHEIN.");
    } finally {
      setExtracting(false);
    }
  }

  const detalle = [
    item.talla && `Talla ${item.talla}`,
    item.color,
    `x${item.cantidad}`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div
      className={cn(
        "rounded-2xl border p-4",
        guardado ? "border-accent/40 bg-accent/[0.04]" : "border-border bg-surface",
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-muted">
            Producto {index + 1}
            {sugerencia && <span className="ml-1 text-accent">· {sugerencia}</span>}
          </p>
          <a
            href={item.shein_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block truncate text-sm font-medium text-primary hover:underline"
          >
            {item.shein_url}
          </a>
          <p className="mt-0.5 text-xs text-muted">{detalle}</p>
          {item.notas_cliente && (
            <p className="mt-0.5 text-xs italic text-muted">
              Nota: {item.notas_cliente}
            </p>
          )}
        </div>
        {guardado && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-xs font-bold text-accent">
            <IconCheck size={12} />
            Listo
          </span>
        )}
      </div>

      {/* Curl extraction */}
      <div className="mb-3 rounded-xl border border-border bg-bg p-3">
        <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-muted">
          Pegar curl de SHEIN (opcional)
        </label>
        <Textarea
          value={curl}
          onChange={(e) => setCurl(e.target.value)}
          placeholder="curl 'https://us.shein.com/bff-api/...' -H '...'"
          rows={2}
          className="font-mono text-xs"
        />
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={extraer}
            disabled={extracting}
            className="rounded-lg bg-text px-3 py-1.5 text-xs font-bold text-bg transition hover:opacity-90 disabled:opacity-50"
          >
            {extracting ? "Consultando SHEIN…" : "Extraer datos"}
          </button>
          <span className="text-xs text-muted">o llena los campos a mano</span>
        </div>
        {extractError && (
          <p className="mt-1.5 text-xs font-medium text-error">{extractError}</p>
        )}
      </div>

      {/* Save form */}
      <form action={action} className="flex flex-col gap-3">
        <input type="hidden" name="itemId" value={item.id} />

        <Field label="Nombre del producto">
          <Input
            name="producto_nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder={sugerencia || "Nombre real del producto"}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Precio real (USD)">
            <Input
              name="precio_real_usd"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              placeholder="0.00"
            />
          </Field>
          <Field label="Cantidad">
            <Input value={String(item.cantidad)} disabled readOnly />
          </Field>
        </div>

        {/* The URL is always submitted via this hidden field; the UI shows the
            actual image (not the raw URL) once we have one. */}
        <input type="hidden" name="producto_imagen" value={imagen} />
        <div>
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted">
            Imagen
          </span>

          {imagen && /^https?:\/\//i.test(imagen) && !editImg ? (
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagen}
                alt="Imagen del producto"
                className="h-32 w-24 rounded-lg border border-border bg-bg object-cover"
              />
              <div className="flex flex-col items-start gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => setEditImg(true)}
                  className="font-bold text-primary"
                >
                  Cambiar imagen
                </button>
                <a
                  href={imagen}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted hover:underline"
                >
                  Ver grande
                </a>
              </div>
            </div>
          ) : (
            <>
              <Input
                type="url"
                inputMode="url"
                value={imagen}
                onChange={(e) => setImagen(e.target.value)}
                placeholder="https://img.ltwebstatic.com/..."
              />
              {imagen && /^https?:\/\//i.test(imagen) && (
                <button
                  type="button"
                  onClick={() => setEditImg(false)}
                  className="mt-1.5 text-xs font-bold text-primary"
                >
                  Ver imagen
                </button>
              )}
            </>
          )}
        </div>

        {state.error && <Alert tone="error">{state.error}</Alert>}

        <button
          type="submit"
          disabled={pending}
          className={cn(
            "rounded-full px-5 py-2.5 text-sm font-bold transition disabled:opacity-50",
            guardado
              ? "bg-accent text-white hover:opacity-90"
              : "bg-primary text-white hover:opacity-90",
          )}
        >
          {pending
            ? "Guardando…"
            : guardado
              ? "Guardado · actualizar"
              : "Guardar item"}
        </button>
      </form>
    </div>
  );
}
