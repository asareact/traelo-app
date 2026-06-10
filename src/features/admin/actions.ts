"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { PedidoItem } from "@/types/database";
import {
  processItemSchema,
  advanceStateSchema,
  registrarPesoSchema,
} from "./schemas";

export type AdminActionState = {
  error?: string;
  ok?: boolean;
  /** True when this save changed an already-set price (client was re-quoted). */
  precioCambio?: boolean;
};

type SBClient = Awaited<ReturnType<typeof createClient>>;

/** True when the logged-in user is an admin (RLS also enforces this). */
async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, ok: false as const };
  const { data } = await supabase
    .from("profiles")
    .select("rol")
    .eq("id", user.id)
    .single();
  return { supabase, ok: data?.rol === "admin" };
}

/**
 * Re-host a product image in our `productos` bucket so the order keeps a valid
 * image even if the SHEIN CDN link rots. Best-effort: on any failure we keep the
 * original URL. Skips images already hosted by us. Stable path per item, so a
 * re-process overwrites the previous copy.
 */
async function persistProductImage(
  supabase: SBClient,
  pedidoId: string,
  itemId: string,
  sourceUrl: string | null | undefined,
): Promise<string | null> {
  if (!sourceUrl) return sourceUrl ?? null;
  if (sourceUrl.includes("/storage/v1/object/public/productos/"))
    return sourceUrl;
  try {
    const res = await fetch(sourceUrl, { cache: "no-store" });
    if (!res.ok) return sourceUrl;
    const contentType = res.headers.get("content-type") || "image/jpeg";
    if (!contentType.startsWith("image/")) return sourceUrl;
    const bytes = new Uint8Array(await res.arrayBuffer());
    const ext = contentType.includes("png")
      ? "png"
      : contentType.includes("webp")
        ? "webp"
        : "jpg";
    const path = `${pedidoId}/${itemId}.${ext}`;
    const { error } = await supabase.storage
      .from("productos")
      .upload(path, bytes, { contentType, upsert: true });
    if (error) return sourceUrl;
    return supabase.storage.from("productos").getPublicUrl(path).data.publicUrl;
  } catch {
    return sourceUrl;
  }
}

/** Delete all stored files for an order (product + evidence). Best-effort. */
async function limpiarArchivos(supabase: SBClient, pedidoId: string) {
  for (const bucket of ["productos", "evidencias"]) {
    try {
      const { data } = await supabase.storage.from(bucket).list(pedidoId);
      if (data && data.length) {
        await supabase.storage
          .from(bucket)
          .remove(data.map((f) => `${pedidoId}/${f.name}`));
      }
    } catch {
      /* best-effort cleanup */
    }
  }
}

/**
 * Save the admin-filled fields for one item (name + real price + image) and
 * mark it processed. If that completes the order (all items processed), set the
 * order total from the real prices and, if it's still in the quote stage, move
 * it to PRECIO_ACTUALIZADO via the atomic state RPC.
 */
