"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { PedidoItem } from "@/types/database";
import {
  totalPedido,
  totalPedidoConTipo,
  aplicaExpress,
  recargoExpress,
  type TipoEnvio,
} from "@/features/orders/domain/pricing";
import {
  processItemSchema,
  advanceStateSchema,
  registrarPesoSchema,
  setTipoEnvioSchema,
  configSchema,
} from "./schemas";
import { borrarArchivosPedido } from "./storage";

/** Per-pound shipping rate from config (USD), with a safe default. */
const DEFAULT_PRECIO_POR_LB = 7;
async function getPrecioPorLb(supabase: SBClient): Promise<number> {
  const { data } = await supabase
    .from("config")
    .select("value")
    .eq("key", "precio_por_lb")
    .single();
  const n = data ? Number(data.value) : NaN;
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_PRECIO_POR_LB;
}

/** Per-pound EXPRESS surcharge from config (USD), with a safe default. The
 *  default = ~$1.15 forwarder express extra + ~$1.50 service fee (ROADMAP §6). */
const DEFAULT_RECARGO_EXPRESS = 2.65;
async function getRecargoExpressPorLb(supabase: SBClient): Promise<number> {
  const { data } = await supabase
    .from("config")
    .select("value")
    .eq("key", "recargo_express_por_lb")
    .single();
  const n = data ? Number(data.value) : NaN;
  return Number.isFinite(n) && n >= 0 ? n : DEFAULT_RECARGO_EXPRESS;
}

export type AdminActionState = {
  error?: string;
  ok?: boolean;
  /** True when this save changed an already-set price (client was re-quoted). */
  precioCambio?: boolean;
  /** The recomputed order total (products + shipping) after saving a weight. */
  total?: number | null;
  /** EXPRESS upgrade (only for 10+ lb): the per-order surcharge and the total
   *  with express. Null when the order doesn't qualify or has no priced items. */
  recargoExpress?: number | null;
  totalExpress?: number | null;
  /** The order's shipping type after the write (for client messages / UI). */
  tipoEnvio?: TipoEnvio | null;
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
    // Grand total = product subtotal + shipping (if the weight is already known,
    // e.g. re-processing an item after the package was weighed). Reading peso_lb
    // here keeps the shipping charge from being wiped on a re-process.
    const { data: pedido } = await supabase
      .from("pedidos")
      .select("estado_actual, peso_lb")
      .eq("id", pedidoId)
      .single();

    const precioPorLb = await getPrecioPorLb(supabase);
    const total = totalPedido(all, pedido?.peso_lb ?? null, precioPorLb);
    if (total !== null) {
      await supabase
        .from("pedidos")
        .update({ total_real_usd: total })
        .eq("id", pedidoId);
    }

    // Advance to "precio enviado" only from the quote stage (don't rewind).
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

  // Now that the weight is known, fold the shipping cost into the order total
  // (product subtotal + peso × precio_por_lb). This is what makes the client's
  // cost breakdown and the total-to-pay reflect the pounds.
  const { data: items } = await supabase
    .from("pedido_items")
    .select("cantidad, precio_real_usd")
    .eq("pedido_id", pedidoId);
  // Honor the order's current shipping type so re-weighing an EXPRESS order keeps
  // its surcharge (doesn't silently revert it to standard).
  const { data: pedido } = await supabase
    .from("pedidos")
    .select("tipo_envio")
    .eq("id", pedidoId)
    .single();
  const tipoEnvio = (pedido?.tipo_envio ?? "estandar") as TipoEnvio;
  const precioPorLb = await getPrecioPorLb(supabase);
  const recargoPorLb = await getRecargoExpressPorLb(supabase);
  const itemsArr = (items ?? []) as Pick<
    PedidoItem,
    "cantidad" | "precio_real_usd"
  >[];
  const total = totalPedidoConTipo(
    itemsArr,
    peso_lb,
    precioPorLb,
    tipoEnvio,
    recargoPorLb,
  );
  if (total !== null) {
    await supabase
      .from("pedidos")
      .update({ total_real_usd: total })
      .eq("id", pedidoId);
  }

  // Offer the express upgrade in the WhatsApp notice only when the order is still
  // standard and qualifies (10+ lb). If it's already express, the total above
  // already includes the surcharge — nothing to offer.
  let recargoExpressUsd: number | null = null;
  let totalExpress: number | null = null;
  if (total !== null && tipoEnvio === "estandar" && aplicaExpress(peso_lb)) {
    recargoExpressUsd = recargoExpress(peso_lb, recargoPorLb);
    totalExpress = Number((total + recargoExpressUsd).toFixed(2));
  }

  revalidatePath("/admin/kanban");
  return {
    ok: true,
    total,
    recargoExpress: recargoExpressUsd,
    totalExpress,
    tipoEnvio,
  };
}

