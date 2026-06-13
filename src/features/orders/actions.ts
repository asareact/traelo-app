"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  ESTADO_INICIAL,
  permiteEdicionCliente,
  type Estado,
} from "@/features/orders/domain/estados";
import { createOrderSchema } from "@/features/orders/schemas";
import {
  completarPerfilHref,
  isProfileComplete,
} from "@/features/profile/domain";
import { enviarPushAAdmins } from "@/features/push/send";
import { pushNuevoPedido, pushPedidoEditado } from "@/features/push/mensajes";

export type CreateOrderState = { error?: string };

/**
 * Create a new order (a quote request) for the logged-in user.
 * The client owns the order + its items — written via the RLS-gated client.
 * State history is appended later by the admin (estados_pedido is admin-write).
 * The initial COTIZACION milestone is synthesized from pedidos.created_at.
 *
 * The form submits items as a JSON string in `items_json` to avoid brittle
 * nested-FormData parsing. We re-validate that payload here (trust boundary).
 */
export async function createOrder(
  _prev: CreateOrderState,
  formData: FormData,
): Promise<CreateOrderState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/pedidos/nuevo");

  // Gate (trust boundary): name + phone must be set before an order is created,
  // even if the user bypassed the page-level check.
  const { data: profile } = await supabase
    .from("profiles")
    .select("nombre, telefono")
    .eq("id", user.id)
    .single();
  if (!isProfileComplete(profile)) {
    redirect(completarPerfilHref("/pedidos/nuevo"));
  }

  let rawItems: unknown;
  try {
    rawItems = JSON.parse(String(formData.get("items_json") || "[]"));
  } catch {
    return { error: "No pudimos leer el formulario. Recarga e intenta de nuevo." };
  }

  const parsed = createOrderSchema.safeParse({ items: rawItems });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisa los datos del pedido." };
  }

  // The client mints the order id so its WhatsApp message can carry the tracking
  // link. Accept it only if it's a valid UUID; otherwise let the DB generate one.
  const rawId = String(formData.get("id") || "");
  const id = z.string().uuid().safeParse(rawId).success ? rawId : undefined;

  // Insert the order header.
  const { data: pedido, error: pedidoError } = await supabase
    .from("pedidos")
    .insert({
      user_id: user.id,
      estado_actual: ESTADO_INICIAL,
      ...(id ? { id } : {}),
    })
    .select("id")
    .single();

  if (pedidoError || !pedido) {
    return { error: "No se pudo crear el pedido. Intenta de nuevo." };
  }

  // Insert the items.
  const items = parsed.data.items.map((it) => ({
    pedido_id: pedido.id,
    shein_url: it.shein_url,
    talla: it.talla || null,
    color: it.color || null,
    cantidad: it.cantidad,
    notas_cliente: it.notas_cliente || null,
  }));

  const { error: itemsError } = await supabase.from("pedido_items").insert(items);

  if (itemsError) {
    // Roll back the orphan header so we don't leave an empty order.
    await supabase.from("pedidos").delete().eq("id", pedido.id);
    return { error: "No se pudieron guardar los productos. Intenta de nuevo." };
  }

  // Real-time push to the admin(s) — more reliable than depending on the client
  // to actually send the prefilled WhatsApp. Best-effort (no-op without VAPID).
  await enviarPushAAdmins(
    pushNuevoPedido(
      pedido.id,
      profile?.nombre ?? null,
      parsed.data.items.length,
    ),
  );

  revalidatePath("/pedidos");
  redirect(`/pedidos/${pedido.id}?nuevo=1`);
}

/**
 * Load an order's owner + state, verifying the caller owns it and it's still in
 * the editable (quote) window. Shared trust-boundary guard for client edit/
 * delete. Uses the admin client because the writes that follow touch the
 * admin-write order header — so we must check ownership ourselves here. Returns
 * the user/admin handles on success, or an error string the action can return.
 */
