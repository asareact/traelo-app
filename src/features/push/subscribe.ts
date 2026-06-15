import { env } from "@/lib/env";
import { guardarSuscripcion, eliminarSuscripcion } from "./actions";

/**
 * Client-side push subscription helpers, shared by the manual toggle and the
 * automatic on-login subscribe. Browser-only (guarded); all entry points are
 * safe to call where push isn't available (they return "unsupported"/"off").
 */
export type EstadoPush = "unsupported" | "off" | "on" | "denied";

/** base64url VAPID key → Uint8Array the Push API wants (BufferSource, TS 5.7+). */
function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const buffer = new ArrayBuffer(raw.length);
  const arr = new Uint8Array(buffer);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

export function pushSoportado(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window &&
    !!env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  );
}

/** Current state WITHOUT prompting (for rendering the toggle / deciding to auto-ask). */
export async function estadoPush(): Promise<EstadoPush> {
  if (!pushSoportado()) return "unsupported";
  if (Notification.permission === "denied") return "denied";
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    return sub && Notification.permission === "granted" ? "on" : "off";
  } catch {
    return "off";
  }
}

/**
 * Request permission (only if not decided yet) + subscribe + persist. Idempotent:
 * reuses an existing subscription. Returns the resulting state. Never throws
 * (Safari rejects requestPermission off a user gesture — caught → "off").
 */
export async function activarPush(): Promise<EstadoPush> {
  const vapid = env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!pushSoportado() || !vapid) return "unsupported";
  try {
    let permiso = Notification.permission;
    if (permiso === "default") permiso = await Notification.requestPermission();
    if (permiso !== "granted") return permiso === "denied" ? "denied" : "off";

    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapid),
      });
    }
    const res = await guardarSuscripcion(sub.toJSON());
    return res.ok ? "on" : "off";
  } catch {
    return "off";
  }
}

/** Unsubscribe on this device + drop it server-side. */
export async function desactivarPush(): Promise<void> {
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      await eliminarSuscripcion(sub.endpoint);
      await sub.unsubscribe();
    }
  } catch {
    // ignore
  }
}