/**
 * Set the shipping type (standard ⇆ express) on an order and recompute its total
 * accordingly. Express is the upgrade the client accepts by WhatsApp; it requires
 * a known weight of 10+ lb. This is the write that turns the verbal "sí, lo quiero
 * express" into a real change: tipo_envio + total_real_usd both update.
 */
export async function setTipoEnvio(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const parsed = setTipoEnvioSchema.safeParse({
    pedidoId: formData.get("pedidoId"),
    tipo_envio: formData.get("tipo_envio"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const { supabase, ok } = await requireAdmin();
  if (!ok) return { error: "No autorizado." };

  const { pedidoId, tipo_envio } = parsed.data;

  const { data: pedido } = await supabase
    .from("pedidos")
    .select("peso_lb")
    .eq("id", pedidoId)
    .single();
  if (!pedido) return { error: "Pedido no encontrado." };

  if (tipo_envio === "express" && !aplicaExpress(pedido.peso_lb)) {
    return { error: "El express solo aplica a pedidos de 10+ lb ya pesados." };
  }

  const { data: items } = await supabase
    .from("pedido_items")
    .select("cantidad, precio_real_usd")
    .eq("pedido_id", pedidoId);
  const precioPorLb = await getPrecioPorLb(supabase);
  const recargoPorLb = await getRecargoExpressPorLb(supabase);
  const total = totalPedidoConTipo(
    (items ?? []) as Pick<PedidoItem, "cantidad" | "precio_real_usd">[],
    pedido.peso_lb,
    precioPorLb,
    tipo_envio,
    recargoPorLb,
  );

  const update: Record<string, unknown> = { tipo_envio };
  if (total !== null) update.total_real_usd = total;
  const { error } = await supabase
    .from("pedidos")
    .update(update)
    .eq("id", pedidoId);
  if (error) return { error: "No se pudo cambiar el tipo de envío." };

  revalidatePath("/admin/kanban");
  return { ok: true, total, tipoEnvio: tipo_envio };
}

/** Update the business config (whatsapp phone, price per lb, markup factor). */
export async function updateConfig(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const parsed = configSchema.safeParse({
    whatsapp_phone: formData.get("whatsapp_phone"),
    precio_por_lb: formData.get("precio_por_lb"),
    recargo_express_por_lb: formData.get("recargo_express_por_lb"),
    markup_factor: formData.get("markup_factor"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const { supabase, ok } = await requireAdmin();
  if (!ok) return { error: "No autorizado." };

  const rows = [
    { key: "whatsapp_phone", value: parsed.data.whatsapp_phone },
    { key: "precio_por_lb", value: parsed.data.precio_por_lb.toFixed(2) },
    {
      key: "recargo_express_por_lb",
      value: parsed.data.recargo_express_por_lb.toFixed(2),
    },
    { key: "markup_factor", value: String(parsed.data.markup_factor) },
  ];
  const { error } = await supabase.from("config").upsert(rows, {
    onConflict: "key",
  });
  if (error) return { error: "No se pudo guardar la configuración." };

  revalidatePath("/admin/config");
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

  // Cancelled orders are dead → free their files now. Delivered orders keep
  // their files for a grace period (the client may still want the tracking
  // proof); the scheduled cleanup (/api/cron/cleanup) removes them after 2 days.
  if (nuevoEstado === "CANCELADO") {
    await borrarArchivosPedido(supabase, pedidoId);
  }

  revalidatePath("/admin/kanban");
  return { ok: true };
}
