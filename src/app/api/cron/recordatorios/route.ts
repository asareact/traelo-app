import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { serverEnv } from "@/lib/env.server";
import { notificarUsuario } from "@/features/notifications/notificar";
import {
  pushPagoRecordatorio,
  pushRecogidaRecordatorio,
  type PushPayload,
} from "@/features/push/mensajes";
import type { Estado } from "@/features/orders/domain/estados";

/**
 * GET /api/cron/recordatorios — scheduled (Vercel Cron, daily). Push reminders
 * for orders that are stuck:
 *   - awaiting payment (PENDIENTE_PAGO) for more than 2 days, and
 *   - ready for pickup (DISPONIBLE_ENTREGA) for more than 3 days.
 *
 * "Stuck since" is read from the state history (estados_pedido), like the cleanup
 * cron. Re-reminds at most every 3 days via pedidos.recordatorio_at, so the daily
 * run doesn't spam. Push is a no-op if VAPID isn't configured. Same CRON_SECRET
 * auth as /api/cron/cleanup.
 */
const DIA = 24 * 60 * 60 * 1000;
const GRACIA_PAGO = 2 * DIA;
const GRACIA_RECOGIDA = 3 * DIA;
const THROTTLE = 3 * DIA;

type Admin = ReturnType<typeof createAdminClient>;

async function recordar(
  admin: Admin,
  estado: Estado,
  graciaMs: number,
  payload: (pedidoId: string) => PushPayload,
): Promise<number> {
  const ahora = Date.now();
  const cutoffEntrada = new Date(ahora - graciaMs).toISOString();
  const cutoffThrottle = new Date(ahora - THROTTLE).toISOString();

  // Orders that entered `estado` before the grace cutoff…
  const { data: eventos } = await admin
    .from("estados_pedido")
    .select("pedido_id, created_at")
    .eq("estado", estado)
    .lt("created_at", cutoffEntrada);
  const ids = [...new Set((eventos ?? []).map((e) => e.pedido_id as string))];
  if (!ids.length) return 0;

  // …that are STILL in that state and weren't reminded in the throttle window.
  const { data: pedidos } = await admin
    .from("pedidos")
    .select("id, user_id, recordatorio_at")
    .eq("estado_actual", estado)
    .in("id", ids);

  const elegibles = (pedidos ?? []).filter(
    (p) => !p.recordatorio_at || (p.recordatorio_at as string) < cutoffThrottle,
  );

  let enviados = 0;
  for (const p of elegibles) {
    await notificarUsuario(
      p.user_id as string,
      "recordatorio",
      payload(p.id as string),
      p.id as string,
    );
    await admin
      .from("pedidos")
      .update({ recordatorio_at: new Date().toISOString() })
      .eq("id", p.id);
    enviados++;
  }
  return enviados;
}

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
  const pago = await recordar(
    admin,
    "PENDIENTE_PAGO",
    GRACIA_PAGO,
    pushPagoRecordatorio,
  );
  const recogida = await recordar(
    admin,
    "DISPONIBLE_ENTREGA",
    GRACIA_RECOGIDA,
    pushRecogidaRecordatorio,
  );

  return NextResponse.json({ pago, recogida });
}
