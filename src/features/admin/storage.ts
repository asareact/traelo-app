import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

/** Buckets that hold per-order files (path prefix = the order id). */
const ORDER_BUCKETS = ["productos", "evidencias"] as const;

/**
 * Delete every stored file for an order (product images + evidence photos).
 * Best-effort and idempotent — listing an empty/missing folder is a no-op, so
 * it's safe to call from both the cancel path and the scheduled cleanup. Accepts
 * any Supabase client (the RLS server client for an admin action, or the
 * service-role client for the cron job).
 */
export async function borrarArchivosPedido(
  client: SupabaseClient,
  pedidoId: string,
): Promise<void> {
  for (const bucket of ORDER_BUCKETS) {
    try {
      const { data } = await client.storage.from(bucket).list(pedidoId);
      if (data && data.length) {
        await client.storage
          .from(bucket)
          .remove(data.map((f) => `${pedidoId}/${f.name}`));
      }
    } catch {
      /* best-effort cleanup */
    }
  }
}
