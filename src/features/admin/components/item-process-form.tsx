"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input, Textarea } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Alert } from "@/components/ui/alert";
import { IconCheck } from "@/components/brand/icons";
import { cn } from "@/lib/utils/cn";
import { nombreProductoEs } from "@/features/orders/domain/shein";
import { processItem } from "@/features/admin/actions";
import type { PedidoItem } from "@/types/database";

/**
 * Process one item. Fill name + real price + product image (paste a SHEIN
 * "Copy as cURL" → "Extraer", or by hand) and optionally a PRICE EVIDENCE
 * screenshot. On save the product image is re-hosted in our bucket and the
 * evidence is uploaded to Storage; `processItem` (the trust boundary) persists
 * everything and recomputes the order total. Re-saving updates the price/images
 * (SHEIN prices vary day to day).
 */
export function ItemProcessForm({
  item,
  index,
}: {
  item: PedidoItem;
  index: number;
}) {
  const router = useRouter();
  const sugerencia = nombreProductoEs(item.shein_url) ?? "";
  const [nombre, setNombre] = useState(item.producto_nombre || sugerencia);
  const [precio, setPrecio] = useState(
    item.precio_real_usd != null ? String(item.precio_real_usd) : "",
  );
  const [imagen, setImagen] = useState(item.producto_imagen ?? "");
  const [editImg, setEditImg] = useState(false);

  // Price evidence (screenshot of the product showing its price).
  const [evidFile, setEvidFile] = useState<File | null>(null);
  const [evidPreview, setEvidPreview] = useState(item.precio_evidencia_url ?? "");

  const [curl, setCurl] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState("");

  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState("");

  const guardado = ok || item.procesado;

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
        if (data.imagen) {
          setImagen(data.imagen);
          setEditImg(false);
        }
      }
    } catch {
      setExtractError("Error de red al consultar SHEIN.");
    } finally {
      setExtracting(false);
    }
  }

  function onPickEvid(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    if (f && !f.type.startsWith("image/")) {
      setError("La evidencia debe ser una imagen.");
      return;
    }
    if (f && f.size > 8 * 1024 * 1024) {
      setError("La imagen es muy grande (máx 8MB).");
      return;
    }
    setError("");
    setEvidFile(f);
    if (f) setEvidPreview(URL.createObjectURL(f));
  }

  async function save() {
    setError("");
    setSaving(true);
    try {
      let evidenciaUrl = item.precio_evidencia_url ?? "";
      if (evidFile) {
        const supabase = createClient();
        const ext = (evidFile.name.split(".").pop() || "jpg").toLowerCase();
        const path = `${item.pedido_id}/precio-${item.id}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("productos")
          .upload(path, evidFile, {
            upsert: true,
            contentType: evidFile.type,
          });
        if (upErr) {
          setError("No se pudo subir la evidencia: " + upErr.message);
          setSaving(false);
          return;
        }
        evidenciaUrl = supabase.storage
          .from("productos")
          .getPublicUrl(path).data.publicUrl;
      }

      const fd = new FormData();
      fd.set("itemId", item.id);
      fd.set("producto_nombre", nombre);
      fd.set("precio_real_usd", precio);
      fd.set("producto_imagen", imagen);
      if (evidenciaUrl) fd.set("precio_evidencia_url", evidenciaUrl);

      const res = await processItem({}, fd);
      if (res?.error) {
        setError(res.error);
        setSaving(false);
        return;
      }
      setOk(true);
      setSaving(false);
      router.refresh();
    } catch {
      setError("Error al guardar el item.");
      setSaving(false);
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
        guardado
          ? "border-accent/40 bg-accent/[0.04]"
          : "border-border bg-surface",
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-muted">
            Producto {index + 1}
            {sugerencia && (
              <span className="ml-1 text-accent">· {sugerencia}</span>
            )}
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

      <div className="flex flex-col gap-3">
        <Field label="Nombre del producto">
          <Input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder={sugerencia || "Nombre real del producto"}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Precio real (USD)">
            <Input
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

        {/* Product image */}
        <div>
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted">
            Imagen del producto
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

        {/* Price evidence (screenshot showing the price) */}
        <div>
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted">
            Evidencia de precio (captura con el precio)
          </span>
          {evidPreview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={evidPreview}
              alt="Evidencia de precio"
              className="mb-2 max-h-44 w-full rounded-xl border border-border bg-bg object-contain"
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={onPickEvid}
            className="block w-full text-sm text-muted file:mr-3 file:rounded-full file:border-0 file:bg-bg file:px-4 file:py-2 file:text-sm file:font-bold file:text-text"
          />
        </div>

        {error && <Alert tone="error">{error}</Alert>}

        <button
          type="button"
          onClick={save}
          disabled={saving}
          className={cn(
            "rounded-full px-5 py-2.5 text-sm font-bold transition disabled:opacity-50",
            guardado
              ? "bg-accent text-white hover:opacity-90"
              : "bg-primary text-white hover:opacity-90",
          )}
        >
          {saving
            ? "Guardando…"
            : guardado
              ? "Guardado · actualizar"
              : "Guardar item"}
        </button>
      </div>
    </div>
  );
}
