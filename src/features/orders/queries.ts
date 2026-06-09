import "server-only";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  EstadoPedido,
  Pedido,
  PedidoCompleto,
  PedidoItem,
} from "@/types/database";

/** Order summary for the "my orders" list — header + item count. */
export interface PedidoResumen extends Pedido {
  total_items: number;
}

/**
 * The logged-in user's orders, newest first. RLS scopes this to the caller.
 * Returns [] when not authenticated.
 */
export async function getMisPedidos(): Promise<PedidoResumen[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("pedidos")
    .select("*, pedido_items(count)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((row) => {
    const { pedido_items, ...pedido } = row as Pedido & {
      pedido_items: { count: number }[];
    };
    return { ...pedido, total_items: pedido_items?.[0]?.count ?? 0 };
  });
}

/**
 * Full order by id for the PUBLIC tracking page. Uses the admin client to skip
 * RLS by design: anyone holding the unguessable order UUID can view its status
 * (package-tracking model). Returns null for a malformed id or missing order.
 */
export async function getPublicPedido(
  id: string,
): Promise<PedidoCompleto | null> {
  if (!z.string().uuid().safeParse(id).success) return null;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("pedidos")
    .select("*, pedido_items(*), estados_pedido(*)")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;

  const row = data as Pedido & {
    pedido_items: PedidoItem[];
    estados_pedido: EstadoPedido[];
  };

  return {
    ...row,
    items: [...(row.pedido_items ?? [])].sort((a, b) =>
      a.created_at.localeCompare(b.created_at),
    ),
    historial: [...(row.estados_pedido ?? [])].sort((a, b) =>
      a.created_at.localeCompare(b.created_at),
    ),
  };
}
