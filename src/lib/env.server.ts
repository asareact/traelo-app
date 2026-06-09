import "server-only";
import { z } from "zod";

/**
 * Server-only secrets. The `server-only` import makes the build fail if this
 * module is ever imported into a Client Component — the service_role key must
 * never reach the browser.
 */
const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
});

export const serverEnv = serverSchema.parse({
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
});