async function authorizeOwnerEdit(pedidoId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  if (!z.string().uuid().safeParse(pedidoId).success) {
    return { error: "Pedido inválido." as const };
  }

  const admin = createAdminClient();
  const { data: pedido } = await admin
    .from("pedidos")
    .select("user_id, estado_actual")
    .eq("id", pedidoId)
    .maybeSingle();

  // Same copy for "not found" and "not yours" — don't leak that the order exists.
  if (!pedido || pedido.user_id !== user.id) {
    return { error: "No encontramos ese pedido." as const };
  }
  if (!permiteEdicionCliente(pedido.estado_actual as Estado)) {
    return { error: "Este pedido ya no se puede modificar." as const };
  }

  return {
    admin,
    estado: pedido.estado_actual as Estado,
    userId: pedido.user_id as string,
  };
}

/**
 * Replace the items of one of the caller's own orders (the edit form re-submits
 * the whole product list). Only allowed in the quote window. Editing voids any
 * price the admin had set: the order total is cleared and, if it had already
 * moved past COTIZACION, it's sent back there with a history note.
 */
export async function updateOrder(
  _prev: CreateOrderState,
  formData: FormData,
): Promise<CreateOrderState> {
  const pedidoId = String(formData.get("pedidoId") || "");

  let rawItems: unknown;
  try {
    rawItems = JSON.parse(String(formData.get("items_json") || "[]"));
  } catch {
    return { error: "No pudimos leer el formulario. Recarga e intenta de nuevo." };
  }
  const parsed = createOrderSchema.safeParse({ items: rawItems });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisa los datos del pedido." };
  }

  const auth = await authorizeOwnerEdit(pedidoId);
  if ("error" in auth) return { error: auth.error };
  const { admin, estado, userId } = auth;

  // Swap the item set (delete-all + insert). Items are recreated fresh, so any
  // admin processing on them (name/price/image) is dropped — that's the reset.
  const { error: delErr } = await admin
    .from("pedido_items")
    .delete()
    .eq("pedido_id", pedidoId);
  if (delErr) {
    return { error: "No se pudo actualizar el pedido. Intenta de nuevo." };
  }

  const items = parsed.data.items.map((it) => ({
    pedido_id: pedidoId,
    shein_url: it.shein_url,
    talla: it.talla || null,
    color: it.color || null,
    cantidad: it.cantidad,
    notas_cliente: it.notas_cliente || null,
  }));
  const { error: insErr } = await admin.from("pedido_items").insert(items);
  if (insErr) {
    return { error: "No se pudieron guardar los productos. Intenta de nuevo." };
  }

  // Clear the (now stale) total and reset to COTIZACION. Append history only if
  // it actually moved back, so a plain edit in COTIZACION doesn't spam the log.
  const volvioACotizacion = estado !== "COTIZACION";
  await admin
    .from("pedidos")
    .update({
      total_real_usd: null,
      estado_actual: ESTADO_INICIAL,
      updated_at: new Date().toISOString(),
    })
    .eq("id", pedidoId);
  if (volvioACotizacion) {
    await admin.from("estados_pedido").insert({
      pedido_id: pedidoId,
      estado: ESTADO_INICIAL,
      nota: "El cliente editó el pedido; vuelve a cotización.",
    });
  }

  // Notify admins that the order changed and needs a re-quote. Best-effort.
  const { data: cli } = await admin
    .from("profiles")
    .select("nombre")
    .eq("id", userId)
    .single();
  await enviarPushAAdmins(pushPedidoEditado(pedidoId, cli?.nombre ?? null));

  revalidatePath(`/pedidos/${pedidoId}`);
  revalidatePath("/pedidos");
  redirect(`/pedidos/${pedidoId}`);
}

/**
 * Delete one of the caller's own orders, only while it's still in the quote
 * window. The DB cascades to items + state history (FK on delete cascade).
 */
export async function deleteOrder(
  _prev: CreateOrderState,
  formData: FormData,
): Promise<CreateOrderState> {
  const pedidoId = String(formData.get("pedidoId") || "");

  const auth = await authorizeOwnerEdit(pedidoId);
  if ("error" in auth) return { error: auth.error };
  const { admin } = auth;

  const { error } = await admin.from("pedidos").delete().eq("id", pedidoId);
  if (error) {
    return { error: "No se pudo eliminar el pedido. Intenta de nuevo." };
  }

  revalidatePath("/pedidos");
  redirect("/pedidos");
}
