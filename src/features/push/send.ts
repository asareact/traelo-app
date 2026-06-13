import "server-only";
import webpush from "web-push";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PushPayload } from "./mensajes";

/**
 * Web Push sender. Uses the service-role admin client (bypasses RLS) to read
 * subscribers' endpoints, then web-push to deliver. Configured lazily from env;
 * if VAPID isn't set yet, every send is a safe no-op (so the app runs before push
 * is wired in Vercel). All sends are best-effort and never throw to the caller —
 * a failed push must not break the order action that triggered it.
 */
let configured: boolean | null = null;

function vapidReady(): boolean {
  if (configured !== null) return configured;
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:soporte@traelo.app";
  if (!pub || !priv) {
    configured = false;
    return false;
  }
  webpush.setVapidDetails(subject, pub, priv);
  configured = true;
  return true;
}

type Row = { endpoint: string; p256dh: string; auth: string };

async function enviarARows(rows: Row[], payload: PushPayload): Promise<void> {
  if (!rows.length) return;
  const admin = createAdminClient();
  const body = JSON.stringify(payload);
  await Promise.all(
    rows.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          body,
        );
      } catch (err: unknown) {
        const status = (err as { statusCode?: number }).statusCode;
        // 404/410 = the subscription is gone (uninstalled / unsubscribed) → prune.
        if (status === 404 || status === 410) {
          await admin
            .from("push_subscriptions")
            .delete()
            .eq("endpoint", s.endpoint);
        }
        // Any other error is swallowed — best-effort delivery.
      }
    }),
  );
}

/** Send a push to every device of one user. No-op if VAPID isn't configured. */
export async function enviarPushAUsuario(
  userId: string,
  payload: PushPayload,
): Promise<void> {
  if (!vapidReady()) return;
  const admin = createAdminClient();
  const { data } = await admin
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .eq("user_id", userId);
  await enviarARows((data ?? []) as Row[], payload);
}

/** Send a push to every admin (e.g. a new order landed). No-op without VAPID. */
export async function enviarPushAAdmins(payload: PushPayload): Promise<void> {
  if (!vapidReady()) return;
  const admin = createAdminClient();
  const { data: admins } = await admin
    .from("profiles")
    .select("id")
    .eq("rol", "admin");
  const ids = (admins ?? []).map((a) => a.id as string);
  if (!ids.length) return;
  const { data } = await admin
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .in("user_id", ids);
  await enviarARows((data ?? []) as Row[], payload);
}
