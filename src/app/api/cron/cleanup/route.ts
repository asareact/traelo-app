import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { serverEnv } from "@/lib/env.server";
import { borrarArchivosPedido } from "@/features/admin/storage";

/**
 * GET /api/cron/cleanup — scheduled (Vercel Cron, daily). Deletes the stored
 * files (product images + evidence) of orders that have been DELIVERED for more
 * than 2 days, freeing storage while leaving a grace period for the client to
 * keep their tracking proof. Cancelled orders are cleaned immediately elsewhere.
 *
 * Auth: Vercel Cron sends `Authorization: Bearer <CRON_SECRET>`. We reject any
 * request that doesn't match, and refuse to run if no secret is configured.
 */
const DOS_DIAS_MS = 2 * 24 * 60 * 60 * 1000;

export async function GET(request: NextRequest) {
  const secret = serverEnv.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "CRON_SECRET no configurado." },
      { status: 500 },
    );
  }
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const admin = createAdminClient();
  const cutoff = new Date(Date.now() - DOS_DIAS_MS).toISOString();

  // Orders that reached ENTREGADO more than 2 days ago…
  const { data: eventos } = await admin
    .from("estados_pedido")
    .select("pedido_id, created_at")
    .eq("estado", "ENTREGADO")
    .lt("created_at", cutoff);

  const ids = [...new Set((eventos ?? []).map((e) => e.pedido_id as string))];
  if (!ids.length) return NextResponse.json({ limpiados: 0 });

  // …that are still delivered (not reopened/cancelled afterwards).
  const { data: pedidos } = await admin
    .from("pedidos")
    .select("id")
    .eq("estado_actual", "ENTREGADO")
    .in("id", ids);

  const aLimpiar = (pedidos ?? []).map((p) => p.id as string);
  for (const id of aLimpiar) {
    await borrarArchivosPedido(admin, id);
  }

  return NextResponse.json({ limpiados: aLimpiar.length });
}
