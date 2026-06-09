import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { serverEnv } from "@/lib/env.server";

/**
 * Admin client using the service_role key. Server-side ONLY — `server-only`
 * guarantees it can never be bundled into the browser.
 *
 * Bypasses RLS. Use ONLY for:
 *  - privileged writes (state transitions, role changes)
 *  - reads that must skip RLS by design, e.g. the public tracking page
 *    (anyone with the unguessable order UUID can view its status).
 *
 * Never use this to serve data filtered only by the logged-in user — that is
 * what the RLS-gated server client (`@/lib/supabase/server`) is for.
 */
export function createAdminClient() {
  return createSupabaseClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    serverEnv.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
