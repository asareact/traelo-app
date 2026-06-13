import { z } from "zod";

/**
 * A browser PushSubscription serialized via `subscription.toJSON()`. Validated
 * server-side (trust boundary) before it's stored.
 */
export const pushSubscriptionSchema = z.object({
  endpoint: z.string().url().max(2000),
  keys: z.object({
    p256dh: z.string().min(1).max(500),
    auth: z.string().min(1).max(500),
  }),
});

export type PushSubscriptionJSON = z.infer<typeof pushSubscriptionSchema>;
