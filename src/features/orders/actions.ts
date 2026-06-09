"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ESTADO_INICIAL } from "@/features/orders/domain/estados";
import { createOrderSchema } from "@/features/orders/schemas";

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

  // Insert the order header.
  const { data: pedido, error: pedidoError } = await supabase
    .from("pedidos")
    .insert({ user_id: user.id, estado_actual: ESTADO_INICIAL })
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

  revalidatePath("/pedidos");
  redirect(`/pedidos/${pedido.id}?nuevo=1`);
}
