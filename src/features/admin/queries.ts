import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Estado } from "@/features/orders/domain/estados";
import type { Pedido, PedidoItem } from "@/types/database";

/** An order as shown on the admin board: header + items + client contact. */
export interface KanbanPedido extends Pedido {
  items: PedidoItem[];
  cliente: { nombre: string | null; telefono: string | null } | null;
  total_items: number;
  items_procesados: number;
}

async function isCallerAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase
    .from("profiles")
    .select("rol")
    .eq("id", user.id)
    .single();
  return data?.rol === "admin";
}

/**
 * All orders for the admin board, newest first, each with its items and the
 * client's name/phone. RLS already scopes reads to admins (is_admin()), but we
 * also gate explicitly so a non-admin gets nothing rather than their own rows.
 *
 * profiles isn't FK-joinable from pedidos (both reference auth.users), so we
 * fetch the client profiles in a second query and merge in memory.
 */
export async function getKanbanPedidos(): Promise<KanbanPedido[]> {
  if (!(await isCallerAdmin())) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pedidos")
    .select("*, pedido_items(*)")
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  const rows = data as (Pedido & { pedido_items: PedidoItem[] })[];

  const userIds = [...new Set(rows.map((r) => r.user_id))];
  const { data: perfiles } = await supabase
    .from("profiles")
    .select("id, nombre, telefono")
    .in("id", userIds);

  const byId = new Map(
    (perfiles ?? []).map((p) => [
      p.id,
      { nombre: p.nombre, telefono: p.telefono },
    ]),
  );

  return rows.map((row) => {
    const { pedido_items, ...pedido } = row;
    const items = [...(pedido_items ?? [])].sort((a, b) =>
      a.created_at.localeCompare(b.created_at),
    );
    return {
      ...pedido,
      estado_actual: pedido.estado_actual as Estado,
      items,
      cliente: byId.get(row.user_id) ?? null,
      total_items: items.length,
      items_procesados: items.filter((i) => i.procesado).length,
    };
  });
}

/** Counts for the stats bar: total orders + how many need attention. */
export interface KanbanStats {
  total: number;
  enRevision: number;
  sinProcesar: number;
  entregados: number;
}

export function statsDe(pedidos: KanbanPedido[]): KanbanStats {
  return {
    total: pedidos.length,
    enRevision: pedidos.filter((p) => p.estado_actual === "EN_REVISION").length,
    sinProcesar: pedidos.filter(
      (p) => p.items_procesados < p.total_items && p.estado_actual !== "CANCELADO",
    ).length,
    entregados: pedidos.filter((p) => p.estado_actual === "ENTREGADO").length,
  };
}