export async function processItem(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const parsed = processItemSchema.safeParse({
    itemId: formData.get("itemId"),
    producto_nombre: formData.get("producto_nombre"),
    precio_real_usd: formData.get("precio_real_usd"),
    producto_imagen: formData.get("producto_imagen"),
    precio_evidencia_url: formData.get("precio_evidencia_url") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const { supabase, ok } = await requireAdmin();
  if (!ok) return { error: "No autorizado." };

  const {
    itemId,
    producto_nombre,
    precio_real_usd,
    producto_imagen,
    precio_evidencia_url,
  } = parsed.data;

  // Read current values to detect a price change worth notifying about.
  const { data: prev } = await supabase
    .from("pedido_items")
    .select("pedido_id, precio_real_usd")
    .eq("id", itemId)
    .single();
  if (!prev) return { error: "Item no encontrado." };
  const pedidoId = prev.pedido_id as string;
  const precioCambio =
    prev.precio_real_usd != null &&
    Number(prev.precio_real_usd) !== precio_real_usd;

  // Re-host the product image in our bucket (survives SHEIN CDN link rot).
  const imagenFinal = await persistProductImage(
    supabase,
    pedidoId,
    itemId,
    producto_imagen,
  );

  const update: Record<string, unknown> = {
    producto_nombre,
    precio_real_usd,
    producto_imagen: imagenFinal,
    procesado: true,
  };
  if (precio_evidencia_url) update.precio_evidencia_url = precio_evidencia_url;

  const { error: updErr } = await supabase
    .from("pedido_items")
    .update(update)
    .eq("id", itemId);

  if (updErr) {
    return { error: "No se pudo guardar el item." };
  }

  // Did this complete the order? Re-read its items.
  const { data: items } = await supabase
    .from("pedido_items")
    .select("cantidad, precio_real_usd, procesado")
    .eq("pedido_id", pedidoId);

  const all = (items ?? []) as Pick<
    PedidoItem,
    "cantidad" | "precio_real_usd" | "procesado"
  >[];
  const todosProcesados = all.length > 0 && all.every((i) => i.procesado);

  if (todosProcesados) {
    const total = all.reduce(
      (sum, i) => sum + (i.precio_real_usd ?? 0) * i.cantidad,
      0,
    );
    await supabase
      .from("pedidos")
      .update({ total_real_usd: Number(total.toFixed(2)) })
      .eq("id", pedidoId);

    // Advance to "precio enviado" only from the quote stage (don't rewind).
    const { data: pedido } = await supabase
      .from("pedidos")
      .select("estado_actual")
      .eq("id", pedidoId)
      .single();
    if (
      pedido?.estado_actual === "COTIZACION" ||
      pedido?.estado_actual === "EN_REVISION"
    ) {
      await supabase.rpc("update_order_state", {
        p_pedido_id: pedidoId,
        p_nuevo_estado: "PRECIO_ACTUALIZADO",
        p_nota: "Precios reales confirmados",
      });
    }
  }

  revalidatePath("/admin/kanban");
  return { ok: true, precioCambio };
}

/**
 * Save the package weight (+ optional evidence photo URL) on an order. The photo
 * itself is uploaded to Supabase Storage from the client first; here we only
 * persist its URL. Re-saving the weight alone keeps any existing photo.
 */
export async function registrarPeso(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const parsed = registrarPesoSchema.safeParse({
    pedidoId: formData.get("pedidoId"),
    peso_lb: formData.get("peso_lb"),
    evidencia_url: formData.get("evidencia_url") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const { supabase, ok } = await requireAdmin();
  if (!ok) return { error: "No autorizado." };

  const { pedidoId, peso_lb, evidencia_url } = parsed.data;
  const update: Record<string, unknown> = { peso_lb };
  if (evidencia_url) update.peso_evidencia_url = evidencia_url;

  const { error } = await supabase
    .from("pedidos")
    .update(update)
    .eq("id", pedidoId);

  if (error) return { error: "No se pudo guardar el peso." };

  revalidatePath("/admin/kanban");
  return { ok: true };
}

/** Move an order to a new state (atomic RPC: updates header + appends history). */
export async function advanceOrderState(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const parsed = advanceStateSchema.safeParse({
    pedidoId: formData.get("pedidoId"),
    nuevoEstado: formData.get("nuevoEstado"),
    nota: formData.get("nota") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const { supabase, ok } = await requireAdmin();
  if (!ok) return { error: "No autorizado." };

  const { pedidoId, nuevoEstado, nota } = parsed.data;
  const { error } = await supabase.rpc("update_order_state", {
    p_pedido_id: pedidoId,
    p_nuevo_estado: nuevoEstado,
    p_nota: nota || null,
  });

  if (error) return { error: "No se pudo cambiar el estado." };

  // Free storage once the order is closed (delivered) or cancelled.
  if (nuevoEstado === "CANCELADO" || nuevoEstado === "ENTREGADO") {
    await limpiarArchivos(supabase, pedidoId);
  }

  revalidatePath("/admin/kanban");
  return { ok: true };
}
