import "server-only";
import { z } from "zod";

/**
 * Server-only secrets. The `server-only` import makes the build fail if this
 * module is ever imported into a Client Component — the service_role key must
 * never reach the browser.
 */
const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  // Shared secret for the scheduled cleanup endpoint (Vercel Cron sends it as a
  // Bearer token). Optional in dev; required for the cron route to run.
  CRON_SECRET: z.string().optional(),
  // Token for the cubanomic exchange-rate API (informal CUP rates). Has a
  // working default so it runs out of the box; override via env if it rotates.
  CUBANOMIC_TOKEN: z.string().default("hRaCcY78gXC3k9WRv01pR7V1fgSxlg"),
});

export const serverEnv = serverSchema.parse({
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  CRON_SECRET: process.env.CRON_SECRET,
  CUBANOMIC_TOKEN: process.env.CUBANOMIC_TOKEN,
});
