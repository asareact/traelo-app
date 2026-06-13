import { z } from "zod";

/**
 * Public environment — inlined into the client bundle at build time.
 * Each var is referenced explicitly so Next can statically replace it.
 * Validated once at module load; a missing/invalid var fails the build loudly
 * instead of surfacing as a cryptic runtime error in the browser.
 */
const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  // Web Push public (VAPID) key. Optional: when unset, the notification UI hides
  // and the server send path no-ops, so the app works before push is configured.
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: z.string().optional(),
});

export const env = clientSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
});
